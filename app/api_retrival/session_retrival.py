#pip install fastf1
import fastf1
from fastf1.ergast import Ergast
from datetime import datetime
import pandas as pd

#gets an individual session number, just like practice race 3 from 2019 round 3
#returns similar to a datafram object
#https://docs.fastf1.dev/core.html#fastf1.core.SessionResults
#best for post 2018 results, but works post 2011. doesnt work before 2003
def get_session_indivdual_post(year, round, session_num):
    a = fastf1.get_event(year, round)
    
    b = a.get_session(session_num)
    b.load()
    c = b.results
    c["CircutLocation"] = a["Location"]
    return c

#gets an individual session as well but through ergest, better used for pre 2018
def get_session_indivdual_pre(year, round, session_num):
    ergast = Ergast()
    if session_num < 4:
        a = ergast.get_qualifying_results(season=year, round=round)

    else:
        a = ergast.get_race_results(season=year, round=round)

    return a.content[0]

#get any session, will return empty dataframe if it doesnt exist in the database or is invalid
def get_session(year, round):
    if year > datetime.now().year or year < 1950:
        return pd.DataFrame()
    
    if year < 2018:
        circuits = Ergast().get_circuits(year)


        if round > len(circuits) or round < 1: 
            return pd.DataFrame() 
        a = get_session_indivdual_pre(year=year, round=round, session_num=5)
        a.rename(columns={
            'number': 'DriverNumber',
            'driverUrl': 'DriverUrl',
            'driverId': 'DriverId',
            'position': 'RacePosition',
            'constructorName': 'ConstructorName',
            'driverNationality': 'CountryName',
            'givenName': 'FirstName',
            'familyName': 'LastName',
            'points': 'Points',
            'grid': 'GridPosition',
            'laps': 'Laps',
            'totalRaceTime': 'RaceTime',
            'status': 'Status',
        }, inplace=True)
        a = a[[
                'DriverId',
                'RacePosition',
                'ConstructorName',
                'FirstName',
                'LastName',
                'Points',
                'GridPosition',
                'Laps',
                'RaceTime',
                'Status',
                'DriverNumber',
                'DriverUrl'
            ]]
        if year > 2002:
            b = get_session_indivdual_pre(year=year, round=round, session_num=0)
            if "Q3" not in b.columns:
                b["Q2"] = 0
                b["Q3"] = 0
            
            b = b[['Q1', 'Q2', 'Q3', 'position', 'driverId']]
            b.rename(columns={
                'position':'QualifyingPosition',
                'driverId':'DriverId',
            }, inplace=True)
            final = a.merge(b, on='DriverId', how='left')
            
        else:
            b = pd.DataFrame()
            a["Q1"] = 0
            a["Q2"] = 0
            a["Q3"] = 0
            a['QualifyingPosition'] = 0
            final = a

        final["CircuitLocation"] = circuits.loc[round -1, 'locality']
        
        
    else:
        #4 is qual, 5 is race
        a = get_session_indivdual_post(year=year, round=round, session_num=5)
        b = get_session_indivdual_post(year=year, round=round, session_num=4)
        a.rename(columns={
            'Time': 'RaceTime',
            'Position': 'RacePosition',
            'TeamName': 'ConstructorName',
            'HeadshotUrl': 'DriverUrl'
        }, inplace=True)
        a.drop(columns=['BroadcastName', 'Abbreviation', 'TeamColor', 'TeamId', 'FullName', 'ClassifiedPosition', 'Q1', 'Q2', 'Q3', 'CountryCode'], inplace=True)
        b = b[['Q1', 'Q2', 'Q3', 'Position', 'DriverId']]
        b.rename(columns={
            'Position':'QualifyingPosition'
        }, inplace=True)
        final = a.merge(b, on='DriverId', how='left')
    final["Round"] = round
    final["Year"] = year
    return final





def get_rounds_count(year):
    if year < 2018:
        circuits = Ergast().get_circuits(year)


        return len(circuits)
    else:
        return max(fastf1.get_event_schedule(year)["RoundNumber"])



if __name__ == "__main__":
    
    print(get_session(2003,1))


    
    
    
