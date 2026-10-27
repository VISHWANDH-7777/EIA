from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models.models import Project, MonitoringStation

router = APIRouter(prefix="/api/maps", tags=["Maps"])

@router.get("/projects")
def get_map_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "type": p.type,
            "location": p.location,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "status": p.status,
        }
        for p in projects
    ]

@router.get("/stations")
def get_map_stations(db: Session = Depends(get_db)):
    stations = db.query(MonitoringStation).all()
    results = []
    for s in stations:
        project = db.query(Project).filter(Project.id == s.project_id).first()
        results.append({
            "id": s.id,
            "projectId": s.project_id,
            "projectName": project.name if project else "Unknown",
            "name": s.name,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "parameters": s.parameters,
            "stationType": s.station_type,
            "status": s.status,
        })
    return results
