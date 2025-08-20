import combine_elo_session
import drivers
import races

def session_populate(year):
    return combine_elo_session.get_sql_session_driver(year)

def driver_race_populate(year):
    return combine_elo_session.get_sql_session_constructor(year)

def driver_populate():
    return drivers.get_bulk_drivers_ever()

def populate_race():
    races.all_races()

