"""
Upload API endpoints for SPINEVISION-AI.
Handles X-ray image uploads and triggers AI processing.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.config import get_settings
from app.database import get_db, User, Upload, Result, UploadStatus
from app.api.auth import get_current_user
from app.services import storage_service, ml_service, report_service

settings = get_settings()
router = APIRouter(prefix="/upload", tags=["Upload"])


class UploadResponse(BaseModel):
    """Schema for upload response."""
    id: str
    file_name: str
    status: str
    created_at: datetime
    message: str

    class Config:
        from_attributes = True


class UploadWithResultResponse(BaseModel):
    """Schema for upload with result response."""
    upload_id: str
    file_name: str
    status: str
    overall_classification: Optional[str] = None
    confidence_score: Optional[float] = None
    model_version: Optional[str] = None
    predictions: Optional[list] = None
    heatmap_url: Optional[str] = None
    report_url: Optional[str] = None
    processed_at: Optional[datetime] = None


@router.post("", response_model=UploadWithResultResponse)
async def upload_xray(
    file: UploadFile = File(..., description="X-ray image file (PNG, JPG, DICOM)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an X-ray image for AI analysis.
    
    - Accepts PNG, JPG, JPEG, and DICOM files
    - Maximum file size: 50MB
    - Triggers automatic AI processing
    - Returns analysis results with heatmap and report
    """
    # Save file to storage
    file_info = await storage_service.save_upload(file, current_user.id)
    
    # Create upload record
    upload = Upload(
        user_id=current_user.id,
        file_name=file_info["file_name"],
        file_path=file_info["file_path"],
        file_type=file_info["file_type"],
        file_size=file_info["file_size"],
        status=UploadStatus.PROCESSING
    )
    
    db.add(upload)
    db.commit()
    db.refresh(upload)
    
    try:
        # Run AI analysis
        analysis_result = await ml_service.analyze_xray(
            file_info["file_path"],
            upload.id
        )
        
        # Generate PDF report
        report_path = await report_service.generate_report(
            analysis_result,
            upload.id,
            {"doctor_name": current_user.full_name}
        )
        
        # Create result record
        result = Result(
            upload_id=upload.id,
            model_version=analysis_result["model_version"],
            overall_classification=analysis_result["overall"],
            predictions=analysis_result["predictions"],
            confidence_score=str(analysis_result["confidence_score"]),
            heatmap_path=analysis_result.get("heatmap_path", ""),
            report_path=report_path
        )
        
        db.add(result)
        upload.status = UploadStatus.DONE
        db.commit()
        db.refresh(result)
        
        return UploadWithResultResponse(
            upload_id=upload.id,
            file_name=upload.file_name,
            status=upload.status.value,
            overall_classification=result.overall_classification,
            confidence_score=float(result.confidence_score) if result.confidence_score else None,
            model_version=result.model_version,
            predictions=result.predictions,
            heatmap_url=storage_service.get_file_url(result.heatmap_path) if result.heatmap_path else None,
            report_url=storage_service.get_file_url(result.report_path) if result.report_path else None,
            processed_at=result.processed_at
        )
        
    except Exception as e:
        upload.status = UploadStatus.FAILED
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI processing failed: {str(e)}"
        )


@router.get("/{upload_id}", response_model=UploadWithResultResponse)
async def get_upload_status(
    upload_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the status and results of a specific upload."""
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload not found"
        )
    
    result = upload.result
    
    return UploadWithResultResponse(
        upload_id=upload.id,
        file_name=upload.file_name,
        status=upload.status.value,
        overall_classification=result.overall_classification if result else None,
        confidence_score=float(result.confidence_score) if result and result.confidence_score else None,
        model_version=result.model_version if result else None,
        predictions=result.predictions if result else None,
        heatmap_url=storage_service.get_file_url(result.heatmap_path) if result and result.heatmap_path else None,
        report_url=storage_service.get_file_url(result.report_path) if result and result.report_path else None,
        processed_at=result.processed_at if result else None
    )
