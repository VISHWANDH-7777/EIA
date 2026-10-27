from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.models import Alert
from ..schemas.schemas import AlertResponse

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if project_id:
        query = query.filter(Alert.project_id == project_id)
    return query.order_by(Alert.timestamp.desc()).all()

@router.patch("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_read(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return alert

@router.patch("/read-all")
def mark_all_alerts_read(db: Session = Depends(get_db)):
    db.query(Alert).filter(Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"success": True}
