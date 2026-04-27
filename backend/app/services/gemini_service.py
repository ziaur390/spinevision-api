"""
Gemini AI Service for SPINEVISION-AI.

Uses Google's Gemini API to generate professional clinical recommendations
based on the DenseNet classification and YOLOv9 detection results.
"""

import google.generativeai as genai
from typing import Dict, List, Any, Optional
from app.config import get_settings

settings = get_settings()


class GeminiService:
    """
    Service that sends AI model outputs to Google Gemini and receives
    expert-level clinical recommendations in return.
    """
    
    def __init__(self):
        self.available = False
        api_key = settings.GEMINI_API_KEY
        
        if api_key:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel("gemini-2.0-flash")
                self.available = True
                print("✓ Gemini AI Service initialized successfully.")
            except Exception as e:
                print(f"✗ Gemini AI Service failed to initialize: {e}")
        else:
            print("⚠ Gemini AI Service disabled (no GEMINI_API_KEY found in environment).")
    
    async def generate_recommendation(
        self,
        overall_classification: str,
        confidence_score: float,
        predictions: List[Dict[str, Any]],
    ) -> str:
        """
        Generate a professional clinical recommendation report using Gemini.
        
        Args:
            overall_classification: The top-level DenseNet classification (e.g. "Abnormal (Osteophytes) - High Confidence")
            confidence_score: The confidence score from DenseNet (0.0 - 1.0)
            predictions: List of all prediction dicts from both DenseNet and YOLO
            
        Returns:
            A formatted string containing the AI-generated clinical recommendation.
        """
        if not self.available:
            return self._fallback_recommendation(overall_classification, predictions)
        
        try:
            # Build a structured prompt for Gemini
            prompt = self._build_prompt(overall_classification, confidence_score, predictions)
            
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                return response.text.strip()
            else:
                return self._fallback_recommendation(overall_classification, predictions)
                
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._fallback_recommendation(overall_classification, predictions)
    
    def _build_prompt(
        self,
        overall_classification: str,
        confidence_score: float,
        predictions: List[Dict[str, Any]],
    ) -> str:
        """Build the clinical prompt for Gemini."""
        
        # Separate DenseNet and YOLO findings for the prompt
        densenet_findings = []
        yolo_findings = []
        
        for p in predictions:
            label = p.get("label", "")
            prob = p.get("probability", 0)
            if "(DenseNet)" in label:
                densenet_findings.append(f"  - {label.replace(' (DenseNet)', '')}: {prob:.1%}")
            elif "(YOLO)" in label:
                yolo_findings.append(f"  - {label.replace('Located: ', '').replace(' (YOLO)', '')}: {prob:.1%} confidence")
        
        densenet_text = "\n".join(densenet_findings) if densenet_findings else "  - No significant findings"
        yolo_text = "\n".join(yolo_findings) if yolo_findings else "  - No specific regions detected"
        
        prompt = f"""You are a senior radiologist AI assistant for SpineVision-AI, a clinical decision support system. Based on the following AI-generated spine X-ray analysis results, write a professional clinical recommendation report.

## AI Analysis Results

**Overall Classification:** {overall_classification}
**Confidence Score:** {confidence_score:.1%}

**DenseNet-121 Whole-Image Classification:**
{densenet_text}

**YOLOv9 Region-Level Detections (localized findings):**
{yolo_text}

## Instructions

Write a clinical recommendation in the following structure. Use clear, professional medical language. Do NOT use markdown headers or bullet formatting — write in plain flowing paragraphs and numbered lists only.

1. **Clinical Summary** (2-3 sentences summarizing the AI findings)
2. **Detailed Findings** (Explain each detected condition, its clinical significance, and what it typically indicates)
3. **Recommended Actions** (A numbered list of 4-6 specific, actionable clinical recommendations based on the severity)
4. **Additional Notes** (Any caveats, differential diagnoses to consider, or follow-up suggestions)

Important rules:
- Be medically accurate but not alarming.
- If the classification is "Normal", state that no significant pathology was identified and recommend routine follow-up.
- If abnormalities are detected, recommend appropriate imaging, specialist referrals, and management strategies proportional to the severity.
- Always include a reminder that this is an AI-assisted analysis and clinical correlation is required.
- Keep the total response under 400 words.
- Do not use markdown formatting symbols like #, *, or -.
"""
        return prompt
    
    def _fallback_recommendation(
        self,
        overall_classification: str,
        predictions: List[Dict[str, Any]],
    ) -> str:
        """
        Generate a basic rule-based recommendation when Gemini is unavailable.
        """
        if "Normal" in overall_classification:
            return (
                "Clinical Summary: The AI analysis did not identify significant pathological findings "
                "in this spine X-ray. The vertebral bodies, disc spaces, and alignment appear within "
                "normal limits based on the model's assessment.\n\n"
                "Recommended Actions:\n"
                "1. Routine follow-up as clinically indicated.\n"
                "2. No immediate intervention appears necessary based on this analysis.\n"
                "3. Continue standard care protocols.\n"
                "4. Patient education on spine health and posture is recommended.\n\n"
                "Note: This is an AI-assisted analysis. Clinical correlation with patient history "
                "and physical examination is always recommended."
            )
        
        # Extract condition names
        conditions = []
        for p in predictions:
            label = p.get("label", "")
            prob = p.get("probability", 0)
            if prob >= 0.3:
                clean = label.replace(" (DenseNet)", "").replace("Located: ", "").replace(" (YOLO)", "")
                if clean not in conditions:
                    conditions.append(clean)
        
        condition_text = ", ".join(conditions) if conditions else "unspecified abnormalities"
        
        if "High" in overall_classification:
            return (
                f"Clinical Summary: The AI analysis has identified findings consistent with "
                f"{condition_text} with high confidence. These findings warrant prompt clinical attention.\n\n"
                "Recommended Actions:\n"
                "1. Immediate consultation with an orthopedic specialist or spine surgeon is recommended.\n"
                "2. Additional imaging studies (MRI, CT) may be warranted for detailed assessment.\n"
                "3. Clinical correlation with patient symptoms and physical examination is essential.\n"
                "4. Consider referral for comprehensive spine evaluation.\n"
                "5. Pain management consultation if the patient is symptomatic.\n"
                "6. Follow-up imaging in 3-6 months to monitor progression.\n\n"
                "Note: This is an AI-assisted analysis. All findings must be confirmed by a qualified radiologist."
            )
        else:
            return (
                f"Clinical Summary: The AI analysis has identified possible findings consistent with "
                f"{condition_text}. The confidence level is moderate, and further evaluation is advised.\n\n"
                "Recommended Actions:\n"
                "1. Follow-up consultation with the treating physician is recommended.\n"
                "2. Consider additional imaging if symptoms persist or worsen.\n"
                "3. Monitor patient for any progression of symptoms.\n"
                "4. Physical therapy evaluation may be beneficial.\n"
                "5. Reassess in 6-12 months with repeat imaging.\n\n"
                "Note: This is an AI-assisted analysis. Clinical correlation is mandatory."
            )


# Create singleton instance
gemini_service = GeminiService()
