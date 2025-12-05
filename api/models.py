"""
Pydantic models for request and response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, List


class ScenarioAdjustments(BaseModel):
    """Optional adjustments for what-if scenario analysis"""
    over_age_gap: Optional[float] = Field(None, description="Difference between gross and net coverage")
    repitencia_lag_1: Optional[float] = Field(None, description="Previous year's repetition rate (%)")
    classroom_density: Optional[float] = Field(None, description="Average class size")
    primaria_to_media_ratio: Optional[float] = Field(None, description="Educational funnel ratio (0-1.5)")
    dept_risk_lag: Optional[float] = Field(None, description="Regional dropout context (%)")
    POBLACIÓN_5_16: Optional[float] = Field(None, description="Student population (5-16 years)")
    is_capital_flag: Optional[float] = Field(None, description="Capital city flag (0 or 1)")


class PredictionRequest(BaseModel):
    """Request model for dropout prediction"""
    municipality_name: str = Field(..., description="Name of the municipality")
    target_year: int = Field(2025, description="Target year for prediction")
    scenario_adjustments: Optional[Dict[str, float]] = Field(None, description="Optional parameter adjustments")

    class Config:
        json_schema_extra = {
            "example": {
                "municipality_name": "Palmira",
                "target_year": 2025,
                "scenario_adjustments": {
                    "repitencia_lag_1": 3.5,
                    "classroom_density": 35.0
                }
            }
        }


class PredictionResponse(BaseModel):
    """Response model for dropout prediction"""
    municipality_name: str = Field(..., description="Municipality name")
    predicted_dropout_rate: float = Field(..., description="Predicted dropout rate (%)")
    predicted_students_impacted: int = Field(..., description="Estimated number of students impacted by dropout")
    target_year: int = Field(..., description="Target year")
    input_parameters: Dict[str, float] = Field(..., description="Parameters used for prediction")
    department_code: Optional[int] = Field(None, description="Department code")
    
    class Config:
        json_schema_extra = {
            "example": {
                "municipality_name": "Palmira",
                "predicted_dropout_rate": 2.34,
                "predicted_students_impacted": 1053,
                "target_year": 2025,
                "input_parameters": {
                    "over_age_gap": 15.2,
                    "repitencia_lag_1": 3.1,
                    "classroom_density": 32.5,
                    "POBLACIÓN_5_16": 45000,
                    "is_capital_flag": 0,
                    "CÓDIGO_DEPARTAMENTO": 76,
                    "primaria_to_media_ratio": 0.82,
                    "dept_risk_lag": 2.8
                },
                "department_code": 76
            }
        }


class MunicipalityInfo(BaseModel):
    """Basic municipality information"""
    municipality_name: str
    department_code: int
    is_capital: bool
    population_5_16: float
    latest_year: int


class MunicipalityListResponse(BaseModel):
    """Response model for municipality list"""
    municipalities: List[str] = Field(..., description="List of available municipality names")
    count: int = Field(..., description="Total number of municipalities")


class FeatureInfo(BaseModel):
    """Information about a specific feature"""
    name: str
    description: str
    current_value: float
    unit: Optional[str] = None


class FeaturesResponse(BaseModel):
    """Response model for municipality features"""
    municipality_name: str
    features: List[FeatureInfo]


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    total_municipalities: int
    model_features: List[str]
