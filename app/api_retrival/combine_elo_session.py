import pandas as pd
import session_retrival as fn1
import round_elo as fn2
import fastf1
import sqlite3

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
    for i in range(1, fn1.get_rounds_count(year)+1):
        b = pd.concat([b, merge_constructor_elo_session(a, fn1.get_session(year, i))], ignore_index=True)
    return b



def get_sql_session_driver(year):
    a = fn2.get_season_elos(year)
    b = pd.DataFrame()
    for i in range(1, fn1.get_rounds_count(year)+1):
        b = pd.concat([b, merge_player_elo_session(a, fn1.get_session(year, i))], ignore_index=True)
    return b


def merge_session_elos(elo_tables, session):
    """
    Merge driver and constructor elo ratings into a single session dataframe.
    - elo_tables[0] = driver elo
    - elo_tables[1] = constructor elo
    - elo_tables[2] = driver combined elo
    - session = session dataframe with DriverId, ConstructorName, Year, Round
    """
    round = max(session["Round"])
    merged = session.copy()
    
    # Add Driver Elo
    merged = merged.merge(
        elo_tables[0][["DriverId", round]], on="DriverId", how="left"
    )
    merged.rename(columns={round: "DriverElo"}, inplace=True)

    # Add Driver Combined Elo
    merged = merged.merge(
        elo_tables[2][["DriverId", round]], on="DriverId", how="left"
    )
    merged.rename(columns={round: "DriverCombinedElo"}, inplace=True)

    # Add Constructor Elo
    merged = merged.merge(
        elo_tables[1][["ConstructorName", round]], on="ConstructorName", how="left"
    )
    merged.rename(columns={round: "ConstructorElo"}, inplace=True)

    return merged


def get_sql_session_elos(year):
    elo_tables = fn2.get_season_elos(year)
    results = pd.DataFrame()

    # Get the full season schedule — no date filtering
    schedule = fastf1.get_event_schedule(year)
    schedule["EventDate"] = pd.to_datetime(schedule["EventDate"]).dt.tz_localize(None)

    for _, event in schedule.iterrows():
        event_name = event["EventName"].lower()
        rnd = int(event["RoundNumber"])

        # Skip pre-season testing or any event with 'test' in its name
        if "test" in event_name:
            print(f"Skipping testing event: {event['EventName']}")
            continue

        try:
            session = fn1.get_session(year, rnd)
        except ValueError as e:
            print(f"⚠️ Skipping round {rnd} ({event['EventName']}): {e}")
            continue

        if session is None or session.empty:
            print(f"⚠️ No session data for round {rnd} ({event['EventName']})")
            continue

        session_merged = merge_session_elos(elo_tables, session)
        results = pd.concat([results, session_merged], ignore_index=True)

    return results

def get_sql_session_elos_single(year, rnd):
    """Return merged session + elo data for a single round only."""
    import session_retrival as fn1
    import round_elo as fn2

    elo_tables = fn2.get_season_elos(year)
    session = fn1.get_session(year, rnd)
    return merge_session_elos(elo_tables, session)

def get_db_elos(year):
    """Recreate elo_tables = (driver, constructor, combined) from the database."""
    conn = sqlite3.connect("app/api_retrival/database/f1_data.db")

    driver_elo = pd.read_sql_query("""
        SELECT d.first_name AS FirstName, d.last_name AS LastName, d.driver_id AS DriverId,
               dr.elo AS DriverElo, dr.combined_elo AS CombinedElo, r.round
        FROM Driver_Race dr
        JOIN Race r ON dr.race_id = r.race_id
        JOIN Driver d ON dr.driver_id = d.driver_id
        WHERE r.year = ?
    """, conn, params=(year,))

    constructor_elo = pd.read_sql_query("""
        SELECT c.name AS ConstructorName, cr.elo AS ConstructorElo, r.round
        FROM Constructor_Race cr
        JOIN Race r ON cr.race_id = r.race_id
        JOIN Constructor c ON cr.constructor_id = c.constructor_id
        WHERE r.year = ?
    """, conn, params=(year,))

    conn.close()

    # pivot them so each table has shape like round_elo output
    drv = driver_elo.pivot_table(index=["DriverId"], columns="round", values="DriverElo").reset_index()
    constr = constructor_elo.pivot_table(index=["ConstructorName"], columns="round", values="ConstructorElo").reset_index()
    comb = driver_elo.pivot_table(index=["DriverId"], columns="round", values="CombinedElo").reset_index()
    return (drv, constr, comb)

def merge_session_elos_single(elo_tables, session):
    """
    Merge driver and constructor Elo ratings into a single session dataframe
    for a single round only.  Handles missing round columns and dtype mismatches.
    """
    merged = session.copy()
    round_num = int(session["Round"].iloc[0]) if "Round" in session.columns else None

    # ------------------------------------------------------------------
    # Ensure consistent merge-key dtypes
    # ------------------------------------------------------------------
    merged["DriverId"] = merged["DriverId"].astype(str)
    merged["ConstructorName"] = merged["ConstructorName"].astype(str)

    # ------------------------------------------------------------------
    # DRIVER ELO
    # ------------------------------------------------------------------
    drv_elo_df = elo_tables[0].copy()
    drv_elo_df["DriverId"] = drv_elo_df["DriverId"].astype(str)

    if round_num not in drv_elo_df.columns:
        valid_rounds = [c for c in drv_elo_df.columns if isinstance(c, (int, float))]
        if valid_rounds:
            last_round = max(valid_rounds)
            print(f"⚠️ Driver Elo for round {round_num} not found, using last available round {last_round}.")
            drv_elo_df["_tmp_driver_elo"] = drv_elo_df[last_round]
        else:
            drv_elo_df["_tmp_driver_elo"] = 1000
        merge_col = "_tmp_driver_elo"
    else:
        drv_elo_df["_tmp_driver_elo"] = drv_elo_df[round_num]
        merge_col = "_tmp_driver_elo"

    merged = merged.merge(
        drv_elo_df[["DriverId", merge_col]], on="DriverId", how="left"
    ).rename(columns={merge_col: "DriverElo"})

    # ------------------------------------------------------------------
    # COMBINED ELO
    # ------------------------------------------------------------------
    comb_elo_df = elo_tables[2].copy()
    comb_elo_df["DriverId"] = comb_elo_df["DriverId"].astype(str)

    if round_num not in comb_elo_df.columns:
        valid_rounds = [c for c in comb_elo_df.columns if isinstance(c, (int, float))]
        if valid_rounds:
            last_round = max(valid_rounds)
            print(f"⚠️ Combined Elo for round {round_num} not found, using last available round {last_round}.")
            comb_elo_df["_tmp_comb_elo"] = comb_elo_df[last_round]
        else:
            comb_elo_df["_tmp_comb_elo"] = 1000
        merge_col = "_tmp_comb_elo"
    else:
        comb_elo_df["_tmp_comb_elo"] = comb_elo_df[round_num]
        merge_col = "_tmp_comb_elo"

    merged = merged.merge(
        comb_elo_df[["DriverId", merge_col]], on="DriverId", how="left"
    ).rename(columns={merge_col: "DriverCombinedElo"})

    # ------------------------------------------------------------------
    # CONSTRUCTOR ELO
    # ------------------------------------------------------------------
    constr_elo_df = elo_tables[1].copy()
    constr_elo_df["ConstructorName"] = constr_elo_df["ConstructorName"].astype(str)

    if round_num not in constr_elo_df.columns:
        valid_rounds = [c for c in constr_elo_df.columns if isinstance(c, (int, float))]
        if valid_rounds:
            last_round = max(valid_rounds)
            print(f"⚠️ Constructor Elo for round {round_num} not found, using last available round {last_round}.")
            constr_elo_df["_tmp_constr_elo"] = constr_elo_df[last_round]
        else:
            constr_elo_df["_tmp_constr_elo"] = 1000
        merge_col = "_tmp_constr_elo"
    else:
        constr_elo_df["_tmp_constr_elo"] = constr_elo_df[round_num]
        merge_col = "_tmp_constr_elo"

    merged = merged.merge(
        constr_elo_df[["ConstructorName", merge_col]], on="ConstructorName", how="left"
    ).rename(columns={merge_col: "ConstructorElo"})

    # ------------------------------------------------------------------
    # Final clean-up
    # ------------------------------------------------------------------
    merged["DriverElo"] = merged["DriverElo"].fillna(1000)
    merged["DriverCombinedElo"] = merged["DriverCombinedElo"].fillna(1000)
    merged["ConstructorElo"] = merged["ConstructorElo"].fillna(1000)

    return merged

if __name__ == "__main__":
    #fn1.get_rounds_count(2017)
    x = get_sql_session_elos(2017)
    print(x.columns)


