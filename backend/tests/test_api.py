import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import io

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.services.risk_service import evaluate_risk, RULES_CATALOG
from backend.app.models.models import EnvironmentalReading

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_project_crud():
    # Create project
    payload = {
        "name": "Bay Area Desalination Facility",
        "type": "Water Infrastructure",
        "location": "Coastal Zone Sector 4",
        "latitude": 37.7833,
        "longitude": -122.4167,
        "description": "Seawater reverse osmosis plant with brine diffuser pipelines.",
        "status": "Active"
    }
    create_res = client.post("/api/projects", json=payload)
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["name"] == payload["name"]
    proj_id = data["id"]

    # Get project by ID
    get_res = client.get(f"/api/projects/{proj_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == proj_id

    # Patch project
    patch_res = client.patch(f"/api/projects/{proj_id}", json={"status": "Under Review"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Under Review"

def test_invalid_project_coordinates():
    payload = {
        "name": "Invalid Project",
        "type": "Industrial",
        "location": "Somewhere",
        "latitude": 999.0, # invalid
        "longitude": 0.0
    }
    res = client.post("/api/projects", json=payload)
    assert res.status_code == 422 # Pydantic validation error

def test_environmental_readings_and_threshold_alert():
    # Create project first
    p_res = client.post("/api/projects", json={
        "name": "Highway Soundwall Project",
        "type": "Transportation",
        "location": "Highway 101 KM 12",
        "latitude": 37.75,
        "longitude": -122.40,
        "status": "Active"
    })
    proj_id = p_res.json()["id"]

    # Record compliant reading
    res_normal = client.post("/api/monitoring/readings", json={
        "project_id": proj_id,
        "category": "noise",
        "parameter": "Noise_Day",
        "value": 58.5, # Below 65 dBA limit
        "unit": "dBA",
        "source": "sensor",
        "is_valid": True
    })
    assert res_normal.status_code == 201

    # Record breach reading
    res_breach = client.post("/api/monitoring/readings", json={
        "project_id": proj_id,
        "category": "noise",
        "parameter": "Noise_Day",
        "value": 72.0, # Above 65 dBA limit
        "unit": "dBA",
        "source": "sensor",
        "is_valid": True
    })
    assert res_breach.status_code == 201

    # Check alert was created
    alerts_res = client.get(f"/api/alerts?project_id={proj_id}")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert any(a["parameter"] == "Noise_Day" for a in alerts)

def test_rule_based_risk_classification():
    # Empty readings -> Insufficient Data
    res_empty = evaluate_risk([])
    assert res_empty["risk_level"] == "Insufficient Data"

    # Normal reading -> Low risk
    r1 = EnvironmentalReading(
        project_id="test-p",
        category="air",
        parameter="PM2.5",
        value=20.0,
        unit="µg/m³",
        is_valid=True
    )
    res_low = evaluate_risk([r1])
    assert res_low["risk_level"] == "Low"
    assert res_low["breach_count"] == 0

    # Critical breach -> High risk
    r_crit = EnvironmentalReading(
        project_id="test-p",
        category="air",
        parameter="PM2.5",
        value=65.0, # Critical limit is 55.0
        unit="µg/m³",
        is_valid=True
    )
    res_high = evaluate_risk([r_crit])
    assert res_high["risk_level"] == "High"
    assert res_high["critical_breach_count"] == 1
    assert "AIR-R01" in res_high["breaches"][0]["rule_id"]

def test_mitigation_workflow_and_evidence():
    # Create mitigation
    p_res = client.post("/api/projects", json={
        "name": "Solar Substation",
        "type": "Energy",
        "location": "Sector North",
        "latitude": 37.70,
        "longitude": -122.30
    })
    proj_id = p_res.json()["id"]

    mit_res = client.post("/api/mitigation", json={
        "project_id": proj_id,
        "title": "Install Acoustic Baffle Curtains",
        "description": "Around inverter transformers",
        "responsible_person": "Eng. Sarah Vance",
        "due_date": "2026-11-15",
        "status": "Pending"
    })
    assert mit_res.status_code == 201
    mit_id = mit_res.json()["id"]

    # Patch status to In Progress
    patch_res = client.patch(f"/api/mitigation/{mit_id}", json={
        "status": "In Progress",
        "action_log": "Procurement of acoustic foam confirmed."
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "In Progress"
    assert len(patch_res.json()["history"]) >= 2

    # Upload evidence file
    fake_file = io.BytesIO(b"Simulated Certificate of Acoustic Compliance")
    upload_res = client.post(
        f"/api/mitigation/{mit_id}/evidence",
        files={"evidence": ("cert.pdf", fake_file, "application/pdf")}
    )
    assert upload_res.status_code == 200
    assert len(upload_res.json()["evidence_files"]) == 1

def test_feedback_and_inspection():
    p_res = client.post("/api/projects", json={
        "name": "River Bridge Repair",
        "type": "Civic",
        "location": "North Crossing",
        "latitude": 37.82,
        "longitude": -122.35
    })
    proj_id = p_res.json()["id"]

    # Submit feedback
    fb_res = client.post("/api/feedback", json={
        "project_id": proj_id,
        "stakeholder_name": "Local Anglers Club",
        "email": "anglers@local.org",
        "category": "Water & Drainage",
        "comment": "Turbidity increased downstream of piling operations."
    })
    assert fb_res.status_code == 201
    fb_id = fb_res.json()["id"]

    # Review feedback
    fb_patch = client.patch(f"/api/feedback/{fb_id}", json={
        "status": "Under Review",
        "response_note": "Field turbidity grab sample scheduled."
    })
    assert fb_patch.status_code == 200
    assert fb_patch.json()["status"] == "Under Review"

    # Field inspection
    insp_res = client.post("/api/inspections", json={
        "project_id": proj_id,
        "inspector_name": "EIA Auditor Robert Chen",
        "observations": "Perimeter silt curtains intact; minor turbidity plume contained.",
        "compliance_verdict": "Compliant",
        "status": "Reviewed"
    })
    assert insp_res.status_code == 201
    assert insp_res.json()["compliance_verdict"] == "Compliant"
