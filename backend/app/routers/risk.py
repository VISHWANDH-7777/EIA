from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import datetime
from ..database import get_db
from ..models.models import EnvironmentalReading, RiskAssessment
from ..schemas.schemas import RiskAssessRequest, RiskAssessmentResponse
from ..services.risk_service import evaluate_risk

router = APIRouter(prefix="/api/risk", tags=["Risk Assessment"])

@router.post("/assess", response_model=RiskAssessmentResponse)
def assess_project_risk(data: RiskAssessRequest, db: Session = Depends(get_db)):
    readings = db.query(EnvironmentalReading).filter(
        EnvironmentalReading.project_id == data.project_id
    ).all()

    assessment_data = evaluate_risk(readings)
    assessment_id = f"ra-{uuid.uuid4().hex[:8]}"

    assessment = RiskAssessment(
        id=assessment_id,
        project_id=data.project_id,
        risk_level=assessment_data["risk_level"],
        total_evaluated=assessment_data["total_evaluated"],
        breach_count=assessment_data["breach_count"],
        critical_breach_count=assessment_data["critical_breach_count"],
        breaches=assessment_data["breaches"],
        methodology=assessment_data["methodology"],
        rule_set_version=assessment_data["rule_set_version"],
        summary=assessment_data["summary"],
        timestamp=datetime.datetime.utcnow(),
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment

@router.get("/history", response_model=List[RiskAssessmentResponse])
def get_risk_history(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(RiskAssessment)
    if project_id:
        query = query.filter(RiskAssessment.project_id == project_id)
    return query.order_by(RiskAssessment.timestamp.desc()).all()
