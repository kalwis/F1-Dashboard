import os
import sqlite3
import fastf1
from fastf1 import utils
from datetime import datetime
from fastf1.ergast import Ergast
from session_retrival import get_session

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
        year INTEGER NOT NULL,
        round INTEGER NOT NULL,
        elo REAL DEFAULT NULL,
        FOREIGN KEY (constructor_id) REFERENCES Constructor(constructor_id),
        UNIQUE(constructor_id, year, round)  -- prevents duplicates
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
        Q1 TEXT,
        Q2 TEXT,
        Q3 TEXT,
        position INTEGER,
        points REAL,
        elo REAL,
        FOREIGN KEY (driver_id) REFERENCES Driver(driver_id),
        FOREIGN KEY (constructor_id) REFERENCES Constructor(constructor_id),
        FOREIGN KEY (race_id) REFERENCES Race(race_id)
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


def insert_driver_race(conn, driver_id, constructor_id, race_id, q1, q2, q3, position, points, elo):
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO Driver_Race (driver_id, constructor_id, race_id, Q1, Q2, Q3, position, points, elo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (driver_id, constructor_id, race_id, q1, q2, q3, position, points, elo))
    conn.commit()

def insert_constructor_race(conn, constructor_id, year, round, elo):
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO Constructor_Race (constructor_id, year, round, elo)
        VALUES (?, ?, ?, ?)
    """, (constructor_id, year, round, elo))
    conn.commit()



def format_quali_time(val):
    if val is None or pd.isna(val):
        return None
    return str(val) 

# ==========================
# Populate DB from FastF1
# ==========================
def populate_for_season(year):
    print(f"\n=== Processing {year} season ===")
    
    # For schedules: use fastf1 if year >= 2018, otherwise Ergast
    if year >= 2018:
        schedule = fastf1.get_event_schedule(year, include_testing=False)
    else:
        schedule = Ergast().get_circuits(year)
        schedule["RoundNumber"] = range(1, len(schedule) + 1)
        schedule.rename(columns={"circuitName": "EventName", "locality": "Location"}, inplace=True)
        schedule["EventDate"] = None  # Ergast doesnt provide event date reliably

    for _, event in schedule.iterrows():
        race_name = event['EventName']
        round_number = event['RoundNumber']
        circuit = event['Location']
        race_date = (
            event['EventDate'].strftime('%Y-%m-%d') 
            if 'EventDate' in event and pd.notnull(event['EventDate']) 
            else None
        )

        print(f"  -> {race_name} (Round {round_number})")

        conn = sqlite3.connect(DB_FILE)
        race_id = insert_race(conn, year, round_number, race_name, circuit, race_date)

        # Use your unified get_session function
        results = get_session(year, round_number)
        if results.empty:
            conn.close()
            continue

        for _, row in results.iterrows():
            driver_id = insert_driver(
                conn,
                row.get('DriverId'),
                row.get('FirstName'),
                row.get('LastName'),
                row.get('DriverUrl'),
                row.get('CountryName')  # Ergast gives nationality
            )
            constructor_id = insert_constructor(conn, row['ConstructorName'])
            insert_constructor_race(conn, constructor_id, year, round_number, None)

            q1 = format_quali_time(row.get('Q1')) if 'Q1' in row else None
            q2 = format_quali_time(row.get('Q2')) if 'Q2' in row else None
            q3 = format_quali_time(row.get('Q3')) if 'Q3' in row else None

            position = row.get('RacePosition')
            points = row.get('Points')
            elo = None

            insert_driver_race(
                conn, driver_id, constructor_id, race_id,
                q1, q2, q3, position, points, elo
            )

        conn.close()





if __name__ == "__main__":
    reset_tables()
    
    for yr in range(2008, current_year + 1):
        populate_for_season(yr)

    print("\n Database populated for all seasons from 2008 onwards.")


    
