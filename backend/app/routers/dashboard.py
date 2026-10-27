from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime
from ..database import get_db
from ..models.models import (
    Project,
    MonitoringStation,
    EnvironmentalReading,
    MitigationAction,
    Inspection,
    PublicFeedback,
    Alert,
    ComplianceRecord,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(Project.status == "Active").count()
    total_stations = db.query(MonitoringStation).count()
    total_readings = db.query(EnvironmentalReading).count()
    unread_alerts = db.query(Alert).filter(Alert.is_read == False).count()

    pending_mitigations = db.query(MitigationAction).filter(MitigationAction.status != "Completed").count()
    today_str = datetime.date.today().isoformat()
    all_pending = db.query(MitigationAction).filter(MitigationAction.status != "Completed").all()
    overdue_mitigations = sum(1 for m in all_pending if m.due_date < today_str)

    compliance_records = db.query(ComplianceRecord).all()
    compliance_counts = {
        "Compliant": 0,
        "Non-Compliant": 0,
        "Pending Review": 0,
        "Insufficient Data": 0,
    }
    for c in compliance_records:
        if c.status in compliance_counts:
            compliance_counts[c.status] += 1

    all_readings = db.query(EnvironmentalReading).order_by(EnvironmentalReading.timestamp.desc()).all()
    latest_by_param = {}
    for r in all_readings:
        if r.parameter not in latest_by_param:
            latest_by_param[r.parameter] = {
                "id": r.id,
                "projectId": r.project_id,
                "stationId": r.station_id,
                "category": r.category,
                "parameter": r.parameter,
                "value": r.value,
                "unit": r.unit,
                "timestamp": r.timestamp.isoformat(),
                "source": r.source,
                "isValid": r.is_valid,
            }

    recent_alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(5).all()
    recent_inspections = db.query(Inspection).order_by(Inspection.created_at.desc()).limit(5).all()
    recent_feedback = db.query(PublicFeedback).order_by(PublicFeedback.created_at.desc()).limit(5).all()

    return {
        "totalProjects": total_projects,
        "activeProjects": active_projects,
        "totalStations": total_stations,
        "totalReadings": total_readings,
        "unreadAlerts": unread_alerts,
        "pendingMitigations": pending_mitigations,
        "overdueMitigations": overdue_mitigations,
        "complianceCounts": compliance_counts,
        "latestReadings": list(latest_by_param.values()),
        "recentAlerts": [
            {
                "id": a.id,
                "projectId": a.project_id,
                "type": a.type,
                "severity": a.severity,
                "parameter": a.parameter,
                "message": a.message,
                "ruleId": a.rule_id,
                "isRead": a.is_read,
                "timestamp": a.timestamp.isoformat(),
            }
            for a in recent_alerts
        ],
        "recentInspections": [
            {
                "id": i.id,
                "projectId": i.project_id,
                "inspectorName": i.inspector_name,
                "inspectionDate": i.inspection_date,
                "observations": i.observations,
                "complianceVerdict": i.compliance_verdict,
                "status": i.status,
            }
            for i in recent_inspections
        ],
        "recentFeedback": [
            {
                "id": f.id,
                "projectId": f.project_id,
                "stakeholderName": f.stakeholder_name,
                "category": f.category,
                "comment": f.comment,
                "status": f.status,
                "createdAt": f.created_at.isoformat(),
            }
            for f in recent_feedback
        ],
    }
