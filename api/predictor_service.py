"""
Service wrapper around the DropoutPredictor model
"""
import sys
import os
from typing import Dict, List, Tuple, Optional

# Add parent directory to path to import model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from model import DropoutPredictor


class PredictorService:
    """Service class to interact with the dropout prediction model"""
    
    def __init__(self, model_path: str = "my_colombia_model.pkl"):
        self.predictor = DropoutPredictor()
        self.model_path = model_path
        self.predictor.model_name = model_path
        self._load_model()
    
    def _load_model(self):
        """Load the trained model"""
        try:
            self.predictor.load_model()
        except Exception as e:
            raise Exception(f"Failed to load model: {str(e)}")
    
    def get_municipalities(self) -> List[str]:
        """Get list of all available municipalities"""
        if self.predictor.df_history is None:
            return []
        
        municipalities = self.predictor.df_history['MUNICIPIO'].unique().tolist()
        return sorted(municipalities)
    
    def get_municipality_count(self) -> int:
        """Get total number of municipalities"""
        return len(self.get_municipalities())
    
    def get_departments_with_municipalities(self) -> List[Dict[str, any]]:
        """Get list of departments with their municipalities"""
        if self.predictor.df_history is None:
            return []
        
        # Department names mapping
        DEPARTMENT_NAMES = {
            5: 'Antioquia', 8: 'Atlántico', 11: 'Bogotá D.C.', 13: 'Bolívar',
            15: 'Boyacá', 17: 'Caldas', 18: 'Caquetá', 19: 'Cauca',
            20: 'Cesar', 23: 'Córdoba', 25: 'Cundinamarca', 27: 'Chocó',
            41: 'Huila', 44: 'La Guajira', 47: 'Magdalena', 50: 'Meta',
            52: 'Nariño', 54: 'Norte de Santander', 63: 'Quindío', 66: 'Risaralda',
            68: 'Santander', 70: 'Sucre', 73: 'Tolima', 76: 'Valle del Cauca',
            81: 'Arauca', 85: 'Casanare', 86: 'Putumayo', 88: 'San Andrés y Providencia',
            91: 'Amazonas', 94: 'Guainía', 95: 'Guaviare', 97: 'Vaupés', 99: 'Vichada'
        }
        
        # Group by department
        df = self.predictor.df_history
        departments = []
        
        for dept_code in sorted(df['CÓDIGO_DEPARTAMENTO'].unique()):
            dept_data = df[df['CÓDIGO_DEPARTAMENTO'] == dept_code]
            municipalities = sorted(dept_data['MUNICIPIO'].unique().tolist())
            
            departments.append({
                'code': int(dept_code),
                'name': DEPARTMENT_NAMES.get(int(dept_code), f"Departamento {int(dept_code)}"),
                'municipalities': municipalities,
                'count': len(municipalities)
            })
        
        return departments
    
    def predict(
        self, 
        municipality_name: str, 
        target_year: int = 2025,
        scenario_adjustments: Optional[Dict[str, float]] = None
    ) -> Tuple[float, Dict[str, float], str]:
        """
        Make a prediction for a municipality
        
        Returns:
            Tuple of (predicted_dropout_rate, input_parameters, municipality_name)
        """
        try:
            prediction, input_data = self.predictor.predict_for_municipality(
                municipality_name=municipality_name,
                target_year=target_year,
                scenario_adjustments=scenario_adjustments
            )
            
            # If prediction is 0 and input_data is a string, it's an error message
            if prediction == 0 and isinstance(input_data, str):
                raise ValueError(input_data)
            
            # Get the actual municipality name from history
            search_term = self.predictor.normalize_text(municipality_name)
            mask = self.predictor.df_history['search_name'] == search_term
            if not mask.any():
                mask = self.predictor.df_history['search_name'].str.contains(search_term, na=False)
            
            actual_name = self.predictor.df_history[mask]['MUNICIPIO'].iloc[0]
            
            return prediction, input_data, actual_name
            
        except Exception as e:
            raise ValueError(f"Prediction failed: {str(e)}")
    
    def get_municipality_features(self, municipality_name: str) -> Dict[str, any]:
        """
        Get current feature values for a municipality
        
        Returns:
            Dictionary with feature information
        """
        if self.predictor.df_history is None:
            raise ValueError("Model history not available")
        
        search_term = self.predictor.normalize_text(municipality_name)
        mask = self.predictor.df_history['search_name'] == search_term
        
        if not mask.any():
            mask = self.predictor.df_history['search_name'].str.contains(search_term, na=False)
        
        town_data = self.predictor.df_history[mask]
        
        if town_data.empty:
            raise ValueError(f"Municipality '{municipality_name}' not found")
        
        if len(town_data['MUNICIPIO'].unique()) > 1:
            town_data = town_data[town_data['MUNICIPIO'] == town_data['MUNICIPIO'].iloc[0]]
        
        latest_record = town_data.iloc[-1]
        
        # Feature descriptions with units
        feature_descriptions = {
            'over_age_gap': ('Over-age gap', 'Difference between gross and net coverage', '%'),
            'repitencia_lag_1': ('Repetition rate (previous year)', 'Last year\'s repetition rate', '%'),
            'classroom_density': ('Classroom density', 'Average class size', 'students'),
            'primaria_to_media_ratio': ('Primary to secondary ratio', 'Educational funnel ratio', 'ratio'),
            'dept_risk_lag': ('Regional dropout context', 'Department average dropout (previous year)', '%'),
            'POBLACIÓN_5_16': ('Student population', 'Population aged 5-16', 'students'),
            'is_capital_flag': ('Capital flag', 'Whether municipality is a capital', 'flag'),
            'CÓDIGO_DEPARTAMENTO': ('Department code', 'Department identifier', 'code')
        }
        
        features = []
        for feature_name in self.predictor.predictors:
            if feature_name in latest_record:
                desc_info = feature_descriptions.get(feature_name, (feature_name, feature_name, None))
                features.append({
                    'name': feature_name,
                    'description': desc_info[1],
                    'current_value': float(latest_record[feature_name]),
                    'unit': desc_info[2]
                })
        
        return {
            'municipality_name': latest_record['MUNICIPIO'],
            'features': features,
            'department_code': int(latest_record['CÓDIGO_DEPARTAMENTO']),
            'latest_year': int(latest_record['AÑO'])
        }
    
    def get_model_features(self) -> List[str]:
        """Get list of model features"""
        return self.predictor.predictors
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.predictor.model is not None
