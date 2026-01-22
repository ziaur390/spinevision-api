"""
Configuration module for SPINEVISION-AI Backend.
Handles environment variables and application settings.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses pydantic-settings for validation and type conversion.
    """
    
    # Application Info
    APP_NAME: str = "SPINEVISION-AI"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-Based Spine Disease Detection Web Application"
    DEBUG: bool = True
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Configuration
    # Uses SQLite by default for local development
    # Switch to PostgreSQL for production
    DATABASE_URL: str = "sqlite:///./spinevision.db"
    
    # For PostgreSQL, use:
    # DATABASE_URL: str = "postgresql://user:password@localhost:5432/spinevision"
    
    # JWT Configuration
    SECRET_KEY: str = "your-super-secret-key-change-in-production-spinevision-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # File Storage Configuration
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = STORAGE_DIR / "uploads"
    HEATMAP_DIR: Path = STORAGE_DIR / "heatmaps"
    REPORT_DIR: Path = STORAGE_DIR / "reports"
    
    # Allowed File Extensions
    ALLOWED_EXTENSIONS: set = {"png", "jpg", "jpeg", "dcm", "dicom"}
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB
    
    # ML Model Configuration
    MODEL_VERSION: str = "v0.1-dummy"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Returns cached settings instance.
    Using lru_cache ensures we only load settings once.
    """
    return Settings()


def ensure_storage_directories():
    """
    Creates storage directories if they don't exist.
    Should be called during application startup.
    """
    settings = get_settings()
    
    directories = [
        settings.STORAGE_DIR,
        settings.UPLOAD_DIR,
        settings.HEATMAP_DIR,
        settings.REPORT_DIR,
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ Directory ready: {directory}")
