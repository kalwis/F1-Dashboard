import pandas as pd
import session_retrival as fn

def add_elo_rating(year, round, previous_elo):
    round_results = fn.get_session(year, round)
    if len(previous_elo) == 0:
        player_elo = round_results[["DriverId", "FirstName", "LastName",]]
        player_elo["RoundCurrent"] = 1000
        new_elo_frame = player_elo
    else:
        new_elo_frame = previous_elo
    new_elo_frame["NewRound"] = 0.0




    if year < 2006 & year > 2002:
        pass
    elif year > 2005:
        for _, player_A in round_results[["DriverId", "RacePosition"]].iterrows():
            for _, player_B in round_results[["DriverId", "RacePosition"]].iterrows():
                elo_A = new_elo_frame[new_elo_frame["DriverId"] == player_A["DriverId"]]["RoundCurrent"].iloc[0]
                elo_B = new_elo_frame[new_elo_frame["DriverId"] == player_B["DriverId"]]["RoundCurrent"].iloc[0]
                actual_result_A = determine_actual_Result(player_A["RacePosition"],player_B["RacePosition"] )
                player_A_chance = determine_win_chance(elo_A, elo_B)

                new_player_A_elo = 20*(actual_result_A - player_A_chance)

                new_elo_frame.loc[new_elo_frame["DriverId"] == player_A["DriverId"], "NewRound"] += new_player_A_elo

                
    elif year < 2003:
        pass
    return new_elo_frame

    


def determine_win_chance(elo_rating_A, elo_rating_B):
    exp1 = 1
    
    exp2 = 1 + 10**((elo_rating_B - elo_rating_A)/400)
    
    return exp1/exp2

def determine_actual_Result(rank_A, rank_B):
    if rank_A == rank_B:
        return 0.5
    elif rank_A < rank_B:
        return 1
    elif rank_B < rank_A:
        return 0
print(add_elo_rating(2006, 1, pd.DataFrame()))