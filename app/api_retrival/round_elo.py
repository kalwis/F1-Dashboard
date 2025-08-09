import pandas as pd
import session_retrival as fn

def add_elo_rating(year, round, previous_elo, elo_type):
    round_results = fn.get_session(year, round)

    if len(previous_elo) == 0:
        player_elo = round_results[[elo_type, "FirstName", "LastName", "GridPosition"]]
        player_elo[round - 1] = 1000
        new_elo_frame = player_elo
    else:
        new_elo_frame = previous_elo
    new_elo_frame[round] = new_elo_frame[round - 1]
    new_drivers_rows = check_new_drivers(round_results, previous_elo, elo_type)
    if new_drivers_rows[1] == True:
        new_elo_frame = pd.concat([new_elo_frame, new_drivers_rows[0]], ignore_index=True)



    new_elo_frame = calculate_elo(round_results, elo_type, new_elo_frame, round)


    


    return new_elo_frame

def calculate_elo(round_results, elo_type, new_elo_frame, round):
    for _, player_A in round_results[[elo_type, "RacePosition", "GridPosition"]].iterrows():
        for _, player_B in round_results[[elo_type, "RacePosition", "GridPosition"]].iterrows():

            
            elo_A = new_elo_frame[new_elo_frame[elo_type] == player_A[elo_type]][round - 1].iloc[0]
            elo_B = new_elo_frame[new_elo_frame[elo_type] == player_B[elo_type]][round - 1].iloc[0]
            actual_result_A = determine_actual_Result(player_A["RacePosition"],player_B["RacePosition"] )
            player_A_chance = determine_win_chance(elo_A, elo_B)
 
            new_player_A_elo = calculate_k(player_A["GridPosition"], player_B["GridPosition"])*(actual_result_A - player_A_chance)

            new_elo_frame.loc[new_elo_frame[elo_type] == player_A[elo_type], round] += new_player_A_elo
    return new_elo_frame
    
def calculate_k(gridPositionA, gridPositionB):
    k = 30
    k += gridPositionA - gridPositionB
    return k

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
    

def check_new_drivers(session, existing_elo, elo_type):
        bol = False
        all_new_rows = pd.DataFrame()
        
        if len(existing_elo) != 0:
            for _, player_A in session[[elo_type]].iterrows():
                if player_A.values[0] in existing_elo[elo_type].values:
                    pass
                else:
                    new_row = pd.DataFrame()
                    bol = True
                    new_row[elo_type] = session[session[elo_type] == player_A.values[0]][elo_type]
                    new_row["FirstName"] = session[session[elo_type] == player_A.values[0]]["FirstName"]
                    new_row["LastName"] = session[session[elo_type] == player_A.values[0]]["LastName"]
                    for i in existing_elo.columns:
                        if i not in [elo_type, 'FirstName', 'LastName']:
                            new_row[i] = 1000
                    all_new_rows = pd.concat([all_new_rows, new_row], ignore_index=True)

        
        return all_new_rows, bol
                
                
def get_season_elos(year, elo_type_id):

    elo_types = ["DriverId", "ConstructorName", "Combined"]
    j = pd.DataFrame()
    round_count = fn.get_rounds_count(year)
    for i in range(1,round_count):
        

        j = add_elo_rating(year, i, j, elo_types[elo_type_id]) 

    if elo_type_id == 1:
        j.drop(columns=['FirstName', 'LastName'], inplace=True)
        j = j.drop_duplicates(subset=["ConstructorName"], keep="first")
        
    print(j)
get_season_elos(1988,2)