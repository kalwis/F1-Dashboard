#pip install fastf1
import fastf1
from fastf1.ergast import Ergast

#gets an individual session number, just like practice race 3 from 2019 round 3
#returns similar to a datafram object
#https://docs.fastf1.dev/core.html#fastf1.core.SessionResults
#best for post 2018 results, but works post 2011. doesnt work before 2003
def get_session_indivdual_post(year, round, session_num):
    a = fastf1.get_event(year, round)
    b = a.get_session(session_num)
    b.load()
    c = b.results
    return c

#gets an individual session as well but through ergest, better used for pre 2018
def get_session_indivdual_pre(year, round, session_num):
    ergast = Ergast()
    if session_num < 4:
        a = ergast.get_qualifying_results(season=year, round=round)
    else:
        a = ergast.get_race_results(season=year, round=round)
    return a.content[0]


def get_session(year, round):
    if year < 2018:
        a = get_session_indivdual_pre(year=year, round=round, session_num=0)
    else:
        #4 is qual, 5 is race
        a = get_session_indivdual_post(year=year, round=round, session_num=5)
        b = get_session_indivdual_post(year=year, round=round, session_num=4)
        a.rename(columns={
            'Time': 'RaceTime',
            'Position': 'RacePosition',
            'TeamName': 'ConstructorName'
        }, inplace=True)
        a.drop(columns=['BroadcastName', 'Abbreviation', 'TeamColor', 'TeamId', 'FullName', 'HeadshotUrl', 'ClassifiedPosition', 'Q1', 'Q2', 'Q3'], inplace=True)
        b = b[['Q1', 'Q2', 'Q3', 'Position', 'DriverId']]
        b.rename(columns={
            'Position':'QualifyingPosition'
        }, inplace=True)
        final = a.merge(b, on='DriverId', how='left')
    print(b.columns)
    print(b)

get_session(2019, 1)
