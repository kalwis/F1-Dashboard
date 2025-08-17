import os
import sqlite3
import fastf1
from fastf1 import utils
from datetime import datetime

import pandas as pd

current_year = datetime.now().year


# ==========================
# Setup
# ==========================
CACHE_DIR = 'fastf1_cache'
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

DB_FILE = 'f1_data.db'


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
            date_of_birth DATE,
            nationality TEXT
    );

    CREATE TABLE IF NOT EXISTS Constructor (
        constructor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        nationality TEXT
    );

    CREATE TABLE IF NOT EXISTS Race (
        race_id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        round INTEGER NOT NULL,
        name TEXT NOT NULL,
        circuit TEXT,
        date DATE
    );

    CREATE TABLE IF NOT EXISTS Session (
        session_id INTEGER PRIMARY KEY AUTOINCREMENT,
        race_id INTEGER NOT NULL,
        session_type TEXT NOT NULL,
        date DATE,
        FOREIGN KEY (race_id) REFERENCES Race(race_id)
    );

    CREATE TABLE IF NOT EXISTS Driver_Race (
        driver_race_id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER NOT NULL,
        constructor_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        position INTEGER,
        points REAL,
        elo REAL,
        FOREIGN KEY (driver_id) REFERENCES Driver(driver_id),
        FOREIGN KEY (constructor_id) REFERENCES Constructor(constructor_id),
        FOREIGN KEY (session_id) REFERENCES Session(session_id)
    );
    """)
    conn.commit()
    conn.close()
# ==========================
# Insert helpers
# ==========================
def insert_driver(conn, code, first, last, dob, nationality):
    cur = conn.cursor()

    # Check if the driver already exists by code
    cur.execute("SELECT driver_id FROM Driver WHERE code = ?", (code,))
    existing = cur.fetchone()
    if existing:
        return existing[0]  # Return existing ID

    # Insert new driver
    cur.execute("""
        INSERT INTO Driver (code, first_name, last_name, date_of_birth, nationality)
        VALUES (?, ?, ?, ?, ?)
    """, (
        str(code) if code is not None else None,
        str(first) if first is not None else None,
        str(last) if last is not None else None,
        dob,
        nationality
    ))
    conn.commit()

    # Return the new ID
    return cur.lastrowid

def insert_constructor(conn, name, nationality):
    cur = conn.cursor()

    cur.execute("SELECT constructor_id FROM Constructor WHERE name=?", (name,))
    existing = cur.fetchone()
    if existing:
        return existing[0]  # Return existing ID

    cur.execute("""
        INSERT OR IGNORE INTO Constructor (name, nationality)
        VALUES (?, ?)
    """, (name, nationality))
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


def insert_driver_race(conn, driver_id, constructor_id, session_id, position, points, elo):
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO Driver_Race (driver_id, constructor_id, session_id, position, points, elo)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (driver_id, constructor_id, session_id, position, points, elo))
    conn.commit()


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

        # Sessions to attempt (not all will exist for all years)
        sessions_to_try = ['Qualifying', 'Race']

        for sess_type in sessions_to_try:
            
            
            
            try:
                session = fastf1.get_session(year, round_number, sess_type)
                session.load()
            except Exception:
                # Skip if this session doesn't exist
                continue
            
            results = session.results
            if sess_type == 'Qualifying':
                # Insert separate sessions Q1, Q2, Q3
                for quali_phase in ['Q1', 'Q2', 'Q3']:
                    session_id = insert_session(conn, race_id, quali_phase, session.date.strftime('%Y-%m-%d'))
                    
                    for _, row in results.iterrows():
                        time = row.get(quali_phase, None)
                        if pd.isna(time):
                            continue  # Driver didnt participate in this phase
                        
                        driver_id = insert_driver(
                            conn,
                            row['Abbreviation'],
                            row.get('FirstName', None),
                            row.get('LastName', None),
                            None,
                            None
                        )
                        constructor_id = insert_constructor(conn, row['TeamName'], None)
                    
                        # Store order within that phase instead of final position
                        insert_driver_race(conn, driver_id, constructor_id, session_id, None, None, None)
                        
            else:

                session_id = insert_session(conn, race_id, sess_type, session.date.strftime('%Y-%m-%d'))
               
                

                if results is None:
                    continue

                for _, row in results.iterrows():
                    driver_id = insert_driver(
                        conn,
                        row['Abbreviation'],
                        row.get('FirstName', None),
                        row.get('LastName', None),
                        None,
                        None
                    )
                    constructor_id = insert_constructor(conn, row['TeamName'], None)
                    position = row.get('Position', None)
                    points = row.get('Points', None)
                    elo = None  # Your ELO calculation could go here

                    insert_driver_race(conn, driver_id, constructor_id, session_id, position, points, elo)

        conn.close()


if __name__ == "__main__":
    reset_tables()
    
    for yr in range(2019, current_year + 1):
        populate_for_season(yr)

    print("\n Database populated for all seasons from 2019 onwards.")