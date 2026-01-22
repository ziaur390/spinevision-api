"""
Admin API endpoints for SPINEVISION-AI.
Handles admin statistics, user management, and system analytics.
"""

from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel

from app.database import get_db, User, Upload, Result, UserRole
from app.api.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


# Pydantic Schemas
class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_scans: int
    today_scans: int
    pending_scans: int
    completed_scans: int
    normal_count: int
    abnormal_count: int


class UserListItem(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: str
    created_at: datetime
    scan_count: int
    last_active: Optional[datetime]

    class Config:
        from_attributes = True


class ScanListItem(BaseModel):
    id: str
    user_email: str
    user_name: Optional[str]
    file_name: str
    status: str
    classification: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityItem(BaseModel):
    id: str
    action: str
    user: str
    time: datetime
    type: str


# ============================================================================
# Admin Statistics Endpoints
# ============================================================================

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get comprehensive admin statistics"""
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    # User stats
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == "true").count()
    
    # Scan stats
    total_scans = db.query(Upload).count()
    today_scans = db.query(Upload).filter(Upload.created_at >= today_start).count()
    pending_scans = db.query(Upload).filter(Upload.status.in_(["uploaded", "processing"])).count()
    completed_scans = db.query(Upload).filter(Upload.status == "done").count()
    
    # Result stats
    normal_count = db.query(Result).filter(
        Result.overall_classification.contains("Normal")
    ).count()
    abnormal_count = db.query(Result).filter(
        ~Result.overall_classification.contains("Normal")
    ).count()
    
    return AdminStats(
        total_users=total_users,
        active_users=active_users,
        total_scans=total_scans,
        today_scans=today_scans,
        pending_scans=pending_scans,
        completed_scans=completed_scans,
        normal_count=normal_count,
        abnormal_count=abnormal_count
    )


@router.get("/users", response_model=List[UserListItem])
async def get_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users with their scan counts"""
    users = db.query(User).all()
    
    result = []
    for user in users:
        scan_count = db.query(Upload).filter(Upload.user_id == user.id).count()
        last_upload = db.query(Upload).filter(
            Upload.user_id == user.id
        ).order_by(desc(Upload.created_at)).first()
        
        result.append(UserListItem(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value if hasattr(user.role, 'value') else str(user.role),
            is_active=user.is_active,
            created_at=user.created_at,
            scan_count=scan_count,
            last_active=last_upload.created_at if last_upload else user.created_at
        ))
    
    return result


@router.get("/scans", response_model=List[ScanListItem])
async def get_all_scans(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get recent scans across all users"""
    uploads = db.query(Upload).order_by(desc(Upload.created_at)).limit(limit).all()
    
    result = []
    for upload in uploads:
        user = db.query(User).filter(User.id == upload.user_id).first()
        scan_result = db.query(Result).filter(Result.upload_id == upload.id).first()
        
        result.append(ScanListItem(
            id=upload.id,
            user_email=user.email if user else "Unknown",
            user_name=user.full_name if user else None,
            file_name=upload.file_name,
            status=upload.status,
            classification=scan_result.overall_classification if scan_result else None,
            created_at=upload.created_at
        ))
    
    return result


@router.get("/activity", response_model=List[ActivityItem])
async def get_recent_activity(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Get recent system activity"""
    activities = []
    
    # Recent uploads
    recent_uploads = db.query(Upload).order_by(desc(Upload.created_at)).limit(limit).all()
    for upload in recent_uploads:
        user = db.query(User).filter(User.id == upload.user_id).first()
        activities.append(ActivityItem(
            id=upload.id,
            action=f"Uploaded {upload.file_name}",
            user=user.full_name or user.email if user else "Unknown",
            time=upload.created_at,
            type="upload"
        ))
    
    # Recent users
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()
    for user in recent_users:
        activities.append(ActivityItem(
            id=user.id,
            action="New user registered",
            user=user.full_name or user.email,
            time=user.created_at,
            type="user"
        ))
    
    # Sort by time and limit
    activities.sort(key=lambda x: x.time, reverse=True)
    return activities[:limit]


@router.get("/analytics/weekly")
async def get_weekly_analytics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get weekly scan analytics"""
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    
    daily_stats = []
    for i in range(7):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        
        count = db.query(Upload).filter(
            Upload.created_at >= day_start,
            Upload.created_at <= day_end
        ).count()
        
        daily_stats.append({
            "date": day.strftime("%Y-%m-%d"),
            "day": day.strftime("%a"),
            "scans": count
        })
    
    daily_stats.reverse()
    return {"weekly_data": daily_stats}


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Toggle user active status"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own status")
    
    user.is_active = "false" if user.is_active == "true" else "true"
    db.commit()
    db.refresh(user)
    
    return {"message": f"User status changed to {user.is_active}", "is_active": user.is_active}


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user role"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if role not in ["doctor", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user.role = UserRole.ADMIN if role == "admin" else UserRole.DOCTOR
    db.commit()
    db.refresh(user)
    
    return {"message": f"User role updated to {role}"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a user and their data"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Delete user's uploads and results
    uploads = db.query(Upload).filter(Upload.user_id == user_id).all()
    for upload in uploads:
        db.query(Result).filter(Result.upload_id == upload.id).delete()
    db.query(Upload).filter(Upload.user_id == user_id).delete()
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}
