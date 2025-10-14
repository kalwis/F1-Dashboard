import os
import sqlite3
import fastf1
import pandas as pd
from datetime import datetime, timezone
from combine_elo_session import get_sql_session_elos
from races import getRaces  # helper

# ==========================
# Setup
# ==========================
CACHE_DIR = 'fastf1_cache'
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

DB_FILE = 'app/api_retrival/database/f1_data.db'


def safe_int(val):
    if val is None or pd.isna(val):
        return None
    return int(val)


def format_quali_time(val):
    if val is None or pd.isna(val):
        return None
    return str(val)


def safe_date(val):
    """Convert pandas/np datetime or Python date to YYYY-MM-DD string."""
    if val is None or pd.isna(val):
        return None
    return pd.to_datetime(val).strftime("%Y-%m-%d")


def update_latest_round(year: int):
    print(f"\n=== Checking latest {year} round ===")

    schedule = getRaces(year)
    now = datetime.now(timezone.utc)

    # Only past rounds, no round 0
    past_rounds = schedule[
        (schedule["RoundNumber"] > 0)
        & (pd.to_datetime(schedule["EventDate"]).dt.tz_localize("UTC") <= now)
    ]

    if past_rounds.empty:
        print("No past races yet this season.")
        return

    # Pick the latest past round
    latest_event = past_rounds.iloc[-1]
    rnd = int(latest_event["RoundNumber"])
    name = latest_event.get("EventName", f"Round {rnd}")
    circuit = latest_event["Location"]
    date_val = safe_date(latest_event["EventDate"])

    print(f"🔎 Latest race: Round {rnd} – {name} ({circuit}, {date_val})")

    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    # Check Race table
    cur.execute("SELECT race_id FROM Race WHERE year=? AND round=?", (year, rnd))
    race_row = cur.fetchone()

    if not race_row:
        print(f"🆕 Round {rnd} not in DB → inserting results...")
    else:
        race_id = race_row[0]
        cur.execute("SELECT COUNT(*) FROM Driver_Race WHERE race_id=?", (race_id,))
        if cur.fetchone()[0] > 0:
            print(f"✔ Round {rnd} already fully populated in DB.")
            conn.close()
            return
        print(f"⚠️ Round {rnd} in DB but missing results → inserting now...")

    # Fetch results
    results = get_sql_session_elos(year)
    round_df = results[results["Round"] == rnd] if not results.empty else pd.DataFrame()
    if round_df.empty:
        print("✖ No results found in FastF1 yet.")
        conn.close()
        return

    # Ensure Race row exists
    cur.execute("""
        INSERT OR IGNORE INTO Race (year, round, name, circuit, date)
        VALUES (?, ?, ?, ?, ?)
    """, (year, rnd, name, circuit, date_val))
    conn.commit()

    race_id = cur.execute(
        "SELECT race_id FROM Race WHERE year=? AND round=?", (year, rnd)
    ).fetchone()[0]

    # Insert results
    for _, row in round_df.iterrows():
        # Driver
        cur.execute("""
            INSERT OR IGNORE INTO Driver (code, first_name, last_name, headshot, country)
            VALUES (?, ?, ?, ?, ?)
        """, (
            str(row.get("DriverId")),
            row.get("FirstName"),
            row.get("LastName"),
            row.get("DriverUrl"),
            row.get("CountryName"),
        ))
        cur.execute("SELECT driver_id FROM Driver WHERE code=?", (str(row.get("DriverId")),))
        driver_id = cur.fetchone()[0]

        # Constructor
        cur.execute("INSERT OR IGNORE INTO Constructor (name) VALUES (?)",
                    (row["ConstructorName"],))
        cur.execute("SELECT constructor_id FROM Constructor WHERE name=?",
                    (row["ConstructorName"],))
        constructor_id = cur.fetchone()[0]

        # Constructor_Race
        cur.execute("""
            INSERT OR IGNORE INTO Constructor_Race (constructor_id, race_id, elo)
            VALUES (?, ?, ?)
        """, (constructor_id, race_id, safe_int(row.get("ConstructorElo"))))

        # Driver_Race
        cur.execute("""
            INSERT INTO Driver_Race (
                driver_id, constructor_id, race_id,
                GridPosition, Laps, RaceTime, Status,
                Q1, Q2, Q3, qualifying_position,
                position, points, elo, combined_elo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            driver_id, constructor_id, race_id,
            safe_int(row.get("GridPosition")),
            safe_int(row.get("Laps")),
            format_quali_time(row.get("RaceTime")),
            row.get("Status"),
            format_quali_time(row.get("Q1")),
            format_quali_time(row.get("Q2")),
            format_quali_time(row.get("Q3")),
            safe_int(row.get("QualifyingPosition")),
            safe_int(row.get("RacePosition")),
            safe_int(row.get("Points")),
            safe_int(row.get("DriverElo")),
            safe_int(row.get("DriverCombinedElo")),
        ))

    conn.commit()
    conn.close()
    print(f"✔ Results inserted for {name}")


if __name__ == "__main__":
    current_year = datetime.now().year
    update_latest_round(current_year)
