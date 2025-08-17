import fastf1
from fastf1.ergast import Ergast
import pandas as pd

def getRaces(year):
    a = fastf1.get_event_schedule(year)

    a = a[["RoundNumber", "Country", "Location", "EventDate"]]
    a["Year"] = year
    return a

def all_races():
    races = pd.DataFrame()
    for i in range(1950, 2025):
        races = pd.concat([races, getRaces(i)], ignore_index=True)
    return races