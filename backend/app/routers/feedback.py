from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import datetime
from ..database import get_db
from ..models.models import PublicFeedback
from ..schemas.schemas import PublicFeedbackCreate, PublicFeedbackUpdate, PublicFeedbackResponse

router = APIRouter(prefix="/api/feedback", tags=["Public Feedback"])

@router.get("", response_model=List[PublicFeedbackResponse])
def get_feedback(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PublicFeedback)
    if project_id:
        query = query.filter(PublicFeedback.project_id == project_id)
    return query.order_by(PublicFeedback.created_at.desc()).all()

@router.post("", response_model=PublicFeedbackResponse, status_code=201)
def create_feedback(data: PublicFeedbackCreate, db: Session = Depends(get_db)):
    fb_id = f"fb-{uuid.uuid4().hex[:8]}"
    item = PublicFeedback(
        id=fb_id,
        project_id=data.project_id,
        stakeholder_name=data.stakeholder_name,
        email=data.email or "",
        category=data.category or "General Query",
        comment=data.comment,
        status="New",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.patch("/{feedback_id}", response_model=PublicFeedbackResponse)
def update_feedback(feedback_id: str, data: PublicFeedbackUpdate, db: Session = Depends(get_db)):
    fb = db.query(PublicFeedback).filter(PublicFeedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    update_data = data.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(fb, field, val)

    db.commit()
    db.refresh(fb)
    return fb
