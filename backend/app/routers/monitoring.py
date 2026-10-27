from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import datetime
from ..database import get_db
from ..models.models import EnvironmentalReading, MonitoringStation
from ..schemas.schemas import (
    EnvironmentalReadingCreate,
    EnvironmentalReadingResponse,
    MonitoringStationCreate,
    MonitoringStationResponse,
)
from ..services.alert_service import check_and_generate_alerts

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])

@router.get("/stations", response_model=List[MonitoringStationResponse])
def get_stations(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MonitoringStation)
    if project_id:
        query = query.filter(MonitoringStation.project_id == project_id)
    return query.all()

@router.post("/stations", response_model=MonitoringStationResponse, status_code=201)
def create_station(data: MonitoringStationCreate, db: Session = Depends(get_db)):
    station_id = f"st-{uuid.uuid4().hex[:8]}"
    station = MonitoringStation(
        id=station_id,
        project_id=data.project_id,
        name=data.name,
        latitude=data.latitude,
        longitude=data.longitude,
        parameters=data.parameters,
        station_type=data.station_type or "Fixed Continuous",
        status=data.status or "Active",
    )
    db.add(station)
    db.commit()
    db.refresh(station)
    return station

@router.get("/readings", response_model=List[EnvironmentalReadingResponse])
def get_readings(
    project_id: Optional[str] = None,
    category: Optional[str] = None,
    limit: Optional[int] = Query(default=100, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(EnvironmentalReading)
    if project_id:
        query = query.filter(EnvironmentalReading.project_id == project_id)
    if category:
        query = query.filter(EnvironmentalReading.category == category)
    query = query.order_by(EnvironmentalReading.timestamp.desc())
    return query.limit(limit).all()

@router.get("/latest", response_model=List[EnvironmentalReadingResponse])
def get_latest_readings(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(EnvironmentalReading)
    if project_id:
        query = query.filter(EnvironmentalReading.project_id == project_id)
    all_readings = query.order_by(EnvironmentalReading.timestamp.desc()).all()
    latest_by_param = {}
    for r in all_readings:
        if r.parameter not in latest_by_param:
            latest_by_param[r.parameter] = r
    return list(latest_by_param.values())

@router.get("/history", response_model=List[EnvironmentalReadingResponse])
def get_reading_history(
    project_id: Optional[str] = None,
    parameter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(EnvironmentalReading)
    if project_id:
        query = query.filter(EnvironmentalReading.project_id == project_id)
    if parameter:
        query = query.filter(EnvironmentalReading.parameter == parameter)
    return query.order_by(EnvironmentalReading.timestamp.asc()).all()

@router.post("/readings", response_model=EnvironmentalReadingResponse, status_code=201)
def record_reading(data: EnvironmentalReadingCreate, db: Session = Depends(get_db)):
    reading_id = f"rd-{uuid.uuid4().hex[:8]}"
    reading = EnvironmentalReading(
        id=reading_id,
        project_id=data.project_id,
        station_id=data.station_id,
        category=data.category,
        parameter=data.parameter,
        value=data.value,
        unit=data.unit,
        timestamp=data.timestamp or datetime.datetime.utcnow(),
        source=data.source or "manual",
        is_valid=data.is_valid if data.is_valid is not None else True,
        notes=data.notes,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # Check for threshold breach alerts
    check_and_generate_alerts(db, reading)

    return reading
