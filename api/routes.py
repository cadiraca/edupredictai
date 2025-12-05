"""
API route handlers
"""
from fastapi import APIRouter, HTTPException
from typing import Dict
from .models import (
    PredictionRequest,
    PredictionResponse,
    MunicipalityListResponse,
    FeaturesResponse,
    FeatureInfo,
    HealthResponse
)
from .predictor_service import PredictorService
from .analytics_service import AnalyticsService

# Initialize router
router = APIRouter()

# Initialize services (will be set on startup)
predictor_service: PredictorService = None
analytics_service: AnalyticsService = None


def set_predictor_service(service: PredictorService):
    """Set the predictor service instance"""
    global predictor_service, analytics_service
    predictor_service = service
    # Initialize analytics service with predictor service
    analytics_service = AnalyticsService(service)


@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint - returns API status and model information
    """
    if predictor_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    return HealthResponse(
        status="healthy",
        model_loaded=predictor_service.is_model_loaded(),
        total_municipalities=predictor_service.get_municipality_count(),
        model_features=predictor_service.get_model_features()
    )


@router.get("/municipalities", response_model=MunicipalityListResponse)
async def list_municipalities():
    """
    Get list of all available municipalities
    """
    if predictor_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    municipalities = predictor_service.get_municipalities()
    
    return MunicipalityListResponse(
        municipalities=municipalities,
        count=len(municipalities)
    )


@router.get("/departments")
async def list_departments():
    """
    Get list of departments with their municipalities for cascading selection
    
    Returns a list of departments, each containing:
    - code: Department code
    - name: Department name (or code if name not available)
    - municipalities: List of municipality names in this department
    - count: Number of municipalities in this department
    """
    if predictor_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    departments = predictor_service.get_departments_with_municipalities()
    
    return {
        "departments": departments,
        "total_departments": len(departments)
    }


@router.get("/municipality/{municipality_name}/features", response_model=FeaturesResponse)
async def get_municipality_features(municipality_name: str):
    """
    Get current feature values for a specific municipality
    """
    if predictor_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    try:
        feature_data = predictor_service.get_municipality_features(municipality_name)
        
        features = [
            FeatureInfo(
                name=f['name'],
                description=f['description'],
                current_value=f['current_value'],
                unit=f.get('unit')
            )
            for f in feature_data['features']
        ]
        
        return FeaturesResponse(
            municipality_name=feature_data['municipality_name'],
            features=features
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/predict", response_model=PredictionResponse)
async def predict_dropout(request: PredictionRequest):
    """
    Predict dropout rate for a municipality with optional scenario adjustments
    
    This endpoint allows you to:
    - Get a baseline prediction using historical data
    - Run "what-if" scenarios by adjusting specific parameters
    
    Example scenarios:
    - What if we reduce classroom size to 30 students?
    - What if we improve the repetition rate to 2.5%?
    - What if we increase the educational funnel ratio to 0.9?
    """
    if predictor_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    try:
        prediction, input_params, actual_name = predictor_service.predict(
            municipality_name=request.municipality_name,
            target_year=request.target_year,
            scenario_adjustments=request.scenario_adjustments
        )
        
        # Extract department code from input parameters
        dept_code = int(input_params.get('CÓDIGO_DEPARTAMENTO', 0))
        
        # Calculate estimated number of students impacted
        population = input_params.get('POBLACIÓN_5_16', 0)
        students_impacted = int(round((prediction / 100) * population))
        
        return PredictionResponse(
            municipality_name=actual_name,
            predicted_dropout_rate=round(prediction, 2),
            predicted_students_impacted=students_impacted,
            target_year=request.target_year,
            input_parameters=input_params,
            department_code=dept_code
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/model/features")
async def get_model_features():
    """
    Get list of features used by the model
    """
    if predictor_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    features = predictor_service.get_model_features()
    
    feature_info = {
        'over_age_gap': 'Difference between gross and net coverage (%)',
        'repitencia_lag_1': 'Previous year\'s repetition rate (%)',
        'classroom_density': 'Average class size (students)',
        'primaria_to_media_ratio': 'Educational funnel ratio (0-1.5)',
        'dept_risk_lag': 'Regional dropout context - Department average (%)',
        'POBLACIÓN_5_16': 'Student population aged 5-16',
        'is_capital_flag': 'Capital city indicator (0 or 1)',
        'CÓDIGO_DEPARTAMENTO': 'Department code'
    }
    
    return {
        "features": features,
        "descriptions": {feat: feature_info.get(feat, "No description") for feat in features}
    }


# ==================== ANALYTICS ENDPOINTS ====================

@router.get("/analytics/national")
async def get_national_analytics():
    """
    Get national-level analytics and statistics
    
    Returns aggregated statistics including:
    - Current national dropout rate
    - Total student population
    - Year-over-year changes
    - Funnel efficiency
    - Trend direction
    """
    if analytics_service is None:
        raise HTTPException(status_code=503, detail="Analytics service not initialized")
    
    try:
        stats = analytics_service.get_national_analytics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting national analytics: {str(e)}")


@router.get("/analytics/departments")
async def get_department_analytics():
    """
    Get department-level comparison analytics
    
    Returns all departments with:
    - Dropout rate
    - Student count
    - Risk level (High/Medium/Low)
    - Municipality count
    
    Sorted by dropout rate (highest first)
    """
    if analytics_service is None:
        raise HTTPException(status_code=503, detail="Analytics service not initialized")
    
    try:
        departments = analytics_service.get_department_analytics()
        return {
            "departments": departments,
            "count": len(departments)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting department analytics: {str(e)}")


@router.get("/analytics/history")
async def get_historical_trends(department_code: str = None):
    """
    Get historical trends over time
    
    Args:
        department_code: Optional department code to filter results
        
    Returns yearly statistics including:
    - Dropout rate
    - Student population
    - Funnel efficiency ratio
    
    Data spans from 2011 to latest available year
    """
    if analytics_service is None:
        raise HTTPException(status_code=503, detail="Analytics service not initialized")
    
    try:
        trends = analytics_service.get_historical_trends(department_code)
        return {
            "data": trends,
            "count": len(trends),
            "department_code": department_code
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting historical trends: {str(e)}")
