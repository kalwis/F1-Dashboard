import os
import sqlite3
import fastf1
import pandas as pd
from datetime import datetime
from combine_elo_session import get_sql_session_elos

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


def populate_year(year: int):
    print(f"\n=== Checking {year} season for new races ===")

    results = get_sql_session_elos(year)
    schedule = fastf1.get_event_schedule(year)

    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    for _, event in schedule.iterrows():
        rnd = int(event["RoundNumber"])
        name = event["EventName"]
        circuit = event["Location"]
        date = event["EventDate"]

        # Always make sure the race exists in schedule table
        cur.execute("""
            INSERT OR IGNORE INTO Race (year, round, name, circuit, date)
            VALUES (?, ?, ?, ?, ?)
        """, (year, rnd, name, circuit, date))
        conn.commit()

        # Get race_id
        race_id = cur.execute(
            "SELECT race_id FROM Race WHERE year=? AND round=?", (year, rnd)
        ).fetchone()[0]

        # Skip if results already inserted
        cur.execute("SELECT COUNT(*) FROM Driver_Race WHERE race_id=?", (race_id,))
        if cur.fetchone()[0] > 0:
            print(f" -> Round {rnd}: {name} already populated. Skipping.")
            continue

        # Get results if available
        round_df = results[results["Round"] == rnd] if not results.empty else pd.DataFrame()
        if round_df.empty:
            print(f" -> Round {rnd}: {name} has no results yet.")
            continue

        print(f" -> Round {rnd}: Inserting results for {name}")

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
        print(f"    ✔ Results inserted for {name}")

    conn.close()
    print(f"\n=== Done checking {year} ===")


if __name__ == "__main__":
    current_year = datetime.now().year

    # Always check current year
    populate_year(current_year)

    # If next year schedule exists (future season announced), also populate it
    try:
        fastf1.get_event_schedule(current_year + 1)
        populate_year(current_year + 1)
    except Exception:
        print(f"No schedule found for {current_year + 1}, skipping.")
