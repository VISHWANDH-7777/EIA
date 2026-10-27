from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./smart_eia.db"
    FRONTEND_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # Statutory Environmental Thresholds
    THRESHOLD_PM25_MAX: float = 35.0
    THRESHOLD_PM10_MAX: float = 150.0
    THRESHOLD_NO2_MAX: float = 100.0
    THRESHOLD_SO2_MAX: float = 75.0
    THRESHOLD_PH_MIN: float = 6.5
    THRESHOLD_PH_MAX: float = 8.5
    THRESHOLD_TURBIDITY_MAX: float = 5.0
    THRESHOLD_DO_MIN: float = 5.0
    THRESHOLD_NOISE_DAY_MAX: float = 65.0
    THRESHOLD_NOISE_NIGHT_MAX: float = 55.0

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
