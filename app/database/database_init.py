import os
import sqlite3
import fastf1
from fastf1 import utils
from datetime import datetime
from fastf1.ergast import Ergast

import pandas as pd

current_year = datetime.now().year


# ==========================
# Setup
# ==========================
CACHE_DIR = 'fastf1_cache'
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

DB_FILE = 'app/database/f1_data.db'


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


def format_quali_time(val):
    if val is None or pd.isna(val):
        return None
    return str(val) 

# ==========================
# Populate DB from FastF1
# ==========================
def populate_for_season(year):
    print(f"\n=== Processing {year} season ===")
    schedule = fastf1.get_event_schedule(year, include_testing=False)

    for _, event in schedule.iterrows():
        race_name = event['EventName']
        round_number = event['RoundNumber']
        circuit = event['Location']
        race_date = event['EventDate'].strftime('%Y-%m-%d')

        print(f"  -> {race_name} (Round {round_number})")

        conn = sqlite3.connect(DB_FILE)
        race_id = insert_race(conn, year, round_number, race_name, circuit, race_date)

        # --- Load Qualifying ---
        quali_results = None
        try:
            quali = fastf1.get_session(year, round_number, 'Qualifying')
            quali.load()
            quali_results = quali.results
        except Exception:
            pass

        # --- Load Race ---
        try:
            race = fastf1.get_session(year, round_number, 'Race')
            race.load()
            race_results = race.results
        except Exception:
            race_results = None

        if race_results is None:
            conn.close()
            continue
        
        for _, row in race_results.iterrows():
            print(row.get('HeadshotUrl'))
            driver_id = insert_driver(
                conn,
                row['Abbreviation'],
                row.get('FirstName', None),
                row.get('LastName', None),
                row.get('HeadshotUrl'),
                row.get('CountryCode')
            )
            constructor_id = insert_constructor(conn, row['TeamName'])

            # pull qualifying times if available
            q1 = q2 = q3 = None
            if quali_results is not None and row['Abbreviation'] in quali_results['Abbreviation'].values:
                qrow = quali_results[quali_results['Abbreviation'] == row['Abbreviation']].iloc[0]
                q1 = format_quali_time(qrow.get('Q1', None))
                q2 = format_quali_time(qrow.get('Q2', None))
                q3 = format_quali_time(qrow.get('Q3', None))

            position = row.get('Position', None)
            points = row.get('Points', None)
            elo = None

            insert_driver_race(conn, driver_id, constructor_id, race_id, q1, q2, q3, position, points, elo)

        conn.close()



if __name__ == "__main__":
    reset_tables()
    
    for yr in range(2019, current_year + 1):
        populate_for_season(yr)

    print("\n Database populated for all seasons from 2019 onwards.")
    
    
    
