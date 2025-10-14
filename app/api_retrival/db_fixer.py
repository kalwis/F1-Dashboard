import sqlite3
import fastf1
import pandas as pd
from datetime import datetime

DB_FILE = "app/api_retrival/database/f1_data.db"

fastf1.Cache.enable_cache("fastf1_cache")


# -------------------------------------------------------
# DB helpers
# -------------------------------------------------------
def ensure_column_exists():
    """Add avg_tire_deg_per_lap to Driver_Race if missing."""
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(Driver_Race);")
    cols = [c[1] for c in cur.fetchall()]
    if "avg_tire_deg_per_lap" not in cols:
        cur.execute("ALTER TABLE Driver_Race ADD COLUMN avg_tire_deg_per_lap REAL;")
        print("✅ Added column avg_tire_deg_per_lap.")
    else:
        print("ℹ️ Column already exists.")
    conn.commit()
    conn.close()


# -------------------------------------------------------
# FastF1 helpers
# -------------------------------------------------------
def load_session(year, gp_name, kind):
    s = fastf1.get_session(year, gp_name, kind)
    s.load()
    return s


def calculate_deg_from_session(session, is_sprint=False):
    """Return average tire degradation per lap for all drivers."""
    laps = session.laps.copy()
    laps = laps[pd.notna(laps["LapTime"])]
    laps["LapTime (s)"] = laps["LapTime"].dt.total_seconds()

    if not is_sprint:
        laps = laps[laps["Compound"].isin(["MEDIUM", "HARD"])]

    deg_data = []
    for driver in laps["Driver"].unique():
        driver_laps = laps[laps["Driver"] == driver].sort_values("LapNumber")
        if len(driver_laps) < 7:
            continue
        usable = driver_laps.iloc[1:-1]
        if len(usable) < 6:
            continue
        early = usable.iloc[:3]["LapTime (s)"].mean()
        late = usable.iloc[-3:]["LapTime (s)"].mean()
        num_laps = len(usable) - 3
        deg_per_lap = (late - early) / num_laps if num_laps > 0 else 0
        deg_data.append({"DriverCode": driver, "AvgDegPerLap": deg_per_lap})
    return pd.DataFrame(deg_data)


def get_tire_deg(year, gp_name):
    """Try Sprint > FP2 > FP3."""
    for kind in ["S", "FP2", "FP3"]:
        try:
            s = load_session(year, gp_name, kind)
            df = calculate_deg_from_session(s, is_sprint=(kind == "S"))
            if not df.empty:
                print(f"✅ {gp_name} {year}: {kind} data used ({len(df)} drivers)")
                return df
        except Exception as e:
            print(f"⚠️ {gp_name} {year}: skipping {kind} ({e})")
    print(f"✖ No usable sessions for {gp_name} {year}")
    return pd.DataFrame(columns=["DriverCode", "AvgDegPerLap"])


# -------------------------------------------------------
# Update DB
# -------------------------------------------------------
def update_tire_deg_in_db(year):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    # Get races for that year
    races = pd.read_sql_query(
        "SELECT race_id, name FROM Race WHERE year = ?", conn, params=(year,)
    )

    if races.empty:
        print(f"⚠️ No races found for {year}")
        conn.close()
        return

    for _, race in races.iterrows():
        gp_name = race["name"]
        race_id = race["race_id"]
        print(f"\n🏁 Processing {gp_name} {year}")

        df = get_tire_deg(year, gp_name)
        if df.empty:
            continue

        for _, row in df.iterrows():
            cur.execute(
                """
                UPDATE Driver_Race
                SET avg_tire_deg_per_lap = ?
                WHERE race_id = ?
                AND driver_id = (
                    SELECT driver_id FROM Driver WHERE code = ?
                )
                """,
                (row["AvgDegPerLap"], race_id, row["DriverCode"]),
            )
        conn.commit()
        print(f"✔ Updated {gp_name} {year}")

    conn.close()


# -------------------------------------------------------
# Run for all years ≥ 2020
# -------------------------------------------------------
if __name__ == "__main__":
    ensure_column_exists()
    for yr in range(2020, datetime.now().year + 1):
        print(f"\n=== Updating tire degradation for {yr} ===")
        update_tire_deg_in_db(yr)
    print("\n✅ Done updating all seasons.")
