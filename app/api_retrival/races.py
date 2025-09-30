import sqlite3
import fastf1
import pandas as pd
from datetime import datetime

DB_FILE = 'app/api_retrival/database/f1_data.db'

def getRaces(year):
    a = fastf1.get_event_schedule(year)
    a = a[["RoundNumber", "Country", "Location", "EventDate"]]
    a["Year"] = year
    return a

def update_race_info():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    # Loop through all years currently in DB
    cur.execute("SELECT DISTINCT year FROM Race")
    years = [row[0] for row in cur.fetchall()]

    for year in years:
        races = getRaces(year)

        for _, row in races.iterrows():
            rnd = int(row["RoundNumber"])
            location = str(row["Location"]) if row["Location"] else None
            date = None
            if pd.notna(row["EventDate"]):
                date = pd.to_datetime(row["EventDate"]).strftime("%Y-%m-%d")

            cur.execute("""
                UPDATE Race
                SET circuit = ?, date = ?
                WHERE year = ? AND round = ?
            """, (location, date, year, rnd))

    conn.commit()
    conn.close()
    print("Race table updated with circuit location and date.")

if __name__ == "__main__":
    update_race_info()
