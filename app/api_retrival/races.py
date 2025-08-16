import fastf1
from fastf1.ergast import Ergast
from datetime import datetime
import pandas as pd

def getRaces(year):
    a = fastf1.get_event_schedule(year)

    a = a[["RoundNumber", "Country", "Location", "EventDate"]]
    a["Year"] = year
    return a

getRaces(1950)