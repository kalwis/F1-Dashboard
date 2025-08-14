
PRAGMA foreign_keys = ON;

CREATE TABLE Seasons (
    season_id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL UNIQUE
);

CREATE TABLE Circuits (
    circuit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    country TEXT,
    latitude REAL,
    longitude REAL,
    url TEXT
);

CREATE TABLE Constructors (
    constructor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nationality TEXT,
    url TEXT
);

CREATE TABLE Drivers (
    driver_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    date_of_birth TEXT,
    nationality TEXT,
    number INTEGER,
    code TEXT,
    url TEXT
);

CREATE TABLE Races (
    race_id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    circuit_id INTEGER NOT NULL,
    round INTEGER,
    name TEXT,
    date TEXT,
    time TEXT,
    url TEXT,
    FOREIGN KEY (season_id) REFERENCES Seasons(season_id),
    FOREIGN KEY (circuit_id) REFERENCES Circuits(circuit_id)
);

CREATE TABLE Results (
    result_id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    constructor_id INTEGER NOT NULL,
    grid_position INTEGER,
    position_order INTEGER,
    position_text TEXT,
    points REAL,
    laps INTEGER,
    time TEXT,
    status TEXT,
    FOREIGN KEY (race_id) REFERENCES Races(race_id),
    FOREIGN KEY (driver_id) REFERENCES Drivers(driver_id),
    FOREIGN KEY (constructor_id) REFERENCES Constructors(constructor_id)
);

CREATE TABLE Qualifying (
    qualifying_id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    constructor_id INTEGER NOT NULL,
    q1_time TEXT,
    q2_time TEXT,
    q3_time TEXT,
    position INTEGER,
    FOREIGN KEY (race_id) REFERENCES Races(race_id),
    FOREIGN KEY (driver_id) REFERENCES Drivers(driver_id),
    FOREIGN KEY (constructor_id) REFERENCES Constructors(constructor_id)
);
