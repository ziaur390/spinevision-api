import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models

class SpineClassifier(nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
        base = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)
        self.features   = base.features
        self.classifier = nn.Sequential(
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        f = self.features(x)
        f = F.adaptive_avg_pool2d(f, (1, 1))
        f = torch.flatten(f, 1)
        return self.classifier(f)

model_path = r'C:\Users\ziaur\OneDrive\Desktop\final year project\SPINEVISION_AI\ai models\best_densenet121_spinexr_v5.pt'
data = torch.load(model_path, map_location='cpu')

model = SpineClassifier(num_classes=len(data['classes']))

try:
    missing, unexpected = model.load_state_dict(data['model_state'], strict=False)
    print("Model loaded with strict=False!")
    print(f"Missing keys: {len(missing)}")
    print(f"Unexpected keys: {len(unexpected)}")
    for k in unexpected:
        print("  Unexp:", k)
except Exception as e:
    print("Error loading state dict:", e)
