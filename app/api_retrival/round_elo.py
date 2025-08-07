import pandas as pd
import session_retrival as fn

def add_elo_rating(year, round, previous_elo):
    round_results = fn.get_session(year, round)
    print(round_results)
    if len(previous_elo) == 0:
        player_elo = round_results[["DriverId", "FirstName", "LastName",]]
        player_elo[round - 1] = 1000
        new_elo_frame = player_elo
    else:
        new_elo_frame = previous_elo
    new_elo_frame[round] = new_elo_frame[round - 1]




    if year < 2006 & year > 2002:
        pass
    elif year > 2005:
        for _, player_A in round_results[["DriverId", "RacePosition"]].iterrows():
            for _, player_B in round_results[["DriverId", "RacePosition"]].iterrows():
                #need to add a way to add drivers to the ELO rating
                
                elo_A = new_elo_frame[new_elo_frame["DriverId"] == player_A["DriverId"]][round - 1].iloc[0]
                elo_B = new_elo_frame[new_elo_frame["DriverId"] == player_B["DriverId"]][round - 1].iloc[0]
                actual_result_A = determine_actual_Result(player_A["RacePosition"],player_B["RacePosition"] )
                player_A_chance = determine_win_chance(elo_A, elo_B)

                new_player_A_elo = 5*(actual_result_A - player_A_chance)

                new_elo_frame.loc[new_elo_frame["DriverId"] == player_A["DriverId"], round] += new_player_A_elo

                
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
    

def check_new_drivers(session, existing_elo):

    for _, player_A in session[["DriverId"]].iterrows():
            if player_A.values[0] not in session["DriverId"].values:
                print("a")
            else:
                new_row = pd.DataFrame()
                new_row["DriverId"] = player_A.values[0]
                for i in session[session["DriverId"] == player_A.values[0]]["Q1"]:
                    print(i)
                



print(add_elo_rating(2006, 1, pd.DataFrame()))
print(check_new_drivers(fn.get_session(2006,1), 1))
#
#j = pd.DataFrame()
#for i in range(1,14):
    
    
 #   j = add_elo_rating(2007, i, j) 
