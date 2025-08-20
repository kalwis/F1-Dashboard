import os
import sqlite3
import fastf1
from fastf1 import utils
from datetime import datetime
from fastf1.ergast import Ergast
from combine_elo_session import get_sql_session_elos
import random, time


import pandas as pd

current_year = datetime.now().year


# ==========================
# Setup
# ==========================
CACHE_DIR = 'fastf1_cache'
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

DB_FILE = 'app/api_retrival/database/f1_data.db'


# ==========================
# Database Schema
# ==========================

def reset_tables():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.executescript("""
    DROP TABLE IF EXISTS Driver;
    DROP TABLE IF EXISTS Constructor;
    DROP TABLE IF EXISTS Race;
    DROP TABLE IF EXISTS Session;
    DROP TABLE IF EXISTS Driver_Race;
    DROP TABLE IF EXISTS Constructor_Race;

    CREATE TABLE IF NOT EXISTS Driver (
            driver_id INTEGER PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            headshot TEXT,
            country TEXT
    );

    CREATE TABLE IF NOT EXISTS Constructor (
        constructor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS Constructor_Race (
        constructor_race_id INTEGER PRIMARY KEY AUTOINCREMENT,
        constructor_id INTEGER NOT NULL,
        race_id INTEGER NOT NULL,
        elo INTEGER,
        UNIQUE(constructor_id, race_id),
        FOREIGN KEY (constructor_id) REFERENCES Constructor(constructor_id)
        FOREIGN KEY (race_id) REFERENCES Race(race_id)
    );

    CREATE TABLE IF NOT EXISTS Race (
        race_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        year INTEGER NOT NULL,
        round INTEGER NOT NULL,
        name TEXT NOT NULL,
        circuit TEXT,
        date DATE
    );


    CREATE TABLE IF NOT EXISTS Driver_Race (
        driver_race_id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER NOT NULL,
        constructor_id INTEGER NOT NULL,
        race_id INTEGER NOT NULL,
        GridPosition INTEGER,
        Laps INTEGER,
        RaceTime TEXT,
        Status TEXT,
        Q1 TEXT,
        Q2 TEXT,
        Q3 TEXT,
        qualifying_position INTEGER,
        position INTEGER,
        points INTEGER,
        elo INTEGER,
        combined_elo INTEGER,
        FOREIGN KEY (driver_id) REFERENCES Driver(driver_id),
        FOREIGN KEY (constructor_id) REFERENCES Constructor(constructor_id),
        FOREIGN KEY (race_id) REFERENCES Race(race_id)
    );

    CREATE TABLE IF NOT EXISTS Advanced (
        advanced_race_id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_race_id  INTEGER NOT NULL,
        avg_lap_time TEXT,
        qualifying_time REAL,
        sector1 REAL,
        sector2 REAL,
        sector3 REAL,
        model_used TEXT,
        FOREIGN KEY (driver_race_id) REFERENCES Driver_Race(driver_race_id)    

    );          



    """)
    conn.commit()
    conn.close()
# ==========================
# Insert helpers
# ==========================
def insert_driver(conn, code, first, last, headshot, country):
    cur = conn.cursor()

    # Check if the driver already exists by code
    cur.execute("SELECT driver_id FROM Driver WHERE code = ?", (code,))
    existing = cur.fetchone()
    if existing:
        return existing[0]  # Return existing ID

    # Insert new driver
    cur.execute("""
        INSERT INTO Driver (code, first_name, last_name, headshot, country)
        VALUES (?, ?, ?, ?, ?)
    """, (
        str(code) if code is not None else None,
        str(first) if first is not None else None,
        str(last) if last is not None else None,
        headshot,
        country
    ))
    conn.commit()

    # Return the new ID
    return cur.lastrowid

def insert_constructor(conn, name):
    cur = conn.cursor()

    cur.execute("SELECT constructor_id FROM Constructor WHERE name=?", (name,))
    existing = cur.fetchone()
    if existing:
        return existing[0]  # Return existing ID

    cur.execute("""
        INSERT OR IGNORE INTO Constructor (name)
        VALUES (?)
    """, (name,))
    conn.commit()
    return cur.execute("SELECT constructor_id FROM Constructor WHERE name=?", (name,)).fetchone()[0]


def insert_race(conn, year, round_, name, circuit, date):
    cur = conn.cursor()
    cur.execute("""
        INSERT OR IGNORE INTO Race (year, round, name, circuit, date)
        VALUES (?, ?, ?, ?, ?)
    """, (year, round_, name, circuit, date))
    conn.commit()
    return cur.execute("SELECT race_id FROM Race WHERE year=? AND round=?", (year, round_)).fetchone()[0]


def insert_session(conn, race_id, session_type, date):
    cur = conn.cursor()
    cur.execute("""
        INSERT OR IGNORE INTO Session (race_id, session_type, date)
        VALUES (?, ?, ?)
    """, (race_id, session_type, date))
    conn.commit()
    return cur.execute("SELECT session_id FROM Session WHERE race_id=? AND session_type=?", (race_id, session_type)).fetchone()[0]


def insert_driver_race(
    conn,
    driver_id,
    constructor_id,
    race_id,
    grid_position,
    laps,
    race_time,
    status,
    q1,
    q2,
    q3,
    qualifying_position,
    position,
    points,
    elo,
    combined_elo
):
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO Driver_Race (
            driver_id, constructor_id, race_id,
            GridPosition, Laps, RaceTime, Status,
            Q1, Q2, Q3, qualifying_position,
            position, points, elo,combined_elo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    """, (
        driver_id, constructor_id, race_id,
        int(grid_position), int(laps), race_time, status,
        q1, q2, q3, qualifying_position,
        position, points, int(elo), int(combined_elo)
    ))
    conn.commit()
    return cur.lastrowid


def insert_constructor_race(conn, constructor_id, race_id, elo):
    cur = conn.cursor()

    # Check if this constructor already has an entry for this year+round
    cur.execute("""
        SELECT constructor_race_id 
        FROM Constructor_Race 
        WHERE constructor_id=? AND race_id=?
    """, (constructor_id, race_id))

    existing = cur.fetchone()
    if existing:
        return existing[0]  # Return existing ID

    # Insert new row
    cur.execute("""
        INSERT INTO Constructor_Race (constructor_id, race_id, elo)
        VALUES (?, ?, ?)
    """, (constructor_id, race_id, int(elo) if elo is not None else None))
    conn.commit()
    
    return cur.lastrowid



def format_quali_time(val):
    if val is None or pd.isna(val):
        return None
    return str(val) 

# ==========================
# Populate DB from FastF1
# ==========================
def populate_for_season(year):
    print(f"\n=== Processing {year} season ===")

    # Get all driver results for the season in one go
    results = get_sql_session_elos(year)
    if results.empty:
        print(f"No results for {year}")
        return

    conn = sqlite3.connect(DB_FILE)

    # Group by round to process race info
    for round_number, round_df in results.groupby("Round"):
        race_name = round_df["EventName"].iloc[0] if "EventName" in round_df else f"Round {round_number}"
        circuit = round_df["CircuitLocation"].iloc[0] if "CircuitLocation" in round_df else None
        race_date = round_df["EventDate"].iloc[0] if "EventDate" in round_df else None

        print(f"  -> {race_name} (Round {round_number})")

        race_id = insert_race(conn, year, round_number, race_name, circuit, race_date)

        for _, row in round_df.iterrows():
            driver_id = insert_driver(
                conn,
                row.get("DriverId"),
                row.get("FirstName"),
                row.get("LastName"),
                row.get("DriverUrl"),
                row.get("CountryName")
            )
            constructor_id = insert_constructor(conn, row["ConstructorName"])
            
            constructor_elo = row.get("ConstructorElo")
            # Insert constructor race (elo starts null unless provided)
            insert_constructor_race(conn, constructor_id, race_id, constructor_elo)

            racetime = format_quali_time(row.get("RaceTime")) if "RaceTime" in row else None
            q1 = format_quali_time(row.get("Q1")) if "Q1" in row else None
            q2 = format_quali_time(row.get("Q2")) if "Q2" in row else None
            q3 = format_quali_time(row.get("Q3")) if "Q3" in row else None

            position = row.get("RacePosition")
            points = row.get("Points")
            elo = row.get("DriverElo", None)

            insert_driver_race(
                conn, driver_id, constructor_id, race_id,
                row.get("GridPosition"),
                row.get("Laps"),
                racetime,
                row.get("Status"),
                q1, q2, q3,
                row.get("QualifyingPosition"),
                row.get("RacePosition"),
                row.get("Points"),
                row.get("DriverElo"),
                row.get("DriverCombinedElo")
            )

    conn.close()






if __name__ == "__main__":
    reset_tables()
    
    for yr in range(1950, current_year + 1):
        populate_for_season(yr)
        print(f"Populated data for {yr} season.")
        time.sleep(3 + random.uniform(0.5, 2.0))  # 3-5s pause

    print("\n Database populated for all seasons from 1950 onwards.")

   
    
