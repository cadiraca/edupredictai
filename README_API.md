# Colombia Dropout Prediction API

FastAPI-based REST API for predicting student dropout rates in Colombian municipalities using machine learning.

## Features

- 🎯 **Predict dropout rates** for Colombian municipalities
- 🔄 **What-if scenario analysis** with adjustable parameters
- 📊 **Explore educational indicators** for all municipalities
- 🚀 **Fast and scalable** REST API
- 📖 **Interactive API documentation** with Swagger UI

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the API Server

```bash
cd api
python main.py
```

Or using uvicorn directly:

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Access the API

- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Health Check
```bash
GET /
```
Returns API status and model information.

**Example Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "total_municipalities": 1122,
  "model_features": [
    "over_age_gap",
    "repitencia_lag_1",
    "classroom_density",
    "POBLACIÓN_5_16",
    "is_capital_flag",
    "CÓDIGO_DEPARTAMENTO",
    "primaria_to_media_ratio",
    "dept_risk_lag"
  ]
}
```

### List Municipalities
```bash
GET /municipalities
```
Returns all available municipalities.

**Example Response:**
```json
{
  "municipalities": ["Bogotá, D.C.", "Medellín", "Cali", "..."],
  "count": 1122
}
```

### Get Municipality Features
```bash
GET /municipality/{municipality_name}/features
```
Returns current feature values for a specific municipality.

**Example:**
```bash
curl http://localhost:8000/municipality/Palmira/features
```

**Example Response:**
```json
{
  "municipality_name": "Palmira",
  "features": [
    {
      "name": "over_age_gap",
      "description": "Difference between gross and net coverage",
      "current_value": 15.2,
      "unit": "%"
    },
    {
      "name": "repitencia_lag_1",
      "description": "Last year's repetition rate",
      "current_value": 3.1,
      "unit": "%"
    },
    {
      "name": "classroom_density",
      "description": "Average class size",
      "current_value": 32.5,
      "unit": "students"
    }
  ]
}
```

### Predict Dropout Rate
```bash
POST /predict
```
Predicts dropout rate with optional scenario adjustments.

**Request Body:**
```json
{
  "municipality_name": "Palmira",
  "target_year": 2025,
  "scenario_adjustments": {
    "repitencia_lag_1": 3.5,
    "classroom_density": 30.0,
    "primaria_to_media_ratio": 0.85
  }
}
```

**Example with curl:**
```bash
# Basic prediction (using historical data)
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "municipality_name": "Palmira"
  }'

# What-if scenario: reduce classroom size and improve repetition rate
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "municipality_name": "Cali",
    "target_year": 2025,
    "scenario_adjustments": {
      "repitencia_lag_1": 2.5,
      "classroom_density": 28.0
    }
  }'
```

**Example Response:**
```json
{
  "municipality_name": "Palmira",
  "predicted_dropout_rate": 2.34,
  "predicted_students_impacted": 1053,
  "target_year": 2025,
  "input_parameters": {
    "over_age_gap": 15.2,
    "repitencia_lag_1": 3.5,
    "classroom_density": 30.0,
    "POBLACIÓN_5_16": 45000,
    "is_capital_flag": 0,
    "CÓDIGO_DEPARTAMENTO": 76,
    "primaria_to_media_ratio": 0.85,
    "dept_risk_lag": 2.8
  },
  "department_code": 76
}
```

**Response Fields:**
- `municipality_name`: Official municipality name
- `predicted_dropout_rate`: Predicted dropout rate as a percentage
- `predicted_students_impacted`: **Estimated number of students** who may drop out (calculated as: dropout_rate × student_population)
- `target_year`: Year for the prediction
- `input_parameters`: All parameters used in the prediction model
- `department_code`: Department identifier


### Get Model Features
```bash
GET /model/features
```
Returns list of features used by the model with descriptions.

## Model Parameters

The API allows you to adjust the following parameters for scenario analysis:

| Parameter | Description | Unit | Typical Range |
|-----------|-------------|------|---------------|
| `over_age_gap` | Difference between gross and net coverage | % | 0-30 |
| `repitencia_lag_1` | Previous year's repetition rate | % | 0-10 |
| `classroom_density` | Average class size | students | 15-45 |
| `primaria_to_media_ratio` | Educational funnel ratio | ratio | 0-1.5 |
| `dept_risk_lag` | Regional dropout context | % | 0-10 |
| `POBLACIÓN_5_16` | Student population (5-16 years) | students | 100-200000 |
| `is_capital_flag` | Capital city indicator | flag | 0 or 1 |

## Use Cases

### 1. Policy Planning
Test the impact of educational interventions before implementation:
```bash
# What if we reduce class sizes to 25 students?
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "municipality_name": "Bogotá, D.C.",
    "scenario_adjustments": {
      "classroom_density": 25.0
    }
  }'
```

### 2. Resource Allocation
Identify municipalities at high risk:
```bash
# Get predictions for multiple municipalities
for city in "Cali" "Medellín" "Barranquilla"; do
  curl -X POST "http://localhost:8000/predict" \
    -H "Content-Type: application/json" \
    -d "{\"municipality_name\": \"$city\"}"
done
```

### 3. Scenario Comparison
Compare different intervention strategies:
```bash
# Scenario A: Focus on reducing repetition
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "municipality_name": "Palmira",
    "scenario_adjustments": {"repitencia_lag_1": 2.0}
  }'

# Scenario B: Focus on class size
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "municipality_name": "Palmira",
    "scenario_adjustments": {"classroom_density": 25.0}
  }'
```

## Integration with UI

### JavaScript/React Example

```javascript
// Fetch municipalities
const municipalities = await fetch('http://localhost:8000/municipalities')
  .then(res => res.json());

// Get baseline prediction
const baseline = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    municipality_name: 'Palmira'
  })
}).then(res => res.json());

// Run scenario with adjusted parameters
const scenario = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    municipality_name: 'Palmira',
    scenario_adjustments: {
      classroom_density: 28.0,
      repitencia_lag_1: 2.5
    }
  })
}).then(res => res.json());

console.log(`Baseline: ${baseline.predicted_dropout_rate}%`);
console.log(`Scenario: ${scenario.predicted_dropout_rate}%`);
console.log(`Improvement: ${(baseline.predicted_dropout_rate - scenario.predicted_dropout_rate).toFixed(2)}%`);
```

### Python Client Example

```python
import requests

API_URL = "http://localhost:8000"

# Get municipalities
response = requests.get(f"{API_URL}/municipalities")
municipalities = response.json()["municipalities"]

# Get prediction
prediction = requests.post(
    f"{API_URL}/predict",
    json={
        "municipality_name": "Palmira",
        "scenario_adjustments": {
            "classroom_density": 30.0,
            "repitencia_lag_1": 2.5
        }
    }
).json()

print(f"Predicted dropout rate: {prediction['predicted_dropout_rate']}%")
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Successful request
- `404 Not Found` - Municipality not found
- `422 Unprocessable Entity` - Invalid request body
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Model not loaded

**Example Error Response:**
```json
{
  "detail": "Municipality 'InvalidName' not found"
}
```

## Development

### Running Tests
```bash
# TODO: Add pytest tests
pytest tests/
```

### Project Structure
```
pyFirstHANApal/
├── api/
│   ├── __init__.py
│   ├── main.py              # FastAPI app setup
│   ├── models.py            # Pydantic models
│   ├── routes.py            # API endpoints
│   └── predictor_service.py # Model wrapper
├── model.py                 # ML model class
├── my_colombia_model.pkl    # Trained model
├── requirements.txt         # Dependencies
└── README_API.md           # This file
```

## Production Deployment

### Using Docker (Recommended)

Create a `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t dropout-prediction-api .
docker run -p 8000:8000 dropout-prediction-api
```

### Environment Variables

```bash
# Optional configuration
export API_HOST=0.0.0.0
export API_PORT=8000
export MODEL_PATH=/path/to/my_colombia_model.pkl
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
