import datetime
from sqlalchemy.orm import Session
from ..models.models import ComplianceRecord, Project, Alert, MitigationAction

def update_compliance_status(db: Session, project_id: str):
    records = db.query(ComplianceRecord).filter(ComplianceRecord.project_id == project_id).all()
    unresolved_alerts = db.query(Alert).filter(
        Alert.project_id == project_id,
        Alert.is_read == False
    ).count()

    overdue_tasks = db.query(MitigationAction).filter(
        MitigationAction.project_id == project_id,
        MitigationAction.status != "Completed"
    ).all()

    today_str = datetime.date.today().isoformat()
    has_overdue = any(t.due_date < today_str for t in overdue_tasks)

    for rec in records:
        if unresolved_alerts > 0 or has_overdue:
            rec.status = "Non-Compliant"
            rec.notes = "Unresolved threshold alerts or overdue mitigation actions require rectification."
        rec.last_evaluated = datetime.datetime.utcnow()
    db.commit()
