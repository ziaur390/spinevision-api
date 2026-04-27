import torch
model_path = r'C:\Users\ziaur\OneDrive\Desktop\final year project\SPINEVISION_AI\ai models\best_densenet121_spinexr_v5.pt'
data = torch.load(model_path, map_location='cpu')
for k, v in data['model_state'].items():
    if k.startswith('classifier') or k.startswith('attention') or k.startswith('gem'):
        print(f"{k}: {v.shape}")
