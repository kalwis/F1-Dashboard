import sqlite3
import fastf1
import pandas as pd
from datetime import datetime

DB_FILE = 'app/api_retrival/database/f1_data.db'

def getRaces(year):
    a = fastf1.get_event_schedule(year)
    a = a[["RoundNumber", "EventName", "Country", "Location", "EventDate"]]
    a["Year"] = year
    return a

def update_race_info():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    cur.execute("SELECT DISTINCT year FROM Race")
    years = [row[0] for row in cur.fetchall()]

    for year in years:
        races = getRaces(year)

        for _, row in races.iterrows():
            rnd = int(row["RoundNumber"])
            name = str(row["EventName"]) if row["EventName"] else None
            location = str(row["Location"]) if row["Location"] else None
            date = None
            if pd.notna(row["EventDate"]):
                date = pd.to_datetime(row["EventDate"]).strftime("%Y-%m-%d")

            cur.execute("""
                UPDATE Race
                SET name = ?, circuit = ?, date = ?
                WHERE year = ? AND round = ?
            """, (name, location, date, year, rnd))

    conn.commit()
    conn.close()
    print("Race table updated with name, circuit, and date.")


if __name__ == "__main__":
    update_race_info()
