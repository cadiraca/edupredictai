"""
FastAPI application for Dropout Prediction Model
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.routes import router, set_predictor_service
from api.predictor_service import PredictorService


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events
    """
    # Startup: Load the model
    print("Starting up... Loading model...")
    try:
        # Get the model path relative to the project root
        model_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "my_colombia_model.pkl"
        )
        
        predictor_service = PredictorService(model_path=model_path)
        set_predictor_service(predictor_service)
        print(f"✓ Model loaded successfully")
        print(f"✓ Total municipalities available: {predictor_service.get_municipality_count()}")
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Colombia Dropout Prediction API",
    description="""
    API for predicting student dropout rates in Colombian municipalities.
    
    ## Features
    
    * **Predict dropout rates** with baseline historical data
    * **Run what-if scenarios** by adjusting key parameters
    * **Explore municipalities** and their educational indicators
    * **Understand model features** and their impact
    
    ## Model Parameters
    
    The model uses 8 key features:
    - Over-age gap (difference between gross and net coverage)
    - Repetition rate (previous year)
    - Classroom density (average class size)
    - Primary to secondary ratio (educational funnel)
    - Regional dropout context (department average)
    - Student population (5-16 years)
    - Capital city indicator
    - Department code
    
    ## Use Cases
    
    - Policy planning: Test impact of interventions before implementation
    - Resource allocation: Identify high-risk municipalities
    - Scenario analysis: Compare different educational strategies
    - Monitoring: Track predicted vs actual outcomes
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, tags=["Dropout Prediction"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
