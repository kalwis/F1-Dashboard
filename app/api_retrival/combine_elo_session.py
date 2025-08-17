import pandas as pd
import session_retrival as fn1
import round_elo as fn2

def merge_player_elo_session(elo_tables, session):
    #elo table will be passed as full thing
    #same with session

    round = max(session["Round"])
    a = pd.DataFrame()
    a = session.merge(elo_tables[0][["DriverId", round]], on="DriverId", how="left")
    a.rename(columns={
            round: "DriverElo",
        }, inplace=True)
    a = a.merge(elo_tables[2][["DriverId", round]], on="DriverId", how="left")
    a.rename(columns={
            round: "DriverCombinedElo",
        }, inplace=True)
    
    return a

def merge_constructor_elo_session(elo_tables, session):
    #elo table will be passed as full thing
    #same with session
    round = max(session["Round"])
    a = pd.DataFrame()
    a = session.merge(elo_tables[1][["ConstructorName", round]], on="ConstructorName", how="left")
    a.rename(columns={
            round: "ConstructorElo",
        }, inplace=True)    
    a= a[["Year", "Round", "ConstructorName", "ConstructorElo"]]
    a = a.drop_duplicates(subset=["ConstructorName"], keep="first")

    return a

def get_sql_session_constructor(year):
    a = fn2.get_season_elos(year)
    b = pd.DataFrame()
    for i in range(1, fn1.get_rounds_count(year)):
        b = pd.concat([b, merge_constructor_elo_session(a, fn1.get_session(year, i))], ignore_index=True)
    return b



def get_sql_session_driver(year):
    a = fn2.get_season_elos(year)
    b = pd.DataFrame()
    for i in range(1, fn1.get_rounds_count(year)):
        b = pd.concat([b, merge_player_elo_session(a, fn1.get_session(year, i))], ignore_index=True)
    return b

