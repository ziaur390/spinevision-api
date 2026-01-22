"""
History API endpoints for SPINEVISION-AI.
Provides access to user's upload and analysis history.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database import get_db, User, Upload, Result
from app.api.auth import get_current_user
from app.services import storage_service

router = APIRouter(prefix="/history", tags=["History"])


class HistoryItem(BaseModel):
    """Schema for a single history item."""
    upload_id: str
    file_name: str
    status: str
    uploaded_at: datetime
    overall_classification: Optional[str] = None
    confidence_score: Optional[float] = None
    heatmap_url: Optional[str] = None
    report_url: Optional[str] = None


class HistoryResponse(BaseModel):
    """Schema for history response with pagination."""
    items: List[HistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class StatisticsResponse(BaseModel):
    """Schema for user statistics."""
    total_uploads: int
    normal_count: int
    abnormal_count: int
    pending_count: int


@router.get("", response_model=HistoryResponse)
async def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the upload history for the current user.
    
    - Supports pagination
    - Optional filtering by status
    - Returns most recent uploads first
    """
    # Base query
    query = db.query(Upload).filter(Upload.user_id == current_user.id)
    
    # Apply status filter if provided
    if status_filter:
        query = query.filter(Upload.status == status_filter)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    uploads = query.order_by(Upload.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Build response items
    items = []
    for upload in uploads:
        result = upload.result
        
        items.append(HistoryItem(
            upload_id=upload.id,
            file_name=upload.file_name,
            status=upload.status.value,
            uploaded_at=upload.created_at,
            overall_classification=result.overall_classification if result else None,
            confidence_score=float(result.confidence_score) if result and result.confidence_score else None,
            heatmap_url=storage_service.get_file_url(result.heatmap_path) if result and result.heatmap_path else None,
            report_url=storage_service.get_file_url(result.report_path) if result and result.report_path else None
        ))
    
    total_pages = (total + page_size - 1) // page_size
    
    return HistoryResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get statistics about the user's uploads and results.
    """
    # Get all uploads for user
    uploads = db.query(Upload).filter(Upload.user_id == current_user.id).all()
    
    total_uploads = len(uploads)
    normal_count = 0
    abnormal_count = 0
    pending_count = 0
    
    for upload in uploads:
        if upload.status.value in ['uploaded', 'processing']:
            pending_count += 1
        elif upload.result:
            if 'Normal' in upload.result.overall_classification:
                normal_count += 1
            else:
                abnormal_count += 1
    
    return StatisticsResponse(
        total_uploads=total_uploads,
        normal_count=normal_count,
        abnormal_count=abnormal_count,
        pending_count=pending_count
    )


@router.delete("/{upload_id}")
async def delete_upload(
    upload_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an upload and its associated results.
    """
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    
    if not upload:
        return {"error": "Upload not found"}
    
    # Delete associated files
    if upload.file_path:
        storage_service.delete_file(upload.file_path)
    
    if upload.result:
        if upload.result.heatmap_path:
            storage_service.delete_file(upload.result.heatmap_path)
        if upload.result.report_path:
            storage_service.delete_file(upload.result.report_path)
    
    # Delete from database (cascades to result)
    db.delete(upload)
    db.commit()
    
    return {"message": "Upload deleted successfully", "upload_id": upload_id}
