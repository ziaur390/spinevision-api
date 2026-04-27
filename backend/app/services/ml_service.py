"""
Machine Learning Service for SPINEVISION-AI.

This module now integrates with the real AI models (DenseNet121 and YOLOv9)
hosted on Hugging Face Spaces!
"""

import io
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import httpx

from app.config import get_settings

settings = get_settings()

class MLService:
    def __init__(self):
        self.model_version = "v2.0 (DenseNet+YOLO HF)"
        self.hf_api_url = "https://ziaur390-spinevision-ml-api.hf.space/analyze"
        print(f"✓ ML Service initialized (Model Version: {self.model_version}) connected to HF Space.")
    
    def _generate_real_heatmap(self, image_path: str, upload_id: str, bounding_boxes: list) -> str:
        """
        Generate a beautiful heatmap visualization based on YOLOv9 bounding boxes!
        """
        try:
            # Load original image
            original = Image.open(image_path).convert('RGBA')
            
            # Create a red-yellow gradient overlay
            overlay = Image.new('RGBA', original.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            
            # Draw heat signatures for every YOLO bounding box
            for box_data in bounding_boxes:
                x1, y1, x2, y2 = box_data['bbox']
                
                # Center and dimensions
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                width = (x2 - x1)
                height = (y2 - y1)
                
                # Draw gradient ellipse
                steps = 100
                for i in range(steps, 0, -5):
                    # Fade from dark red to yellow to transparent
                    alpha = int(160 * (i / steps))
                    red = 255
                    green = int(100 * (1 - i / steps))
                    
                    cur_w = width * (i/steps)
                    cur_h = height * (i/steps)
                    
                    draw.ellipse(
                        [
                            center_x - cur_w / 2,
                            center_y - cur_h / 2,
                            center_x + cur_w / 2,
                            center_y + cur_h / 2
                        ],
                        fill=(red, green, 0, alpha)
                    )
            
            # If there are no bounding boxes, maybe we still want to save a blank version?
            if len(bounding_boxes) > 0:
                # Blur the overlay for smoother gradients
                overlay = overlay.filter(ImageFilter.GaussianBlur(radius=12))
                # Composite the overlay onto the original
                result = Image.alpha_composite(original, overlay)
            else:
                result = original
                
            result = result.convert('RGB')
            
            # Save the heatmap
            heatmap_filename = f"heatmap_{upload_id}.png"
            heatmap_path = settings.HEATMAP_DIR / heatmap_filename
            result.save(heatmap_path, 'PNG')
            
            return str(heatmap_path)
            
        except Exception as e:
            print(f"Error generating real heatmap: {e}")
            return ""
    
    async def analyze_xray(self, image_path: str, upload_id: str) -> Dict[str, Any]:
        """
        Perform AI analysis on an X-ray image by calling the Hugging Face Space.
        """
        try:
            # 1. Send Image to Hugging Face API
            with open(image_path, "rb") as f:
                files = {"file": (Path(image_path).name, f, "image/jpeg")}
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(self.hf_api_url, files=files)
                    
            if response.status_code != 200:
                raise Exception(f"HF Space API returned {response.status_code}: {response.text}")
                
            data = response.json()
            if "error" in data:
                raise Exception(data["error"])
                
            # 2. Extract Data
            bounding_boxes = data.get("bounding_boxes", [])
            classifications = data.get("classification", [])
            
            # Sort classifications highest to lowest
            classifications.sort(key=lambda x: x["probability"], reverse=True)
            
            # 3. Generate Real Heatmap using YOLO boxes
            heatmap_path = self._generate_real_heatmap(image_path, upload_id, bounding_boxes)
            
            # 4. Determine overall classification from DenseNet
            if not classifications:
                overall = "Error"
                confidence = 0.0
            else:
                top_class = classifications[0]["label"]
                max_prob = classifications[0]["probability"]
                
                if top_class.lower() == "normal":
                    overall = "Normal"
                    confidence = max_prob
                else:
                    if max_prob >= 0.7:
                        overall = f"Abnormal ({top_class}) - High Confidence"
                    elif max_prob >= 0.4:
                        overall = f"Abnormal ({top_class}) - Moderate Confidence"
                    else:
                        overall = f"Possibly Abnormal ({top_class})"
                    confidence = max_prob
            
            # 5. Format predictions for frontend
            predictions = []
            
            # DenseNet Findings
            for cls in classifications:
                if cls["probability"] > 0.05: # Only show meaningful probabilities
                    predictions.append({
                        "label": f"{cls['label']} (DenseNet)",
                        "probability": round(cls["probability"], 3),
                        "description": f"Whole-image classification by DenseNet121."
                    })
                    
            # YOLO Findings
            for box in bounding_boxes:
                predictions.append({
                    "label": f"Located: {box['label']} (YOLO)",
                    "probability": round(box["confidence"], 3),
                    "description": "Specific region detected and localized by YOLOv9."
                })
                
            predictions.sort(key=lambda x: x["probability"], reverse=True)
            
            return {
                "overall": overall,
                "model_version": self.model_version,
                "predictions": predictions,
                "heatmap_path": heatmap_path,
                "confidence_score": round(confidence, 2),
                "processed_at": datetime.utcnow().isoformat(),
            }
            
        except Exception as e:
            print(f"Error in analyze_xray calling HF Space: {e}")
            return {
                "overall": "Error",
                "model_version": self.model_version,
                "predictions": [],
                "heatmap_path": "",
                "confidence_score": 0.0,
                "processed_at": datetime.utcnow().isoformat(),
                "error": str(e)
            }

# Create singleton instance
ml_service = MLService()

