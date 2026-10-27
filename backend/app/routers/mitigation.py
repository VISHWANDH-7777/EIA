from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import datetime
import os
import shutil
from ..database import get_db
from ..models.models import MitigationAction
from ..schemas.schemas import MitigationActionCreate, MitigationActionUpdate, MitigationActionResponse
from ..config import settings

router = APIRouter(prefix="/api/mitigation", tags=["Mitigation"])

@router.get("", response_model=List[MitigationActionResponse])
def get_mitigations(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MitigationAction)
    if project_id:
        query = query.filter(MitigationAction.project_id == project_id)
    return query.order_by(MitigationAction.created_at.desc()).all()

@router.post("", response_model=MitigationActionResponse, status_code=201)
def create_mitigation(data: MitigationActionCreate, db: Session = Depends(get_db)):
    action_id = f"mit-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.utcnow().isoformat()
    action = MitigationAction(
        id=action_id,
        project_id=data.project_id,
        title=data.title,
        description=data.description or "",
        responsible_person=data.responsible_person,
        due_date=data.due_date,
        status=data.status or "Pending",
        evidence_files=[],
        history=[
            {"action": "Action created", "timestamp": now_iso, "user": "EIA Officer"}
        ],
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action

@router.patch("/{action_id}", response_model=MitigationActionResponse)
def update_mitigation(action_id: str, data: MitigationActionUpdate, db: Session = Depends(get_db)):
    action = db.query(MitigationAction).filter(MitigationAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Mitigation action not found")

    update_data = data.dict(exclude_unset=True)
    action_log = update_data.pop("action_log", None)

    for field, val in update_data.items():
        setattr(action, field, val)

    history_entry = {
        "action": action_log or f"Status changed to {action.status}",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "user": "HSE Officer"
    }
    history = list(action.history or [])
    history.append(history_entry)
    action.history = history
    action.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(action)
    return action

@router.post("/{action_id}/evidence", response_model=MitigationActionResponse)
def upload_mitigation_evidence(
    action_id: str,
    evidence: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    action = db.query(MitigationAction).filter(MitigationAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Mitigation action not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"{int(datetime.datetime.utcnow().timestamp())}_{evidence.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(evidence.file, buffer)

    file_record = {
        "name": evidence.filename,
        "url": f"/uploads/{safe_filename}",
        "uploaded_at": datetime.datetime.utcnow().isoformat()
    }

    files = list(action.evidence_files or [])
    files.append(file_record)
    action.evidence_files = files

    history = list(action.history or [])
    history.append({
        "action": f"Supporting evidence uploaded: {evidence.filename}",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "user": "Field Supervisor"
    })
    action.history = history
    action.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(action)
    return action
