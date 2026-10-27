from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime
from ..database import get_db
from ..models.models import Project
from ..schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p

@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project_id = f"proj-{uuid.uuid4().hex[:8]}"
    project = Project(
        id=project_id,
        name=data.name,
        type=data.type,
        location=data.location,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description or "",
        status=data.status or "Planning",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, data: ProjectUpdate, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = data.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(p, field, val)

    p.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(p)
    return p
