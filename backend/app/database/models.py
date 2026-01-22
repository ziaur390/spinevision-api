"""
SQLAlchemy ORM Models for SPINEVISION-AI.
Defines the database schema for Users, Uploads, and Results.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, ForeignKey, 
    Enum, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.db import Base
import enum


def generate_uuid():
    """Generate a new UUID as string for SQLite compatibility."""
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    """Enumeration for user roles."""
    DOCTOR = "doctor"
    ADMIN = "admin"


class UploadStatus(str, enum.Enum):
    """Enumeration for upload processing status."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"


class User(Base):
    """
    User model for storing doctor and admin accounts.
    
    Attributes:
        id: Unique identifier (UUID)
        email: User's email address (unique)
        hashed_password: Bcrypt hashed password
        full_name: User's full name
        role: User role (doctor/admin)
        created_at: Account creation timestamp
        is_active: Whether the account is active
    """
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(
        Enum(UserRole), 
        default=UserRole.DOCTOR, 
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(String(5), default="true", nullable=False)
    
    # Relationship to uploads
    uploads = relationship("Upload", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class Upload(Base):
    """
    Upload model for storing X-ray image upload records.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        file_name: Original filename
        file_path: Path to stored file
        file_type: MIME type of the file
        file_size: Size in bytes
        status: Processing status
        created_at: Upload timestamp
    """
    __tablename__ = "uploads"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=True)
    file_size = Column(String(20), nullable=True)  # Stored as string for compatibility
    status = Column(
        Enum(UploadStatus), 
        default=UploadStatus.UPLOADED, 
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="uploads")
    result = relationship("Result", back_populates="upload", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Upload(id={self.id}, file_name={self.file_name}, status={self.status})>"


class Result(Base):
    """
    Result model for storing AI analysis results.
    
    Attributes:
        id: Unique identifier (UUID)
        upload_id: Foreign key to Upload
        model_version: Version of the ML model used
        overall_classification: Overall diagnosis (Normal/Abnormal)
        predictions: JSON array of prediction results
        heatmap_path: Path to generated heatmap image
        report_path: Path to generated PDF report
        processed_at: Timestamp when processing completed
    """
    __tablename__ = "results"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    upload_id = Column(String(36), ForeignKey("uploads.id"), unique=True, nullable=False)
    model_version = Column(String(50), nullable=False)
    overall_classification = Column(String(50), nullable=False)  # Normal / Abnormal
    predictions = Column(JSON, nullable=False)  # Array of {label, probability}
    confidence_score = Column(String(10), nullable=True)  # Overall confidence
    heatmap_path = Column(String(500), nullable=True)
    report_path = Column(String(500), nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    upload = relationship("Upload", back_populates="result")
    
    def __repr__(self):
        return f"<Result(id={self.id}, classification={self.overall_classification})>"
