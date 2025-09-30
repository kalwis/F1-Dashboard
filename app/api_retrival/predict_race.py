from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import fastf1
import pandas as pd
import numpy as np
import os

# Setup
os.makedirs("f1_cache", exist_ok=True)
fastf1.Cache.enable_cache("f1_cache")

app = FastAPI(title="F1 Race Prediction API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------
# 2025 F1 grid for race predictions
# ---------------------------------------
drivers_2025 = {
    "Max Verstappen": "VER",
    "Charles Leclerc": "LEC",
    "Carlos Sainz Jr.": "SAI",
    "Lewis Hamilton": "HAM",
    "George Russell": "RUS",
    "Lando Norris": "NOR",
    "Oscar Piastri": "PIA",
    "Fernando Alonso": "ALO",
    "Lance Stroll": "STR",
    "Esteban Ocon": "OCO",
    "Pierre Gasly": "GAS",
    "Yuki Tsunoda": "TSU",
    "Alexander Albon": "ALB",
    "Nico Hülkenberg": "HUL",
    "Andrea Kimi Antonelli": "ANT",
    "Oliver Bearman": "BEA",
    "Franco Colapinto": "COL",
    "Gabriel Bortoleto": "BOR",
    "Isack Hadjar": "HAD",
    "Liam Lawson": "LAW"
}

# Reverse mapping for driver code to full name
driver_code_to_name = {v: k for k, v in drivers_2025.items()}

# Valid 2025 F1 race names
valid_races_2025 = [
    'Bahrain', 'Saudi Arabia', 'Australia', 'Japan', 'China', 'Miami', 
    'Emilia Romagna', 'Monaco', 'Canada', 'Spain', 'Austria', 'Great Britain',
    'Hungary', 'Belgium', 'Netherlands', 'Italy', 'Azerbaijan', 'Singapore',
    'United States', 'Mexico', 'Brazil', 'Qatar', 'Abu Dhabi'
]


# ---------------------------------------
# Models
# ---------------------------------------
class RacePredictionRequest(BaseModel):
    year: int
    gp_name: str

class DriverPrediction(BaseModel):
    position: int
    driver: str
    driver_code: str
    qualifying_time: float
    qualifying_position: int
    predicted_race_position: int
    tire_deg_rate: Optional[float]
    prediction_method: str

class RacePredictionResponse(BaseModel):
    year: int
    gp_name: str
    predictions: List[DriverPrediction]


# ---------------------------------------
# Helper Functions
# ---------------------------------------
def load_session(year: int, gp_name: str, kind: str):
    """Load a FastF1 session"""
    sess = fastf1.get_session(year, gp_name, kind)
    sess.load()
    return sess

def get_qualifying_times(year: int, gp_name: str):
    """Fetch qualifying times from FastF1"""
    try:
        sess = load_session(year, gp_name, "Q")
        results = sess.results
        
        # Check if session loaded but has no data (hasn't occurred yet)
        if results is None or len(results) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Qualifying data for '{gp_name}' {year} is not available yet. The qualifying session may not have occurred."
            )
        
        # Extract driver and best qualifying time
        qual_data = []
        for _, row in results.iterrows():
            driver_code = row.get("Abbreviation")
            q3_time = row.get("Q3")
            q2_time = row.get("Q2")
            q1_time = row.get("Q1")
            
            # Use best available time
            best_time = q3_time if pd.notna(q3_time) else (q2_time if pd.notna(q2_time) else q1_time)
            
            if pd.notna(best_time) and driver_code:
                # Use 2025 driver mapping for predictions
                driver_name = driver_code_to_name.get(driver_code, driver_code)
                qual_data.append({
                    "Driver": driver_name,
                    "DriverCode": driver_code,
                    "QualifyingTime (s)": best_time.total_seconds()
                })
        
        # Check if we got any valid qualifying times
        if len(qual_data) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"No valid qualifying times found for '{gp_name}' {year}. The qualifying session may not have occurred yet."
            )
        
        df = pd.DataFrame(qual_data)
        df = df.sort_values("QualifyingTime (s)").reset_index(drop=True)
        df["QualifyingPosition"] = df.index + 1
        
        return df
    
    except HTTPException:
        # Re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        # Check error message to distinguish between invalid race name and missing data
        error_msg = str(e).lower()
        
        # FastF1 raises errors with these patterns when race doesn't exist
        if "cannot find" in error_msg or "no round" in error_msg or "invalid event" in error_msg or "not found" in error_msg or "no session" in error_msg:
            raise HTTPException(
                status_code=404,
                detail=f"Circuit or race '{gp_name}' does not exist in {year}. Please check the race name is correct."
            )
        else:
            # For other errors, assume it's a data availability issue
            raise HTTPException(
                status_code=404,
                detail=f"Unable to load qualifying data for '{gp_name}' {year}. The qualifying session may not have occurred yet, or there was an error: {str(e)}"
            )

def calculate_tire_degradation(year: int, gp_name: str):
    """
    Calculate tire degradation rate from practice sessions or sprint race
    Priority: Sprint Race > FP2 > FP3
    Degradation = (average of last 3 laps - average of first 3 laps) / number of laps between them
    Lower degradation = better race pace
    """
    # Try sprint race first (best real-world data)
    try:
        sprint = load_session(year, gp_name, "S")
        return calculate_deg_from_session(sprint, is_sprint=True)
    except:
        pass
    
    # Try FP2 (main race simulation session)
    try:
        fp2 = load_session(year, gp_name, "FP2")
        return calculate_deg_from_session(fp2, is_sprint=False)
    except:
        pass
    
    # Fall back to FP3
    try:
        fp3 = load_session(year, gp_name, "FP3")
        return calculate_deg_from_session(fp3, is_sprint=False)
    except:
        return pd.DataFrame(columns=['DriverCode', 'AvgDegPerLap'])

def calculate_deg_from_session(session, is_sprint: bool):
    """
    Calculate degradation from a session (practice or sprint)
    """
    laps = session.laps.copy()
    
    # For sprint races, we want all laps (it's real race data)
    # For practice, filter for race compounds only
    if not is_sprint:
        race_compounds = ['MEDIUM', 'HARD']
        laps = laps[laps['Compound'].isin(race_compounds)]
    
    # Remove invalid laps
    laps = laps[pd.notna(laps['LapTime'])]
    laps['LapTime (s)'] = laps['LapTime'].dt.total_seconds()
    
    # Calculate degradation per driver
    deg_data = []
    
    # For sprint, we need shorter stints (sprints are ~20 laps)
    min_stint_length = 5 if is_sprint else 7
    
    for driver in laps['Driver'].unique():
        driver_laps = laps[laps['Driver'] == driver].copy()
        
        # Group by stint
        for stint in driver_laps['Stint'].unique():
            stint_laps = driver_laps[driver_laps['Stint'] == stint].sort_values('LapNumber')
            
            # Need enough laps to calculate meaningful degradation
            if len(stint_laps) >= min_stint_length:
                # For sprint: use laps 2-end (skip lap 1 start chaos)
                # For practice: skip first lap (out lap) and last lap (pit in)
                if is_sprint:
                    usable_laps = stint_laps.iloc[1:]  # Skip lap 1
                else:
                    usable_laps = stint_laps.iloc[1:-1]  # Skip out/in laps
                
                if len(usable_laps) >= 6:
                    early_laps = usable_laps.iloc[:3]['LapTime (s)'].mean()
                    late_laps = usable_laps.iloc[-3:]['LapTime (s)'].mean()
                    
                    # Calculate degradation per lap
                    num_laps = len(usable_laps) - 3
                    deg_per_lap = (late_laps - early_laps) / num_laps if num_laps > 0 else 0
                    
                    deg_data.append({
                        'DriverCode': driver,
                        'DegPerLap': deg_per_lap,
                        'StintLength': len(usable_laps),
                        'Compound': stint_laps.iloc[0]['Compound'] if 'Compound' in stint_laps.columns else 'UNKNOWN'
                    })
    
    if len(deg_data) == 0:
        return pd.DataFrame(columns=['DriverCode', 'AvgDegPerLap'])
    
    # Average degradation across all stints per driver
    deg_df = pd.DataFrame(deg_data)
    avg_deg = deg_df.groupby('DriverCode')['DegPerLap'].mean().reset_index()
    avg_deg.columns = ['DriverCode', 'AvgDegPerLap']
    
    return avg_deg


def predict_race_positions(year: int, gp_name: str, qualifying_times: pd.DataFrame):
    """
    Predict race finishing positions based on qualifying + tire degradation
    
    Logic:
    - Start with qualifying order
    - Drivers with significantly better tire deg can gain 1-3 positions
    - Drivers with significantly worse tire deg can lose 1-3 positions
    - Maximum movement is ±3 positions from qualifying
    - Fallback: Use historical performance if no qualifying data
    """
    # Get tire degradation data
    deg_data = calculate_tire_degradation(year, gp_name)
    
    # Merge with qualifying
    predictions = qualifying_times.merge(deg_data, on='DriverCode', how='left')
    
    # Track which drivers have deg data
    predictions['HasDegData'] = predictions['DriverCode'].isin(deg_data['DriverCode'])
    
    if len(deg_data) > 0 and predictions['HasDegData'].sum() > 0:
        # Calculate relative degradation (compared to field average)
        # Note: Lower (more negative) deg is BETTER
        drivers_with_deg = predictions[predictions['HasDegData']].copy()
        median_deg = drivers_with_deg['AvgDegPerLap'].median()
        
        # Relative deg: negative = better than average, positive = worse than average
        predictions['RelativeDeg'] = predictions['AvgDegPerLap'] - median_deg
        
        # Calculate position adjustment based on relative deg
        # Use percentiles to determine who moves up/down
        if predictions['HasDegData'].sum() >= 4:
            deg_25th = drivers_with_deg['AvgDegPerLap'].quantile(0.25)  # Best performers
            deg_75th = drivers_with_deg['AvgDegPerLap'].quantile(0.75)  # Worst performers
            
            def calculate_position_adjustment(row):
                if not row['HasDegData']:
                    return 0  # No adjustment for drivers without data
                
                deg = row['AvgDegPerLap']
                
                # Best tire management (top 25%)
                if deg <= deg_25th:
                    # Gain 1-3 positions based on how good
                    improvement = (deg_25th - deg) / (median_deg - deg_25th) if median_deg != deg_25th else 1
                    return -min(3, max(1, int(improvement * 3)))  # Negative = move up
                
                # Worst tire management (bottom 25%)
                elif deg >= deg_75th:
                    # Lose 1-3 positions based on how bad
                    decline = (deg - deg_75th) / (deg_75th - median_deg) if deg_75th != median_deg else 1
                    return min(3, max(1, int(decline * 3)))  # Positive = move down
                
                # Average tire management (middle 50%)
                else:
                    return 0  # Stay in similar position
            
            predictions['PositionAdjustment'] = predictions.apply(calculate_position_adjustment, axis=1)
        else:
            # Not enough data for percentiles, use simpler logic
            predictions['PositionAdjustment'] = 0
            predictions.loc[predictions['HasDegData'], 'PositionAdjustment'] = predictions.loc[
                predictions['HasDegData'], 'RelativeDeg'
            ].apply(lambda x: min(2, max(-2, int(x * 10))))  # Small adjustments
    else:
        # No degradation data available
        predictions['AvgDegPerLap'] = None
        predictions['RelativeDeg'] = 0
        predictions['PositionAdjustment'] = 0
    
    # Apply position adjustment (but cap at ±3 from qualifying)
    predictions['PredictedRacePosition'] = predictions['QualifyingPosition'] + predictions['PositionAdjustment']
    predictions['PredictedRacePosition'] = predictions['PredictedRacePosition'].clip(
        lower=predictions['QualifyingPosition'] - 3,
        upper=predictions['QualifyingPosition'] + 3
    )
    
    # Ensure no duplicate positions and keep within valid range
    predictions['PredictedRacePosition'] = predictions['PredictedRacePosition'].clip(1, len(predictions))
    
    # Sort by predicted position, then by qualifying as tie-breaker
    predictions = predictions.sort_values(['PredictedRacePosition', 'QualifyingPosition']).reset_index(drop=True)
    
    # Fix any duplicate positions by adjusting slightly
    seen_positions = {}
    for idx, row in predictions.iterrows():
        pos = int(row['PredictedRacePosition'])
        if pos in seen_positions:
            # Find next available position
            while pos in seen_positions and pos <= len(predictions):
                pos += 1
            predictions.at[idx, 'PredictedRacePosition'] = pos
        seen_positions[pos] = True
    
    # Final sort and renumber
    predictions = predictions.sort_values('PredictedRacePosition').reset_index(drop=True)
    predictions['PredictedRacePosition'] = predictions.index + 1
    
    # Determine prediction method
    predictions['PredictionMethod'] = predictions.apply(
        lambda row: 'qualifying_and_tire_deg' if row['HasDegData'] else 'qualifying_only',
        axis=1
    )
    
    return predictions



# ---------------------------------------
# API Endpoints
# ---------------------------------------
@app.get("/")
def read_root():
    return {
        "message": "F1 Race Prediction API - Tire Degradation Analysis",
        "endpoints": {
            "/api/race_predict": "GET - Predict race positions based on qualifying + tire degradation"
        },
        "methodology": "Priority: Sprint Race > FP2 > FP3. Analyzes long runs to calculate tire degradation, then adjusts qualifying order based on race pace."
    }

@app.get("/api/race_predict", response_model=RacePredictionResponse)
def race_predict(year: int, gp_name: str):
    """
    Predict race finishing positions for a given Grand Prix
    
    - **year**: The year of the race (e.g., 2025)
    - **gp_name**: The name of the Grand Prix (e.g., "Monaco", "Silverstone")
    
    Methodology:
    1. Fetches qualifying times and positions
    2. Analyzes tire degradation (Priority: Sprint Race > FP2 > FP3)
    3. For sprint weekends, uses actual sprint race data for most accurate predictions
    4. Calculates tire degradation rate per driver from long runs
    5. Predicts race positions by adjusting qualifying order based on tire management
    """
    try:
        # Validate race name
        if gp_name not in valid_races_2025:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid race name '{gp_name}'. Valid 2025 races: {', '.join(valid_races_2025)}"
            )
        
        # Fetch qualifying times
        qualifying_times = get_qualifying_times(year, gp_name)
        
        if len(qualifying_times) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"No qualifying data found for {year} {gp_name}. Please try a different race or check if the race has occurred."
            )
        
        # Generate predictions
        predictions_df = predict_race_positions(year, gp_name, qualifying_times)
        
        # Format response
        predictions_list = []
        for idx, row in predictions_df.iterrows():
            predictions_list.append(
                DriverPrediction(
                    position=idx + 1,
                    driver=row["Driver"],
                    driver_code=row["DriverCode"],
                    qualifying_time=round(row["QualifyingTime (s)"], 3),
                    qualifying_position=int(row["QualifyingPosition"]),
                    predicted_race_position=int(row["PredictedRacePosition"]),
                    tire_deg_rate=round(row["AvgDegPerLap"], 4) if pd.notna(row["AvgDegPerLap"]) else None,
                    prediction_method=row["PredictionMethod"]
                )
            )
        
        return RacePredictionResponse(
            year=year,
            gp_name=gp_name,
            predictions=predictions_list
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating predictions: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
