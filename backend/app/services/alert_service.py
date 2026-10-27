import datetime
import uuid
from sqlalchemy.orm import Session
from ..models.models import Alert, EnvironmentalReading
from .risk_service import RULES_CATALOG

def check_and_generate_alerts(db: Session, reading: EnvironmentalReading) -> List[Alert]:
    rule = RULES_CATALOG.get(reading.parameter)
    if not rule or not reading.is_valid:
        return []

    breached = False
    is_critical = False
    limit_desc = ""

    if "max_limit" in rule and reading.value > rule["max_limit"]:
        breached = True
        limit_desc = f"Max {rule['max_limit']} {rule['unit']}"
        if "critical_limit" in rule and reading.value >= rule["critical_limit"]:
            is_critical = True

    if "min_limit" in rule and reading.value < rule["min_limit"]:
        breached = True
        limit_desc = f"Min {rule['min_limit']} {rule['unit']}"
        if "critical_limit" in rule and reading.value <= rule["critical_limit"]:
            is_critical = True

    if not breached:
        return []

    # Prevent duplicate alert if identical alert exists in the last 1 hour
    one_hour_ago = datetime.datetime.utcnow() - datetime.timedelta(hours=1)
    existing = db.query(Alert).filter(
        Alert.project_id == reading.project_id,
        Alert.parameter == reading.parameter,
        Alert.is_read == False,
        Alert.timestamp >= one_hour_ago
    ).first()

    if existing:
        return []

    new_alert = Alert(
        id=f"alt-{uuid.uuid4().hex[:8]}",
        project_id=reading.project_id,
        type="Threshold Breach",
        severity="Critical" if is_critical else "High",
        parameter=reading.parameter,
        message=f"{reading.parameter} reading of {reading.value} {reading.unit} exceeded threshold ({limit_desc}).",
        rule_id=rule["rule_id"],
        is_read=False,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return [new_alert]
