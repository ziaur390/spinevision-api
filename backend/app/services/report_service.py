"""
Report Service for SPINEVISION-AI.
Generates PDF diagnostic reports from analysis results.
"""

import io
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image as RLImage, PageBreak, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from app.config import get_settings

settings = get_settings()


class ReportService:
    """
    Service for generating PDF diagnostic reports.
    Creates professional medical-style reports with analysis results.
    """
    
    def __init__(self):
        """Initialize report styles."""
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Define custom paragraph styles for the report."""
        
        # Title style
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#1a365d')
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#4a5568')
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#2d3748'),
            borderPadding=5,
        ))
        
        # Finding style
        self.styles.add(ParagraphStyle(
            name='Finding',
            parent=self.styles['Normal'],
            fontSize=11,
            leftIndent=20,
            spaceBefore=5,
            spaceAfter=5,
        ))
        
        # Disclaimer style
        self.styles.add(ParagraphStyle(
            name='Disclaimer',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#718096'),
            alignment=TA_CENTER,
            spaceBefore=30,
        ))
    
    def _create_header(self, elements: list, patient_info: Optional[Dict] = None):
        """Create the report header section."""
        
        # Main title
        elements.append(Paragraph(
            "SPINEVISION-AI",
            self.styles['ReportTitle']
        ))
        
        elements.append(Paragraph(
            "AI-Assisted Spine Disease Detection Report",
            self.styles['ReportSubtitle']
        ))
        
        # Horizontal line
        elements.append(HRFlowable(
            width="100%",
            thickness=2,
            color=colors.HexColor('#3182ce'),
            spaceBefore=10,
            spaceAfter=20
        ))
        
        # Report metadata
        report_date = datetime.now().strftime("%B %d, %Y at %H:%M")
        elements.append(Paragraph(
            f"<b>Report Generated:</b> {report_date}",
            self.styles['Normal']
        ))
        
        if patient_info:
            if patient_info.get('doctor_name'):
                elements.append(Paragraph(
                    f"<b>Requesting Physician:</b> {patient_info['doctor_name']}",
                    self.styles['Normal']
                ))
            if patient_info.get('patient_id'):
                elements.append(Paragraph(
                    f"<b>Patient ID:</b> {patient_info['patient_id']}",
                    self.styles['Normal']
                ))
        
        elements.append(Spacer(1, 20))
    
    def _create_classification_section(self, elements: list, result: Dict):
        """Create the overall classification section."""
        
        elements.append(Paragraph(
            "Overall Classification",
            self.styles['SectionHeader']
        ))
        
        # Classification box
        classification = result.get('overall', 'Unknown')
        confidence = result.get('confidence_score', 0)
        
        # Determine color based on classification
        if 'Normal' in classification:
            box_color = colors.HexColor('#48bb78')  # Green
        elif 'High' in classification:
            box_color = colors.HexColor('#e53e3e')  # Red
        elif 'Moderate' in classification or 'Possibly' in classification:
            box_color = colors.HexColor('#ed8936')  # Orange
        else:
            box_color = colors.HexColor('#4299e1')  # Blue
        
        # Create classification table
        classification_data = [
            [Paragraph(f"<b>{classification}</b>", 
                      ParagraphStyle(name='ClassText', fontSize=16, 
                                   alignment=TA_CENTER, textColor=colors.white))],
            [Paragraph(f"Confidence: {confidence:.0%}", 
                      ParagraphStyle(name='ConfText', fontSize=11, 
                                   alignment=TA_CENTER, textColor=colors.white))]
        ]
        
        classification_table = Table(classification_data, colWidths=[4*inch])
        classification_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), box_color),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
            ('LEFTPADDING', (0, 0), (-1, -1), 20),
            ('RIGHTPADDING', (0, 0), (-1, -1), 20),
            ('ROUNDEDCORNERS', [5, 5, 5, 5]),
        ]))
        
        elements.append(classification_table)
        elements.append(Spacer(1, 20))
    
    def _create_findings_section(self, elements: list, predictions: list):
        """Create the detailed findings section."""
        
        elements.append(Paragraph(
            "Detected Conditions",
            self.styles['SectionHeader']
        ))
        
        if not predictions:
            elements.append(Paragraph(
                "No significant abnormalities detected.",
                self.styles['Finding']
            ))
            return
        
        # Create findings table
        table_data = [
            [
                Paragraph("<b>Condition</b>", self.styles['Normal']),
                Paragraph("<b>Probability</b>", self.styles['Normal']),
                Paragraph("<b>Severity</b>", self.styles['Normal'])
            ]
        ]
        
        for pred in predictions:
            prob = pred.get('probability', 0)
            
            # Determine severity level
            if prob >= 0.7:
                severity = "High"
                severity_color = colors.HexColor('#e53e3e')
            elif prob >= 0.5:
                severity = "Moderate"
                severity_color = colors.HexColor('#ed8936')
            elif prob >= 0.3:
                severity = "Low"
                severity_color = colors.HexColor('#ecc94b')
            else:
                severity = "Very Low"
                severity_color = colors.HexColor('#48bb78')
            
            table_data.append([
                Paragraph(pred.get('label', 'Unknown'), self.styles['Normal']),
                Paragraph(f"{prob:.0%}", self.styles['Normal']),
                Paragraph(f"<font color='{severity_color.hexval()}'><b>{severity}</b></font>", 
                         self.styles['Normal'])
            ])
        
        findings_table = Table(table_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        findings_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#edf2f7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            
            # Cell styling
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (2, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#3182ce')),
            
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')])
        ]))
        
        elements.append(findings_table)
        elements.append(Spacer(1, 20))
        
        # Add descriptions for significant findings
        significant_findings = [p for p in predictions if p.get('probability', 0) >= 0.5]
        if significant_findings:
            elements.append(Paragraph(
                "Finding Descriptions",
                self.styles['SectionHeader']
            ))
            
            for finding in significant_findings:
                desc = finding.get('description', 'No description available.')
                elements.append(Paragraph(
                    f"<b>{finding['label']}:</b> {desc}",
                    self.styles['Finding']
                ))
    
    def _create_heatmap_section(self, elements: list, heatmap_path: str):
        """Include the heatmap visualization in the report."""
        
        if not heatmap_path or not Path(heatmap_path).exists():
            return
        
        elements.append(Paragraph(
            "Region of Interest Visualization",
            self.styles['SectionHeader']
        ))
        
        elements.append(Paragraph(
            "The highlighted regions indicate areas where the AI model detected potential abnormalities. "
            "Warmer colors (red/orange) indicate higher attention from the model.",
            self.styles['Normal']
        ))
        elements.append(Spacer(1, 10))
        
        try:
            # Add heatmap image
            img = RLImage(heatmap_path, width=4*inch, height=4*inch)
            elements.append(img)
        except Exception as e:
            elements.append(Paragraph(
                f"[Heatmap image could not be included: {str(e)}]",
                self.styles['Normal']
            ))
        
        elements.append(Spacer(1, 20))
    
    def _create_recommendations_section(self, elements: list, result: Dict):
        """Create recommendations based on the analysis."""
        
        elements.append(Paragraph(
            "Recommendations",
            self.styles['SectionHeader']
        ))
        
        classification = result.get('overall', '')
        
        recommendations = []
        
        if 'High' in classification:
            recommendations = [
                "Immediate consultation with an orthopedic specialist or spine surgeon is recommended.",
                "Additional imaging studies (MRI, CT) may be warranted for detailed assessment.",
                "Clinical correlation with patient symptoms and physical examination is essential.",
                "Consider referral for comprehensive spine evaluation."
            ]
        elif 'Moderate' in classification or 'Possibly' in classification:
            recommendations = [
                "Follow-up consultation with the treating physician is recommended.",
                "Consider additional imaging if symptoms persist or worsen.",
                "Monitor patient for any progression of symptoms.",
                "Physical therapy evaluation may be beneficial."
            ]
        else:
            recommendations = [
                "Routine follow-up as clinically indicated.",
                "No immediate intervention appears necessary based on this analysis.",
                "Continue standard care protocols.",
                "Patient education on spine health and posture is recommended."
            ]
        
        for i, rec in enumerate(recommendations, 1):
            elements.append(Paragraph(
                f"{i}. {rec}",
                self.styles['Finding']
            ))
    
    def _create_footer(self, elements: list, result: Dict):
        """Create the report footer with disclaimers."""
        
        elements.append(Spacer(1, 30))
        elements.append(HRFlowable(
            width="100%",
            thickness=1,
            color=colors.HexColor('#cbd5e0'),
            spaceBefore=10,
            spaceAfter=10
        ))
        
        # Model information
        model_version = result.get('model_version', 'Unknown')
        processed_at = result.get('processed_at', datetime.now().isoformat())
        
        elements.append(Paragraph(
            f"<b>Model Version:</b> {model_version} | <b>Analysis ID:</b> {result.get('id', 'N/A')}",
            ParagraphStyle(name='Footer', fontSize=9, alignment=TA_CENTER, 
                          textColor=colors.HexColor('#718096'))
        ))
        
        # Disclaimer
        elements.append(Paragraph(
            "<b>IMPORTANT DISCLAIMER:</b> This report is generated by an AI-assisted diagnostic tool "
            "and is intended for clinical decision support only. It should not be used as the sole "
            "basis for diagnosis or treatment. All findings must be reviewed and confirmed by a "
            "qualified medical professional. The AI model's predictions are probabilistic in nature "
            "and may not capture all pathological conditions. Clinical correlation is mandatory.",
            self.styles['Disclaimer']
        ))
        
        elements.append(Paragraph(
            "© 2024 SPINEVISION-AI | Confidential Medical Information",
            ParagraphStyle(name='Copyright', fontSize=8, alignment=TA_CENTER,
                          textColor=colors.HexColor('#a0aec0'), spaceBefore=15)
        ))
    
    async def generate_report(
        self,
        result: Dict[str, Any],
        upload_id: str,
        patient_info: Optional[Dict] = None
    ) -> str:
        """
        Generate a PDF diagnostic report.
        
        Args:
            result: The analysis result dictionary
            upload_id: The upload ID for naming the report
            patient_info: Optional patient/doctor information
            
        Returns:
            Path to the generated PDF report
        """
        # Create report filename
        report_filename = f"report_{upload_id}.pdf"
        report_path = settings.REPORT_DIR / report_filename
        
        # Create the PDF document
        doc = SimpleDocTemplate(
            str(report_path),
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Build document content
        elements = []
        
        # Add sections
        self._create_header(elements, patient_info)
        self._create_classification_section(elements, result)
        self._create_findings_section(elements, result.get('predictions', []))
        self._create_heatmap_section(elements, result.get('heatmap_path', ''))
        self._create_recommendations_section(elements, result)
        self._create_footer(elements, result)
        
        # Build the PDF
        doc.build(elements)
        
        return str(report_path)


# Create singleton instance
report_service = ReportService()
