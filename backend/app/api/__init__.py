"""
API package initialization.
Exports all API routers for inclusion in the main app.
"""

from app.api.auth import router as auth_router, get_current_user
from app.api.upload import router as upload_router
from app.api.result import router as result_router
from app.api.history import router as history_router

__all__ = [
    "auth_router",
    "upload_router", 
    "result_router",
    "history_router",
    "get_current_user",
]
