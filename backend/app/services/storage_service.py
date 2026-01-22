"""
Storage Service for SPINEVISION-AI.
Handles file upload, storage, and retrieval operations.
"""

import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from app.config import get_settings

settings = get_settings()


class StorageService:
    """
    Service class for managing file storage operations.
    Handles uploads, heatmaps, and reports.
    """
    
    @staticmethod
    def _get_file_extension(filename: str) -> str:
        """Extract file extension from filename."""
        return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    
    @staticmethod
    def _generate_unique_filename(original_filename: str) -> str:
        """
        Generate a unique filename to prevent collisions.
        Format: timestamp_uuid_originalname.ext
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        extension = StorageService._get_file_extension(original_filename)
        
        # Clean the original filename
        clean_name = "".join(c for c in original_filename if c.isalnum() or c in "._-")
        clean_name = clean_name[:50]  # Limit length
        
        return f"{timestamp}_{unique_id}_{clean_name}"
    
    @staticmethod
    def validate_file(file: UploadFile) -> Tuple[bool, str]:
        """
        Validate uploaded file type and size.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file extension
        extension = StorageService._get_file_extension(file.filename or "")
        if extension not in settings.ALLOWED_EXTENSIONS:
            return False, f"File type '{extension}' not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
        
        # Check content type
        allowed_content_types = {
            "image/png", "image/jpeg", "image/jpg",
            "application/dicom", "application/octet-stream"
        }
        if file.content_type and file.content_type not in allowed_content_types:
            # Allow it anyway for DICOM files which might have unusual content types
            if extension not in {"dcm", "dicom"}:
                return False, f"Content type '{file.content_type}' not allowed"
        
        return True, ""
    
    @staticmethod
    async def save_upload(file: UploadFile, user_id: str) -> dict:
        """
        Save an uploaded X-ray image to storage.
        
        Args:
            file: The uploaded file
            user_id: ID of the user uploading the file
            
        Returns:
            Dictionary with file info (path, name, size, type)
        """
        # Validate file
        is_valid, error_msg = StorageService.validate_file(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Generate unique filename
        unique_filename = StorageService._generate_unique_filename(file.filename or "upload")
        
        # Create user-specific subdirectory
        user_upload_dir = settings.UPLOAD_DIR / user_id
        user_upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Full path for the file
        file_path = user_upload_dir / unique_filename
        
        try:
            # Save file to disk
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
                file_size = len(content)
            
            return {
                "file_name": file.filename,
                "file_path": str(file_path),
                "file_size": str(file_size),
                "file_type": file.content_type or "unknown",
            }
            
        except Exception as e:
            # Clean up on error
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
    
    @staticmethod
    def save_heatmap(image_data: bytes, upload_id: str) -> str:
        """
        Save a generated heatmap image.
        
        Args:
            image_data: Binary image data
            upload_id: Associated upload ID
            
        Returns:
            Path to saved heatmap
        """
        filename = f"heatmap_{upload_id}.png"
        file_path = settings.HEATMAP_DIR / filename
        
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        return str(file_path)
    
    @staticmethod
    def save_report(report_data: bytes, upload_id: str) -> str:
        """
        Save a generated PDF report.
        
        Args:
            report_data: Binary PDF data
            upload_id: Associated upload ID
            
        Returns:
            Path to saved report
        """
        filename = f"report_{upload_id}.pdf"
        file_path = settings.REPORT_DIR / filename
        
        with open(file_path, "wb") as f:
            f.write(report_data)
        
        return str(file_path)
    
    @staticmethod
    def get_file(file_path: str) -> Optional[bytes]:
        """
        Retrieve a file from storage.
        
        Args:
            file_path: Path to the file
            
        Returns:
            File contents as bytes, or None if not found
        """
        path = Path(file_path)
        if path.exists():
            with open(path, "rb") as f:
                return f.read()
        return None
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """
        Delete a file from storage.
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if deleted, False if not found
        """
        path = Path(file_path)
        if path.exists():
            path.unlink()
            return True
        return False
    
    @staticmethod
    def get_file_url(file_path: str) -> str:
        """
        Convert a file path to a URL-friendly path.
        Used for serving files via the API.
        """
        # Return relative path from storage directory
        try:
            relative_path = Path(file_path).relative_to(settings.STORAGE_DIR)
            return f"/storage/{relative_path}".replace("\\", "/")
        except ValueError:
            return file_path


# Create singleton instance
storage_service = StorageService()
