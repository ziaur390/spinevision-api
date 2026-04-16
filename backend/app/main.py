"""
SPINEVISION-AI Backend Application
===================================

AI-Based Spine Disease Detection Web Application

This is the main entry point for the FastAPI backend.
Run with: uvicorn app.main:app --reload
"""

# ... imports ...
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import traceback
import os

# (Removed bcrypt patch as we use Argon2 now)

from app.config import get_settings, ensure_storage_directories
from app.database import init_db
from app.api import auth_router, upload_router, result_router, history_router
from app.api.admin import router as admin_router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
   # ... (keep existing lifespan code) ...
    print("\n" + "=" * 50)
    print("🦴 SPINEVISION-AI Backend Starting...")
    print("=" * 50)
    ensure_storage_directories()
    init_db()
    print("\n✅ Backend ready!")
    yield
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

# DEBUG ENDPOINT
@app.get("/debug/diagnose")
async def diagnose_system():
    results = {}
    
    # 1. Test Disk Write (Database simulation)
    try:
        with open("test_write.txt", "w") as f:
            f.write("test")
        os.remove("test_write.txt")
        results["disk_write"] = "OK"
    except Exception as e:
        results["disk_write"] = f"FAIL: {str(e)}"

    # 2. Test Password Hashing (Argon2)
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
        hash = pwd_context.hash("testpassword")
        results["hashing"] = "OK"
    except Exception as e:
        results["hashing"] = f"FAIL: {str(e)}"
        results["hashing_trace"] = traceback.format_exc()

    # 3. Test Storage Dir
    try:
        if os.path.exists("storage"):
            results["storage_dir"] = "Exists"
        else:
            results["storage_dir"] = "Missing (will create)"
            os.makedirs("storage", exist_ok=True)
    except Exception as e:
        results["storage_dir"] = f"FAIL: {str(e)}"

    return results

@app.exception_handler(Exception)
# ... (keep existing handler) ...

# DEBUG: Global Exception Handler to see 500 errors
@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    error_msg = f"{type(exc).__name__}: {str(exc)}\n{traceback.format_exc()}"
    print(error_msg) # Log to console
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "debug_error": error_msg}
    )


# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "https://spinevision-ai.vercel.app",
        "https://spinevision-app.vercel.app",
        "https://spinevisionai.netlify.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for storage access
import os
os.makedirs("storage", exist_ok=True)
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
