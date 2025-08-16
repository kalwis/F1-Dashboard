import fastf1
from fastf1.ergast import Ergast
from datetime import datetime
import pandas as pd
import session_retrival as fn



def get_drivers(year):
    a =  pd.DataFrame()
    for i in range(1, fn.get_rounds_count(year)):
        a = pd.concat([a, fn.get_session(year, i)])
        
    a = a.drop_duplicates(subset="DriverId", keep="first")
    a= a[["DriverId", "ConstructorName", "FirstName", "LastName", 'DriverNumber']]
    return a

def get_bulk_drivers_ever(start=1950, current=2025):
    a =  pd.DataFrame()
    for i in range(start, current):
        a = pd.concat([a, get_drivers(i)])
        a = a.drop_duplicates(subset="DriverId", keep="first")
        
    return a

    
