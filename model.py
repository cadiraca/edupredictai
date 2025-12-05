import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
import unicodedata
import matplotlib.pyplot as plt
import seaborn as sns

class DropoutPredictor:
    def __init__(self):
        self.model = None
        self.df_history = None
        self.model_name = "my_colombia_model.pkl"
        # Updated Predictor List
        self.predictors = [
            'over_age_gap', 
            'repitencia_lag_1', 
            'classroom_density', 
            'POBLACIÓN_5_16', 
            'is_capital_flag', 
            'CÓDIGO_DEPARTAMENTO',
            'primaria_to_media_ratio',  # <--- NEW: The Funnel
            'dept_risk_lag'             # <--- NEW: Regional Context
        ]

    def normalize_text(self, text):
        if not isinstance(text, str):
            return str(text)
        text = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode('utf-8')
        return text.lower().strip()

    def clean_and_prepare(self, df_raw):
        print("--- Cleaning Data & Engineering Features ---")
        df = df_raw.copy()

        # 1. Clean Numeric Columns
        cols_to_clean = ['COBERTURA_NETA', 'COBERTURA_BRUTA', 'DESERCIÓN', 
                         'REPITENCIA', 'TAMAÑO_PROMEDIO_DE_GRUPO', 
                         'COBERTURA_NETA_PRIMARIA', 'COBERTURA_NETA_MEDIA'] # Added specific levels
        
        for col in cols_to_clean:
            if col in df.columns and df[col].dtype == 'object':
                df[col] = df[col].astype(str).str.replace('%', '').str.replace(',', '.', regex=False)
                df[col] = pd.to_numeric(df[col], errors='coerce')

        # 2. Capital Flag
        if 'is_capital' in df.columns:
            df['is_capital_flag'] = df['is_capital'].astype(str).str.lower().map({
                'yes': 1, 'si': 1, 'sí': 1, 'true': 1, '1': 1
            }).fillna(0)
        else:
            df['is_capital_flag'] = 0

        # --- FEATURE ENGINEERING ---

        # A. Over Age Gap
        df['over_age_gap'] = df['COBERTURA_BRUTA'] - df['COBERTURA_NETA']
        
        # Sort specifically for Lag calculations
        df = df.sort_values(by=['CÓDIGO_MUNICIPIO', 'AÑO'])

        # B. Repetition Lag (Town Specific)
        df['repitencia_lag_1'] = df.groupby('CÓDIGO_MUNICIPIO')['REPITENCIA'].shift(1)

        # C. NEW: The "Educational Funnel" Ratio
        # Avoid division by zero by adding a tiny epsilon
        df['primaria_to_media_ratio'] = df['COBERTURA_NETA_MEDIA'] / (df['COBERTURA_NETA_PRIMARIA'] + 0.001)
        # Cap ratio at 1.5 (sanity check for bad data)
        df['primaria_to_media_ratio'] = df['primaria_to_media_ratio'].clip(0, 1.5)

        # D. NEW: Regional Context (Department Risk Lag)
        # Calculate the average dropout of the Department for that year
        dept_avg = df.groupby(['CÓDIGO_DEPARTAMENTO', 'AÑO'])['DESERCIÓN'].transform('mean')
        df['dept_avg_dropout'] = dept_avg
        # Now shift it, so we use LAST year's department average to predict THIS year
        df = df.sort_values(by=['CÓDIGO_MUNICIPIO', 'AÑO']) # Re-sort to be safe
        df['dept_risk_lag'] = df.groupby('CÓDIGO_MUNICIPIO')['dept_avg_dropout'].shift(1)

        # E. Density Imputation
        df['classroom_density'] = df['TAMAÑO_PROMEDIO_DE_GRUPO']
        df['classroom_density'] = df.groupby('CÓDIGO_MUNICIPIO')['classroom_density'].transform(lambda x: x.fillna(x.median()))
        df['classroom_density'] = df.groupby('CÓDIGO_DEPARTAMENTO')['classroom_density'].transform(lambda x: x.fillna(x.median()))
        
        mask_outlier = df['classroom_density'] > 100
        df.loc[mask_outlier, 'classroom_density'] = df.loc[mask_outlier, 'classroom_density'] / 1000

        # Store history
        df['search_name'] = df['MUNICIPIO'].apply(self.normalize_text)
        self.df_history = df
        
        # Return clean training set
        # We now drop NaNs for 'dept_risk_lag' too
        return df.dropna(subset=['DESERCIÓN', 'repitencia_lag_1', 'dept_risk_lag'])

    def train(self, df_raw):
        df_train = self.clean_and_prepare(df_raw)
        
        X = df_train[self.predictors]
        y = df_train['DESERCIÓN']

        print(f"--- Training on {len(df_train)} records ---")
        self.model = RandomForestRegressor(n_estimators=300, max_depth=12, random_state=42)
        self.model.fit(X, y)
        print("--- Model Trained Successfully ---")

    def save_model(self):
        if self.model is None:
            print("Error: Train first.")
            return
        
        artifact = {
            'model': self.model,
            'predictors': self.predictors,
            'history': self.df_history
        }
        joblib.dump(artifact, self.model_name)
        print(f"Model saved to {self.model_name}")

    # Load and Predict functions remain similar, just ensuring new features are in input_data
    def load_model(self):
        if not os.path.exists(self.model_name):
            print(f"Error: File {self.model_name} not found.")
            return
        artifact = joblib.load(self.model_name)
        self.model = artifact['model']
        self.predictors = artifact['predictors']
        if 'history' in artifact:
            self.df_history = artifact['history']
        print(f"Model loaded from {self.model_name}")

    def predict_for_municipality(self, municipality_name, target_year=2025, scenario_adjustments=None):
        if self.model is None:
            raise Exception("Model not trained yet!")

        search_term = self.normalize_text(municipality_name)
        mask = self.df_history['search_name'] == search_term
        if not mask.any():
            mask = self.df_history['search_name'].str.contains(search_term, na=False)

        town_data = self.df_history[mask]
        if town_data.empty:
            return 0, f"Error: '{municipality_name}' not found."
        
        if len(town_data['MUNICIPIO'].unique()) > 1:
            town_data = town_data[town_data['MUNICIPIO'] == town_data['MUNICIPIO'].iloc[0]]

        latest_record = town_data.iloc[-1].copy()
        
        print(f"\n--- Forecasting for: {latest_record['MUNICIPIO']} ---")
        
        # Prepare Input with NEW Features
        input_data = {
            'over_age_gap': latest_record['over_age_gap'],
            'classroom_density': latest_record['classroom_density'],
            'POBLACIÓN_5_16': latest_record['POBLACIÓN_5_16'],
            'is_capital_flag': latest_record['is_capital_flag'],
            'CÓDIGO_DEPARTAMENTO': latest_record['CÓDIGO_DEPARTAMENTO'],
            'repitencia_lag_1': latest_record['REPITENCIA'],
            # New Features
            'primaria_to_media_ratio': latest_record['primaria_to_media_ratio'],
            'dept_risk_lag': latest_record['dept_avg_dropout'] # Last year's dept avg predicts next year
        }

        if scenario_adjustments:
            for key, val in scenario_adjustments.items():
                if key in input_data:
                    print(f"   -> Adjusting {key}: {input_data[key]:.2f} -> {val:.2f}")
                    input_data[key] = val

        features = pd.DataFrame([input_data])
        features = features[self.predictors]
        prediction = self.model.predict(features)[0]

        return prediction, input_data
    
# ==============================================================================
    # NEW VISUALIZATION METHODS
    # ==============================================================================

    def plot_feature_importance(self):
        """Displays a bar chart of which variables drive the model."""
        if self.model is None:
            print("Error: Model not trained.")
            return

        importances = self.model.feature_importances_
        indices = np.argsort(importances)[::-1]
        
        plt.figure(figsize=(10, 6))
        sns.barplot(
            x=importances[indices], 
            y=np.array(self.predictors)[indices],
            palette='viridis'
        )
        plt.title("What drives Dropout? (Feature Importance)")
        plt.xlabel("Relative Importance Score")
        plt.tight_layout()
        plt.show()

    def plot_actual_vs_predicted(self):
        """Plots the 'Diagonal of Truth' using the historical data."""
        if self.model is None or self.df_history is None:
            print("Error: Model not trained or history not found.")
            return
        
        # Use available history to visualize fit
        # We must drop NaNs in predictors just like we did in training
        df_plot = self.df_history.dropna(subset=['DESERCIÓN'] + self.predictors).copy()
        
        X = df_plot[self.predictors]
        y_true = df_plot['DESERCIÓN']
        y_pred = self.model.predict(X)
        
        plt.figure(figsize=(8, 8))
        sns.scatterplot(x=y_true, y=y_pred, alpha=0.3, color='steelblue')
        
        # Draw perfect prediction line
        max_val = max(y_true.max(), y_pred.max())
        plt.plot([0, max_val], [0, max_val], 'r--', lw=2, label='Perfect Prediction')
        
        plt.xlabel("Actual Dropout (%)")
        plt.ylabel("Predicted Dropout (%)")
        plt.title("Model Accuracy: Actual vs Predicted")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.show()

    def plot_population_curve(self):
        """Displays the 'U-Shape' Population vs Dropout curve."""
        if self.df_history is None:
            print("Error: No history data found.")
            return
            
        df_plot = self.df_history.dropna(subset=['DESERCIÓN', 'POBLACIÓN_5_16'])

        plt.figure(figsize=(12, 6))
        
        # Scatter
        sns.scatterplot(
            data=df_plot, 
            x='POBLACIÓN_5_16', 
            y='DESERCIÓN', 
            alpha=0.4, 
            color='teal',
            label='Municipality Data'
        )
        
        # Trend line (using polynomial order 2 for the curve)
        sns.regplot(
            data=df_plot, 
            x='POBLACIÓN_5_16', 
            y='DESERCIÓN', 
            scatter=False, 
            order=2, 
            line_kws={'color': 'red', 'linewidth': 3}, 
            label='Trend'
        )
        
        plt.xscale('log')
        plt.xlabel('Student Population (Log Scale)')
        plt.ylabel('Dropout Rate (%)')
        plt.title('The "Goldilocks" Zone: Population vs Dropout Risk')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.show()    

# ==============================================================================
# EXAMPLE USAGE
# ==============================================================================
if __name__ == "__main__":
    predictor = DropoutPredictor()
    #df = pd.read_csv('Municipios.csv')
    #predictor.train(df) # Assuming 'df' is loaded
    
    # # Save it for later
    #predictor.save_model()

    predictor.load_model()

    #print("Here is why the model predicts what it predicts:")
    predictor.plot_feature_importance()

    #print("And here is the proof that it understands the Population Curve:")
    predictor.plot_population_curve()    
    
    # # Ask for Cali
    #pred, stats = predictor.predict_for_municipality(
    #     municipality_name="Palmira", 
    #     target_year=2025
         #scenario_adjustments={'repitencia_lag_1': 3.5} 
    #)
    #print(f"Forecast: {pred} {stats}")