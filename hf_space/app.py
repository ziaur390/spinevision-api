from fastapi import FastAPI, File, UploadFile
import torch
import torchvision.models as models
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import io
from ultralytics import YOLO

# --- DenseNet Definitions ---
class CBAM(nn.Module):
    def __init__(self, channels, reduction=16):
        super(CBAM, self).__init__()
        self.fc = nn.Sequential(
            nn.Conv2d(channels, channels // reduction, 1, bias=False),
            nn.ReLU(inplace=True),
            nn.Conv2d(channels // reduction, channels, 1, bias=False)
        )
        self.spatial = nn.Sequential(
            nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=False)
        )

    def forward(self, x):
        avg_out = self.fc(F.adaptive_avg_pool2d(x, 1))
        max_out = self.fc(F.adaptive_max_pool2d(x, 1))
        channel_attn = torch.sigmoid(avg_out + max_out)
        x = x * channel_attn

        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        spatial_in = torch.cat([avg_out, max_out], dim=1)
        spatial_attn = torch.sigmoid(self.spatial(spatial_in))
        x = x * spatial_attn
        return x

class GeM(nn.Module):
    def __init__(self, p=3, eps=1e-6):
        super(GeM, self).__init__()
        self.p = nn.Parameter(torch.ones(1) * p)
        self.eps = eps

    def forward(self, x):
        return F.avg_pool2d(x.clamp(min=self.eps).pow(self.p), (x.size(-2), x.size(-1))).pow(1. / self.p)

class CustomSpineClassifier(nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
        base = models.densenet121()
        self.features = base.features
        
        self.attention = CBAM(1024)
        self.gem = GeM()
        
        self.classifier = nn.Sequential(
            nn.Dropout(p=0.25),
            nn.BatchNorm1d(1024),
            nn.Dropout(p=0.5),
            nn.Linear(1024, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(p=0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        f = self.features(x)
        f = F.relu(f, inplace=True)
        f = self.attention(f)
        f = self.gem(f)
        f = torch.flatten(f, 1)
        return self.classifier(f)

# --- App Setup ---
app = FastAPI()

# Load models safely
try:
    # DenseNet
    densenet_path = "best_densenet121_spinexr_v5.pt"
    d_data = torch.load(densenet_path, map_location='cpu')
    classes = d_data['classes']
    densenet_model = CustomSpineClassifier(num_classes=len(classes))
    densenet_model.load_state_dict(d_data['model_state'], strict=True)
    densenet_model.eval()

    # YOLO
    yolo_path = "spinexr_yolov9c_v6_best.pt"
    yolo_model = YOLO(yolo_path)
    models_loaded = True
    load_error = None
except Exception as e:
    import traceback
    load_error = traceback.format_exc()
    print(f"Failed to load models:\n{load_error}")
    models_loaded = False

from torchvision import transforms
img_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not models_loaded:
        return {"error": f"Models are not loaded on the server. Details: {load_error}"}
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    
    # 1. Run YOLO
    results = yolo_model(image)
    boxes = []
    for r in results:
        for box in r.boxes:
            b = box.xyxy[0].tolist()
            c = box.cls.item()
            conf = box.conf.item()
            boxes.append({
                "label": yolo_model.names[c],
                "confidence": conf,
                "bbox": b # [x1, y1, x2, y2]
            })
    
    # 2. Run DenseNet
    tensor = img_transforms(image).unsqueeze(0)
    with torch.no_grad():
        outputs = densenet_model(tensor)
        probs = torch.softmax(outputs, dim=1)[0].tolist()
    
    classification = []
    for i, c in enumerate(classes):
        classification.append({
            "label": c,
            "probability": probs[i]
        })
        
    return {
        "bounding_boxes": boxes,
        "classification": classification,
        "image_size": image.size
    }

@app.get("/")
def read_root():
    return {"status": "Model microservice is running"}
