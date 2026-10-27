from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from ..database import get_db
from ..models.models import ComplianceRecord
from ..schemas.schemas import ComplianceRecordUpdate, ComplianceRecordResponse

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])

@router.get("", response_model=List[ComplianceRecordResponse])
def get_compliance_records(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ComplianceRecord)
    if project_id:
        query = query.filter(ComplianceRecord.project_id == project_id)
    return query.all()

@router.patch("/{record_id}", response_model=ComplianceRecordResponse)
def update_compliance_record(record_id: str, data: ComplianceRecordUpdate, db: Session = Depends(get_db)):
    record = db.query(ComplianceRecord).filter(ComplianceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Compliance record not found")

    update_data = data.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(record, field, val)

    record.last_evaluated = datetime.datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record
