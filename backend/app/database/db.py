"""
Database connection and session management for SPINEVISION-AI.
Uses SQLAlchemy ORM with support for both SQLite and PostgreSQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

# Get settings
settings = get_settings()

# Create database engine
# check_same_thread is only needed for SQLite
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.DEBUG  # Log SQL queries in debug mode
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all models
Base = declarative_base()


def get_db():
    """
    Dependency function that provides database sessions.
    Ensures proper cleanup after each request.
    
    Usage in FastAPI:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize the database by creating all tables.
    Should be called during application startup.
    """
    # Import all models here to ensure they're registered with Base
    from app.database import models  # noqa: F401
    
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
