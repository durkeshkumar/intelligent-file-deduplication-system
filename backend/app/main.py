import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.routers.auth import router as auth_router
from app.routers.audit_logs import router as audit_logs_router
from app.routers.files import router as files_router


setup_logging()

logger = logging.getLogger(__name__)


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "A full-stack file management system that detects duplicate files, "
        "analyzes storage usage, and helps users safely optimize storage."
    ),
    version=settings.APP_VERSION,
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
)


# ---------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# API Routers
# ---------------------------------------------------------

app.include_router(auth_router)
app.include_router(files_router)
app.include_router(audit_logs_router)


# ---------------------------------------------------------
# Startup
# ---------------------------------------------------------

@app.on_event("startup")
def startup_event() -> None:
    logger.info(
        "Starting %s",
        settings.APP_NAME,
    )

    logger.info(
        "Application version: %s",
        settings.APP_VERSION,
    )


# ---------------------------------------------------------
# Root
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Intelligent File Deduplication API is running",
        "status": "success",
    }


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "file-deduplication-backend",
    }