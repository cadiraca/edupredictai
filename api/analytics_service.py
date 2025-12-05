"""
Analytics Service
Provides aggregated statistics and historical trends for the dashboard
"""
import pandas as pd
import numpy as np
from typing import Optional, Dict, List, Any
from .predictor_service import PredictorService


class AnalyticsService:
    """Service for analytics and aggregated statistics"""
    
    def __init__(self, predictor_service: PredictorService):
        self.predictor_service = predictor_service
        self._df_history = None
    
    @property
    def df_history(self) -> pd.DataFrame:
        """Get the historical data from predictor service"""
        if self._df_history is None:
            self._df_history = self.predictor_service.predictor.df_history
        return self._df_history
    
    def get_national_analytics(self) -> Dict[str, Any]:
        """
        Get national-level analytics
        
        Returns:
            dict: National statistics including dropout rate, student count, trends
        """
        df = self.df_history
        
        # Get latest year data
        latest_year = int(df['AÑO'].max())
        latest_data = df[df['AÑO'] == latest_year]
        
        # Get previous year for comparison
        previous_year = latest_year - 1
        previous_data = df[df['AÑO'] == previous_year]
        
        # Calculate weighted averages by population
        total_population = latest_data['POBLACIÓN_5_16'].sum()
        weighted_dropout = (
            (latest_data['DESERCIÓN'] * latest_data['POBLACIÓN_5_16']).sum() / 
            total_population
        )
        
        # Previous year weighted dropout
        prev_total_pop = previous_data['POBLACIÓN_5_16'].sum()
        prev_weighted_dropout = (
            (previous_data['DESERCIÓN'] * previous_data['POBLACIÓN_5_16']).sum() / 
            prev_total_pop
        ) if prev_total_pop > 0 else weighted_dropout
        
        # Year over year change
        yoy_change = weighted_dropout - prev_weighted_dropout
        
        # Average funnel efficiency (primaria to media ratio)
        funnel_efficiency = latest_data['primaria_to_media_ratio'].mean()
        
        # Determine trend
        trend = "increasing" if yoy_change > 0.1 else "decreasing" if yoy_change < -0.1 else "stable"
        
        return {
            "current_year": latest_year,
            "dropout_rate": round(weighted_dropout, 2),
            "total_students": int(total_population),
            "year_over_year_change": round(yoy_change, 2),
            "funnel_efficiency": round(funnel_efficiency, 2),
            "trend": trend,
            "previous_year_dropout": round(prev_weighted_dropout, 2)
        }
    
    def get_department_analytics(self) -> List[Dict[str, Any]]:
        """
        Get department-level comparison analytics
        
        Returns:
            list: List of department statistics with risk levels
        """
        df = self.df_history
        
        # Get latest year
        latest_year = df['AÑO'].max()
        latest_data = df[df['AÑO'] == latest_year]
        
        # Group by department
        dept_groups = latest_data.groupby('CÓDIGO_DEPARTAMENTO')
        
        departments = []
        for dept_code, group in dept_groups:
            total_pop = group['POBLACIÓN_5_16'].sum()
            
            # Weighted dropout rate
            weighted_dropout = (
                (group['DESERCIÓN'] * group['POBLACIÓN_5_16']).sum() / total_pop
            ) if total_pop > 0 else 0
            
            # Determine risk level
            if weighted_dropout >= 6:
                risk_level = "High"
            elif weighted_dropout >= 3:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            # Get department name from first municipality
            dept_name = self._get_department_name(int(dept_code))
            
            departments.append({
                "code": str(int(dept_code)),
                "name": dept_name,
                "dropout_rate": round(weighted_dropout, 2),
                "student_count": int(total_pop),
                "risk_level": risk_level,
                "municipality_count": len(group)
            })
        
        # Sort by dropout rate descending
        departments.sort(key=lambda x: x['dropout_rate'], reverse=True)
        
        return departments
    
    def get_historical_trends(self, department_code: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get historical trends over time
        
        Args:
            department_code: Optional department code to filter by
            
        Returns:
            list: Yearly statistics including dropout rate, students, funnel ratio
        """
        df = self.df_history
        
        # Filter by department if provided
        if department_code:
            df = df[df['CÓDIGO_DEPARTAMENTO'] == int(department_code)]
        
        # Group by year
        yearly_groups = df.groupby('AÑO')
        
        trends = []
        for year, group in yearly_groups:
            total_pop = group['POBLACIÓN_5_16'].sum()
            
            # Weighted dropout rate
            weighted_dropout = (
                (group['DESERCIÓN'] * group['POBLACIÓN_5_16']).sum() / total_pop
            ) if total_pop > 0 else 0
            
            # Average funnel ratio
            avg_funnel = group['primaria_to_media_ratio'].mean()
            
            trends.append({
                "year": int(year),
                "dropout_rate": round(weighted_dropout, 2),
                "students": int(total_pop),
                "funnel_ratio": round(avg_funnel, 2)
            })
        
        # Sort by year
        trends.sort(key=lambda x: x['year'])
        
        return trends
    
    def _get_department_name(self, dept_code: int) -> str:
        """
        Get department name from code
        Uses a lookup table of Colombian department codes
        """
        DEPARTMENT_NAMES = {
            5: "Antioquia",
            8: "Atlántico",
            11: "Bogotá D.C.",
            13: "Bolívar",
            15: "Boyacá",
            17: "Caldas",
            18: "Caquetá",
            19: "Cauca",
            20: "Cesar",
            23: "Córdoba",
            25: "Cundinamarca",
            27: "Chocó",
            41: "Huila",
            44: "La Guajira",
            47: "Magdalena",
            50: "Meta",
            52: "Nariño",
            54: "Norte de Santander",
            63: "Quindío",
            66: "Risaralda",
            68: "Santander",
            70: "Sucre",
            73: "Tolima",
            76: "Valle del Cauca",
            81: "Arauca",
            85: "Casanare",
            86: "Putumayo",
            88: "San Andrés y Providencia",
            91: "Amazonas",
            94: "Guainía",
            95: "Guaviare",
            97: "Vaupés",
            99: "Vichada"
        }
        
        return DEPARTMENT_NAMES.get(dept_code, f"Departamento {dept_code}")
