import fastf1
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
import os
os.makedirs("f1_cache", exist_ok=True)


fastf1.Cache.enable_cache("f1_cache")
RANDOM_STATE = 38


# ---------------------------------------
# Hardcoded 2025 F1 grid
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
    "Nico Hülkenberg": "HUL",         # added missing driver
    "Andrea Kimi Antonelli": "ANT",   # rookie
    "Oliver Bearman": "BEA",          # rookie
    "Franco Colapinto": "COL",        # rookie
    "Gabriel Bortoleto": "BOR",       # rookie
    "Isack Hadjar": "HAD",            # rookie
    "Liam Lawson": "LAW"              # possible returnee
}


# ---------------------------------------
# Helpers
# ---------------------------------------
def load_session(year: int, gp_name: str, kind: str):
    sess = fastf1.get_session(year, gp_name, kind)
    sess.load()
    return sess

def build_prev_year_sector_priors(prev_year: int, gp_name: str):
    sess_prev = load_session(prev_year, gp_name, "R")
    laps = sess_prev.laps.pick_quicklaps().copy()
    laps.dropna(subset=["LapTime", "Sector1Time", "Sector2Time", "Sector3Time"], inplace=True)

    for col in ["LapTime", "Sector1Time", "Sector2Time", "Sector3Time"]:
        laps[f"{col} (s)"] = laps[col].dt.total_seconds()

    sector_df = (
        laps.groupby("Driver")[["Sector1Time (s)", "Sector2Time (s)", "Sector3Time (s)"]]
        .mean()
        .reset_index()
        .rename(columns={
            "Driver": "DriverCode",
            "Sector1Time (s)": "S1",
            "Sector2Time (s)": "S2",
            "Sector3Time (s)": "S3",
        })
    )
    pace_df = (
        laps.groupby("Driver")[["LapTime (s)"]]
        .mean()
        .reset_index()
        .rename(columns={"Driver": "DriverCode", "LapTime (s)": "AvgLap"})
    )
    return sector_df, pace_df

def prepare_training(qual_df: pd.DataFrame, sector_df: pd.DataFrame, pace_df: pd.DataFrame):
    merged = qual_df.merge(sector_df, on="DriverCode", how="left")
    merged = merged.merge(pace_df, on="DriverCode", how="left")

    known = merged[~merged["S1"].isna()].copy()
    train_full_X = known[["QualifyingTime (s)", "S1", "S2", "S3"]]
    train_full_y = known["AvgLap"]

    return train_full_X, train_full_y, merged

def predict_race(year: int, gp_name: str, qualifying_times: pd.DataFrame):
    # Add DriverCode from hardcoded mapping
    qualifying_times["DriverCode"] = qualifying_times["Driver"].map(drivers_2025)
    if qualifying_times["DriverCode"].isna().any():
        missing = qualifying_times[qualifying_times["DriverCode"].isna()]["Driver"].tolist()
        raise ValueError(f"Driver(s) not in hardcoded 2025 list: {missing}")

    # Previous year's data
    sector_df, pace_df = build_prev_year_sector_priors(year - 1, gp_name)
    train_full_X, train_full_y, merged_all = prepare_training(qualifying_times, sector_df, pace_df)

    # Full model for returning drivers
    full_model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, random_state=RANDOM_STATE)
    full_model = full_model if len(train_full_X) >= 5 else None
    if full_model is not None:
        full_model.fit(train_full_X, train_full_y)

    # Fallback model (qualy only)
    simple_model = LinearRegression()
    known_simple_X = merged_all.loc[~merged_all["AvgLap"].isna(), ["QualifyingTime (s)"]]
    known_simple_y = merged_all.loc[~merged_all["AvgLap"].isna(), "AvgLap"]
    simple_model.fit(known_simple_X, known_simple_y)

    preds = []
    for _, row in merged_all.iterrows():
        if (full_model is not None) and not pd.isna(row.get("S1", np.nan)):
            X_row = np.array([[row["QualifyingTime (s)"], row["S1"], row["S2"], row["S3"]]])
            yhat = full_model.predict(X_row)[0]
            used = "full"
        else:
            X_row = np.array([[row["QualifyingTime (s)"]]])
            yhat = simple_model.predict(X_row)[0]
            used = "fallback"
        preds.append((row["Driver"], row["DriverCode"], yhat, used))

    out = pd.DataFrame(preds, columns=["Driver", "DriverCode", "PredictedRaceLap (s)", "ModelUsed"])
    return out.sort_values("PredictedRaceLap (s)").reset_index(drop=True)

# ---------------------------------------
# Example usage
# ---------------------------------------
if __name__ == "__main__":
    YEAR = 2025
    GP = "Monaco"

    # Create a full list of all 20 drivers
    all_drivers = list(drivers_2025.keys())

    # Assign some sample qualifying times in seconds (these are just fake test values)
    # You can replace them with the real 2025 Chinese GP qualifying times later
    # These are spaced by ~0.1s just for testing
    base_time = 90.500
    qual_times = [base_time + (i * 0.10) for i in range(len(all_drivers))]

    qualifying_2025 = pd.DataFrame({
        "Driver": all_drivers,
        "QualifyingTime (s)": qual_times
    })

    predictions = predict_race(YEAR, GP, qualifying_2025)
    print(f"\n🏁 Predicted {YEAR} {GP} GP Race Pace 🏁\n")
    print(predictions.to_string(index=False))
