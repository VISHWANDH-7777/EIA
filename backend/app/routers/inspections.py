from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import datetime
import os
import shutil
from ..database import get_db
from ..models.models import Inspection
from ..schemas.schemas import InspectionCreate, InspectionUpdate, InspectionResponse
from ..config import settings

router = APIRouter(prefix="/api/inspections", tags=["Inspections"])

@router.get("", response_model=List[InspectionResponse])
def get_inspections(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Inspection)
    if project_id:
        query = query.filter(Inspection.project_id == project_id)
    return query.order_by(Inspection.created_at.desc()).all()

@router.post("", response_model=InspectionResponse, status_code=201)
def create_inspection(data: InspectionCreate, db: Session = Depends(get_db)):
    insp_id = f"insp-{uuid.uuid4().hex[:8]}"
    inspection = Inspection(
        id=insp_id,
        project_id=data.project_id,
        inspector_name=data.inspector_name,
        inspection_date=data.inspection_date or datetime.date.today().isoformat(),
        observations=data.observations,
        compliance_verdict=data.compliance_verdict or "Pending Review",
        status=data.status or "Submitted",
        photos=[],
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)
    return inspection

@router.patch("/{inspection_id}", response_model=InspectionResponse)
def update_inspection(inspection_id: str, data: InspectionUpdate, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection record not found")

    update_data = data.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(inspection, field, val)

    db.commit()
    db.refresh(inspection)
    return inspection

@router.post("/{inspection_id}/photo", response_model=InspectionResponse)
def upload_inspection_photo(
    inspection_id: str,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection record not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"insp_{int(datetime.datetime.utcnow().timestamp())}_{photo.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    photo_record = {
        "name": photo.filename,
        "url": f"/uploads/{safe_filename}",
    }
    photos = list(inspection.photos or [])
    photos.append(photo_record)
    inspection.photos = photos

    db.commit()
    db.refresh(inspection)
    return inspection
