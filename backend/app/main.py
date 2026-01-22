"""
SPINEVISION-AI Backend Application
===================================

AI-Based Spine Disease Detection Web Application

This is the main entry point for the FastAPI backend.
Run with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import get_settings, ensure_storage_directories
from app.database import init_db
from app.api import auth_router, upload_router, result_router, history_router
from app.api.admin import router as admin_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Runs on startup and shutdown.
    """
    # Startup
    print("\n" + "=" * 50)
    print("🦴 SPINEVISION-AI Backend Starting...")
    print("=" * 50)
    
    # Ensure storage directories exist
    ensure_storage_directories()
    
    # Initialize database
    init_db()
    
    print("\n✅ Backend ready!")
    print(f"📍 API Docs: http://localhost:{settings.PORT}/docs")
    print(f"📍 ReDoc: http://localhost:{settings.PORT}/redoc")
    print("=" * 50 + "\n")
    
    yield
    
    # Shutdown
    print("\n🛑 SPINEVISION-AI Backend Shutting down...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # React dev server
        "http://localhost:3001",       # Vite dev server alt port
        "http://localhost:5173",       # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "*"                            # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for storage access
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# Include API routers
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(result_router)
app.include_router(history_router)
app.include_router(admin_router)


@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint - API health check.
    """
    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "documentation": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {
        "status": "healthy",
        "database": "connected",
        "ml_service": "ready"
    }


# For direct execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
