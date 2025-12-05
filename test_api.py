"""
Test script for the Dropout Prediction API
Demonstrates how to interact with the API
"""
import requests
import json

API_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("\n=== Testing Health Check ===")
    response = requests.get(f"{API_URL}/")
    data = response.json()
    print(f"Status: {data['status']}")
    print(f"Model loaded: {data['model_loaded']}")
    print(f"Total municipalities: {data['total_municipalities']}")
    print(f"Model features: {data['model_features']}")
    return response.status_code == 200

def test_list_municipalities():
    """Test listing municipalities"""
    print("\n=== Testing List Municipalities ===")
    response = requests.get(f"{API_URL}/municipalities")
    data = response.json()
    print(f"Total municipalities: {data['count']}")
    print(f"First 10 municipalities: {data['municipalities'][:10]}")
    return response.status_code == 200

def test_get_features():
    """Test getting features for a municipality"""
    print("\n=== Testing Get Municipality Features ===")
    municipality = "Palmira"
    response = requests.get(f"{API_URL}/municipality/{municipality}/features")
    data = response.json()
    print(f"Municipality: {data['municipality_name']}")
    print(f"Features:")
    for feature in data['features']:
        print(f"  - {feature['name']}: {feature['current_value']} {feature['unit'] or ''}")
    return response.status_code == 200

def test_baseline_prediction():
    """Test baseline prediction without adjustments"""
    print("\n=== Testing Baseline Prediction ===")
    payload = {
        "municipality_name": "Palmira",
        "target_year": 2025
    }
    response = requests.post(f"{API_URL}/predict", json=payload)
    data = response.json()
    print(f"Municipality: {data['municipality_name']}")
    print(f"Predicted dropout rate: {data['predicted_dropout_rate']}%")
    print(f"Target year: {data['target_year']}")
    print(f"Input parameters used:")
    for param, value in data['input_parameters'].items():
        print(f"  - {param}: {value}")
    return response.status_code == 200

def test_scenario_prediction():
    """Test prediction with scenario adjustments"""
    print("\n=== Testing Scenario Prediction ===")
    payload = {
        "municipality_name": "Cali",
        "target_year": 2025,
        "scenario_adjustments": {
            "classroom_density": 30.0,
            "repitencia_lag_1": 2.5,
            "primaria_to_media_ratio": 0.85
        }
    }
    response = requests.post(f"{API_URL}/predict", json=payload)
    data = response.json()
    print(f"Municipality: {data['municipality_name']}")
    print(f"Predicted dropout rate: {data['predicted_dropout_rate']}%")
    print(f"Scenario adjustments applied:")
    for param, value in payload['scenario_adjustments'].items():
        print(f"  - {param}: {value}")
    return response.status_code == 200

def test_comparison():
    """Compare baseline vs scenario"""
    print("\n=== Testing Baseline vs Scenario Comparison ===")
    municipality = "Bogotá, D.C."
    
    # Baseline
    baseline_response = requests.post(
        f"{API_URL}/predict",
        json={"municipality_name": municipality}
    )
    baseline = baseline_response.json()
    
    # Scenario: Improve classroom density and repetition rate
    scenario_response = requests.post(
        f"{API_URL}/predict",
        json={
            "municipality_name": municipality,
            "scenario_adjustments": {
                "classroom_density": 25.0,
                "repitencia_lag_1": 2.0
            }
        }
    )
    scenario = scenario_response.json()
    
    print(f"Municipality: {municipality}")
    print(f"Baseline dropout rate: {baseline['predicted_dropout_rate']}%")
    print(f"Scenario dropout rate: {scenario['predicted_dropout_rate']}%")
    improvement = baseline['predicted_dropout_rate'] - scenario['predicted_dropout_rate']
    print(f"Improvement: {improvement:.2f}% reduction")
    
    return baseline_response.status_code == 200 and scenario_response.status_code == 200

def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("COLOMBIA DROPOUT PREDICTION API - TEST SUITE")
    print("=" * 60)
    
    tests = [
        ("Health Check", test_health_check),
        ("List Municipalities", test_list_municipalities),
        ("Get Features", test_get_features),
        ("Baseline Prediction", test_baseline_prediction),
        ("Scenario Prediction", test_scenario_prediction),
        ("Baseline vs Scenario", test_comparison)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, "✅ PASSED" if success else "❌ FAILED"))
        except Exception as e:
            results.append((test_name, f"❌ ERROR: {str(e)}"))
    
    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)
    for test_name, result in results:
        print(f"{test_name}: {result}")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
