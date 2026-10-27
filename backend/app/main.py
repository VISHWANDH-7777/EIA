from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from .config import settings
from .routers import (
    projects,
    monitoring,
    risk,
    mitigation,
    inspections,
    feedback,
    alerts,
    compliance,
    maps,
    dashboard,
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Smart EIA — Environmental Impact Assessment and Monitoring System API",
    description="Statutory Environmental Impact Assessment, Environmental Monitoring, Deterministic Rule-Based Risk Evaluation, and Compliance Tracking API.",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(dashboard.router)
app.include_router(projects.router)
app.include_router(monitoring.router)
app.include_router(risk.router)
app.include_router(mitigation.router)
app.include_router(inspections.router)
app.include_router(feedback.router)
app.include_router(alerts.router)
app.include_router(compliance.router)
app.include_router(maps.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "Smart EIA System",
        "methodology": "Statutory Rule-Based Logic (Zero AI / Non-Probabilistic)",
        "environment": settings.ENVIRONMENT,
    }
