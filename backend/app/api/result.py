"""
Result API endpoints for SPINEVISION-AI.
Provides access to AI analysis results.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from pathlib import Path

from app.database import get_db, User, Upload, Result
from app.api.auth import get_current_user
from app.services import storage_service

router = APIRouter(prefix="/result", tags=["Results"])


class PredictionItem(BaseModel):
    """Schema for individual prediction."""
    label: str
    description: Optional[str] = None
    probability: float


class ResultResponse(BaseModel):
    """Schema for result response."""
    id: str
    upload_id: str
    model_version: str
    overall_classification: str
    confidence_score: Optional[float]
    predictions: List[dict]
    heatmap_url: Optional[str]
    report_url: Optional[str]
    processed_at: datetime

    class Config:
        from_attributes = True


class ResultDetailResponse(BaseModel):
    """Detailed result response with upload info."""
    result: ResultResponse
    upload_info: dict


@router.get("/{upload_id}", response_model=ResultDetailResponse)
async def get_result(
    upload_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI analysis results for a specific upload.
    
    Returns:
    - Overall classification (Normal/Abnormal)
    - Confidence score
    - List of detected conditions with probabilities
    - Heatmap visualization URL
    - Downloadable report URL
    """
    # Get upload and verify ownership
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload not found"
        )
    
    # Get associated result
    result = db.query(Result).filter(Result.upload_id == upload_id).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found. Analysis may still be processing."
        )
    
    return ResultDetailResponse(
        result=ResultResponse(
            id=result.id,
            upload_id=result.upload_id,
            model_version=result.model_version,
            overall_classification=result.overall_classification,
            confidence_score=float(result.confidence_score) if result.confidence_score else None,
            predictions=result.predictions,
            heatmap_url=storage_service.get_file_url(result.heatmap_path) if result.heatmap_path else None,
            report_url=storage_service.get_file_url(result.report_path) if result.report_path else None,
            processed_at=result.processed_at
        ),
        upload_info={
            "file_name": upload.file_name,
            "uploaded_at": upload.created_at.isoformat(),
            "status": upload.status.value
        }
    )


@router.get("/{upload_id}/heatmap")
async def get_heatmap(
    upload_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download the heatmap visualization image."""
    # Verify upload ownership
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    result = db.query(Result).filter(Result.upload_id == upload_id).first()
    
    if not result or not result.heatmap_path:
        raise HTTPException(status_code=404, detail="Heatmap not found")
    
    heatmap_path = Path(result.heatmap_path)
    if not heatmap_path.exists():
        raise HTTPException(status_code=404, detail="Heatmap file not found")
    
    return FileResponse(
        path=str(heatmap_path),
        media_type="image/png",
        filename=f"heatmap_{upload_id}.png"
    )


@router.get("/{upload_id}/report")
async def get_report(
    upload_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download the PDF diagnostic report."""
    # Verify upload ownership
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    result = db.query(Result).filter(Result.upload_id == upload_id).first()
    
    if not result or not result.report_path:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report_path = Path(result.report_path)
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report file not found")
    
    return FileResponse(
        path=str(report_path),
        media_type="application/pdf",
        filename=f"SPINEVISION_Report_{upload_id}.pdf"
    )
