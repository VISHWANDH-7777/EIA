from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
import datetime

# Project Schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    type: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=200)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    description: Optional[str] = ""
    status: Optional[str] = "Planning"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# Station Schemas
class MonitoringStationCreate(BaseModel):
    project_id: str
    name: str
    latitude: float
    longitude: float
    parameters: List[str] = []
    station_type: Optional[str] = "Fixed Continuous"
    status: Optional[str] = "Active"

class MonitoringStationResponse(BaseModel):
    id: str
    project_id: str
    name: str
    latitude: float
    longitude: float
    parameters: List[str]
    station_type: str
    status: str
    last_active: datetime.datetime

    class Config:
        from_attributes = True

# Reading Schemas
class EnvironmentalReadingCreate(BaseModel):
    project_id: str
    station_id: Optional[str] = None
    category: str  # air, water, noise
    parameter: str  # PM2.5, PM10, NO2, pH, Turbidity, DO, etc.
    value: float
    unit: str
    timestamp: Optional[datetime.datetime] = None
    source: Optional[str] = "manual"  # manual, sensor, simulated
    is_valid: Optional[bool] = True
    notes: Optional[str] = None

class EnvironmentalReadingResponse(BaseModel):
    id: str
    project_id: str
    station_id: Optional[str]
    category: str
    parameter: str
    value: float
    unit: str
    timestamp: datetime.datetime
    source: str
    is_valid: bool
    notes: Optional[str]

    class Config:
        from_attributes = True

# Risk Assessment Schemas
class RiskAssessRequest(BaseModel):
    project_id: str

class BreachDetail(BaseModel):
    parameter: str
    category: str
    reading_value: float
    unit: str
    threshold_value: str
    rule_id: str
    rule_title: str
    standard_reference: str
    is_critical: bool
    explanation: str
    recommended_mitigation: str

class RiskAssessmentResponse(BaseModel):
    id: str
    project_id: str
    risk_level: str
    total_evaluated: int
    breach_count: int
    critical_breach_count: int
    breaches: List[Dict[str, Any]]
    methodology: str
    rule_set_version: str
    summary: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Mitigation Action Schemas
class MitigationActionCreate(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = ""
    responsible_person: str
    due_date: str  # YYYY-MM-DD
    status: Optional[str] = "Pending"

class MitigationActionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    responsible_person: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    action_log: Optional[str] = None

class MitigationActionResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    responsible_person: str
    due_date: str
    status: str
    evidence_files: List[Dict[str, Any]]
    history: List[Dict[str, Any]]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# Inspection Schemas
class InspectionCreate(BaseModel):
    project_id: str
    inspector_name: str
    inspection_date: Optional[str] = None
    observations: str
    compliance_verdict: Optional[str] = "Pending Review"
    status: Optional[str] = "Submitted"

class InspectionUpdate(BaseModel):
    observations: Optional[str] = None
    compliance_verdict: Optional[str] = None
    status: Optional[str] = None
    review_notes: Optional[str] = None

class InspectionResponse(BaseModel):
    id: str
    project_id: str
    inspector_name: str
    inspection_date: str
    observations: str
    compliance_verdict: str
    status: str
    photos: List[Dict[str, Any]]
    review_notes: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Feedback Schemas
class PublicFeedbackCreate(BaseModel):
    project_id: str
    stakeholder_name: str
    email: Optional[str] = ""
    category: Optional[str] = "General Query"
    comment: str

class PublicFeedbackUpdate(BaseModel):
    status: Optional[str] = None
    response_note: Optional[str] = None

class PublicFeedbackResponse(BaseModel):
    id: str
    project_id: str
    stakeholder_name: str
    email: str
    category: str
    comment: str
    status: str
    response_note: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: str
    project_id: str
    type: str
    severity: str
    parameter: Optional[str]
    message: str
    rule_id: Optional[str]
    is_read: bool
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Compliance Record Schemas
class ComplianceRecordUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class ComplianceRecordResponse(BaseModel):
    id: str
    project_id: str
    standard_title: str
    category: str
    status: str
    last_evaluated: datetime.datetime
    notes: str

    class Config:
        from_attributes = True

# Dashboard Summary
class DashboardSummaryResponse(BaseModel):
    totalProjects: int
    activeProjects: int
    totalStations: int
    totalReadings: int
    unreadAlerts: int
    pendingMitigations: int
    overdueMitigations: int
    complianceCounts: Dict[str, int]
    latestReadings: List[Dict[str, Any]]
    recentAlerts: List[Dict[str, Any]]
    recentInspections: List[Dict[str, Any]]
    recentFeedback: List[Dict[str, Any]]
