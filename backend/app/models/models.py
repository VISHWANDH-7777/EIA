import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, default="")
    status = Column(String, default="Active")  # Planning, Active, Under Review, Completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    stations = relationship("MonitoringStation", back_populates="project", cascade="all, delete-orphan")
    readings = relationship("EnvironmentalReading", back_populates="project", cascade="all, delete-orphan")
    mitigations = relationship("MitigationAction", back_populates="project", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="project", cascade="all, delete-orphan")
    feedback = relationship("PublicFeedback", back_populates="project", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="project", cascade="all, delete-orphan")
    compliance_records = relationship("ComplianceRecord", back_populates="project", cascade="all, delete-orphan")

class MonitoringStation(Base):
    __tablename__ = "monitoring_stations"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    parameters = Column(JSON, default=list)  # list of parameters monitored
    station_type = Column(String, default="Fixed Continuous")
    status = Column(String, default="Active")
    last_active = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="stations")

class EnvironmentalReading(Base):
    __tablename__ = "environmental_readings"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    station_id = Column(String, ForeignKey("monitoring_stations.id"), nullable=True, index=True)
    category = Column(String, nullable=False)  # air, water, noise
    parameter = Column(String, nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    source = Column(String, default="manual")  # manual, sensor, simulated
    is_valid = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    project = relationship("Project", back_populates="readings")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    risk_level = Column(String, nullable=False)  # Low, Medium, High, Insufficient Data
    total_evaluated = Column(Integer, default=0)
    breach_count = Column(Integer, default=0)
    critical_breach_count = Column(Integer, default=0)
    breaches = Column(JSON, default=list)
    methodology = Column(String, nullable=False)
    rule_set_version = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class MitigationAction(Base):
    __tablename__ = "mitigation_actions"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    responsible_person = Column(String, nullable=False)
    due_date = Column(String, nullable=False)  # YYYY-MM-DD
    status = Column(String, default="Pending")  # Pending, In Progress, Completed
    evidence_files = Column(JSON, default=list)  # list of {name, url, uploadedAt}
    history = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="mitigations")

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    inspector_name = Column(String, nullable=False)
    inspection_date = Column(String, nullable=False)
    observations = Column(Text, nullable=False)
    compliance_verdict = Column(String, default="Pending Review")  # Compliant, Non-Compliant, Pending Review
    status = Column(String, default="Submitted")  # Draft, Submitted, Reviewed
    photos = Column(JSON, default=list)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="inspections")

class PublicFeedback(Base):
    __tablename__ = "public_feedback"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    stakeholder_name = Column(String, nullable=False)
    email = Column(String, default="")
    category = Column(String, default="General Query")
    comment = Column(Text, nullable=False)
    status = Column(String, default="New")  # New, Under Review, Addressed
    response_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="feedback")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # Threshold Breach, Overdue Mitigation, Compliance Issue
    severity = Column(String, nullable=False)  # Low, Medium, High, Critical
    parameter = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    rule_id = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="alerts")

class ComplianceRecord(Base):
    __tablename__ = "compliance_records"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    standard_title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    status = Column(String, default="Pending Review")  # Compliant, Non-Compliant, Pending Review, Insufficient Data
    last_evaluated = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, default="")

    project = relationship("Project", back_populates="compliance_records")
