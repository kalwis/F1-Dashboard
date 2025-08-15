PRAGMA foreign_keys = ON;

CREATE TABLE DRIVER (
    driver_id TEXT PRIMARY KEY,
    constructor_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    year INTEGER NOT  NULL,
    driver_number INTEGER
);

CREATE TABLE SESSION (
    driver_id TEXT,
    race_position INTEGER NOT NuLL,
    points INTEGER NOT NULL,
    grid_position INTEGER NOT NULL,
    laps TEXT NOT NULL,
    race_time TEXT NOT NULL,
    completetion_status TEXT NOT NULL,
    q1_time TEXT,
    q2_time TEXT,
    q3_time TEXT,
    race_id TEXT,
    player_elo INTEGER NOT NULL,
    combined_elo INTEGER NOT NULL,
    PRIMARY KEY (driver_id, race_id),
    FOREIGN KEY (driver_id) REFERENCES DRIVER(driver_id),
    FOREIGN KEY (race_id) REFERENCES RACE(race_id),
);

CREATE TABLE RACE (
    race_id TEXT PRIMARY KEY
    year TEXT NOT NUll,
    round INTEGER NOT NUll,
    location TEXT NOT NUll,
    country TEXT NOT NUll,
    date TEXT NOT NUll
);

CREATE CONSTRUCTOR_SESSION(
    race_id TEXT,
    constructor_name TEXT,
    constructor_elo INTEGER NOT NUll,
    PRIMARY KEY (constructor_name, race_id),
    FOREIGN KEY (race_id) REFERENCES RACE(race_id),
);




