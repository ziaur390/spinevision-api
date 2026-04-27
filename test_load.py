import torch
import torchvision.models as models
import torch.nn as nn
import torch.nn.functional as F
from ultralytics import YOLO

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

try:
    densenet_path = "hf_space/best_densenet121_spinexr_v5.pt"
    d_data = torch.load(densenet_path, map_location='cpu')
    classes = d_data['classes']
    densenet_model = CustomSpineClassifier(num_classes=len(classes))
    densenet_model.load_state_dict(d_data['model_state'], strict=True)
    densenet_model.eval()
    print("DenseNet Loaded successfully.")
except Exception as e:
    print(f"DenseNet Failed: {e}")

try:
    yolo_path = "hf_space/spinexr_yolov9c_v6_best.pt"
    yolo_model = YOLO(yolo_path)
    print("YOLO Loaded successfully.")
except Exception as e:
    print(f"YOLO Failed: {e}")
