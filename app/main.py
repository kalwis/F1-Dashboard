from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
import fastf1.ergast
import os
import json
import pandas as pd
import sqlite3
from datetime import datetime

# Enable cache
os.makedirs("f1_cache", exist_ok=True)
fastf1.Cache.enable_cache("f1_cache")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Ergast API
ergast = fastf1.ergast.Ergast()

# Prediction DB (tyre degradation + qualifying data)
DB_PATH = os.path.join(os.path.dirname(__file__), "api_retrival", "database", "f1_data.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def rows_to_dict_list(cursor_rows):
    """Convert sqlite rows to list of dicts."""
    return [dict(row) for row in cursor_rows]

@app.route('/api/driver-standings', methods=['GET'])
def get_driver_standings():
    try:
        year = request.args.get('year', 'current')
        response = ergast.get_driver_standings(year)
        
        # The response.content is a list containing a pandas DataFrame
        if response.content and len(response.content) > 0:
            df = response.content[0]  # Get the first (and only) DataFrame
            
            # Format the response to match the expected structure
            formatted_standings = []
            for _, row in df.iterrows():
                formatted_standings.append({
                    'position': int(row.get('position', 0)),
                    'points': float(row.get('points', 0)),
                    'Driver': {
                        'driverId': row.get('driverId', ''),
                        'givenName': row.get('givenName', ''),
                        'familyName': row.get('familyName', '')
                    },
                    'Constructor': {
                        'constructorId': row.get('constructorId', ''),
                        'name': row.get('constructorNames', [''])[0] if row.get('constructorNames') else ''
                    }
                })
            
            return jsonify({
                'MRData': {
                    'StandingsTable': {
                        'StandingsLists': [{
                            'DriverStandings': formatted_standings
                        }]
                    }
                }
            })
        else:
            return jsonify({'error': 'No data available'}), 404
            
    except Exception as e:
        print(f"Error in driver standings: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/constructor-standings', methods=['GET'])
def get_constructor_standings():
    try:
        year = request.args.get('year', 'current')
        response = ergast.get_constructor_standings(year)
        
        # The response.content is a list containing a pandas DataFrame
        if response.content and len(response.content) > 0:
            df = response.content[0]  # Get the first (and only) DataFrame
            
            # Format the response to match the expected structure
            formatted_standings = []
            for _, row in df.iterrows():
                formatted_standings.append({
                    'position': int(row.get('position', 0)),
                    'points': float(row.get('points', 0)),
                    'Constructor': {
                        'constructorId': row.get('constructorId', ''),
                        'name': row.get('constructorName', '')
                    }
                })
            
            return jsonify({
                'MRData': {
                    'StandingsTable': {
                        'StandingsLists': [{
                            'ConstructorStandings': formatted_standings
                        }]
                    }
                }
            })
        else:
            return jsonify({'error': 'No data available'}), 404
            
    except Exception as e:
        print(f"Error in constructor standings: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/season-schedule', methods=['GET'])
def get_season_schedule():
    try:
        year = request.args.get('year', 'current')
        response = ergast.get_race_schedule(year)
        
        # For season schedule, response is directly a DataFrame
        if hasattr(response, 'content'):
            df = response.content
        else:
            df = response
            
        # Format the response to match the expected structure
        formatted_races = []
        for _, row in df.iterrows():
            formatted_races.append({
                'round': int(row.get('round', 0)),
                'Circuit': {
                    'Location': {
                        'country': row.get('country', '')
                    }
                },
                'date': str(row.get('raceDate', '')),
                'raceName': row.get('raceName', '')
            })
        
        return jsonify({
            'MRData': {
                'RaceTable': {
                    'Races': formatted_races
                }
            }
        })
            
    except Exception as e:
        print(f"Error in season schedule: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/race-results', methods=['GET'])
def get_race_results():
    try:
        year = request.args.get('year', 'current')
        round_num = request.args.get('round')
        
        if not round_num:
            return jsonify({'error': 'Round parameter is required'}), 400
        
        response = ergast.get_race_results(year, round_num)
        
        # The response.content is a list containing a pandas DataFrame
        if response.content and len(response.content) > 0:
            df = response.content[0]  # Get the first (and only) DataFrame
            
            # Format the response to match the expected structure
            formatted_results = []
            for _, row in df.iterrows():
                formatted_results.append({
                    'position': int(row.get('position', 0)),
                    'Driver': {
                        'givenName': row.get('givenName', ''),
                        'familyName': row.get('familyName', '')
                    },
                    'Constructor': {
                        'name': row.get('constructorNames', [''])[0] if row.get('constructorNames') else ''
                    },
                    'points': float(row.get('points', 0))
                })
            
            return jsonify({
                'MRData': {
                    'RaceTable': {
                        'Races': [{
                            'Results': formatted_results
                        }]
                    }
                }
            })
        else:
            return jsonify({'error': 'No data available'}), 404
            
    except Exception as e:
        print(f"Error in race results: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/qualifying-results', methods=['GET'])
def get_qualifying_results():
    try:
        year = request.args.get('year', 'current')
        round_num = request.args.get('round')
        
        if not round_num:
            return jsonify({'error': 'Round parameter is required'}), 400
        
        response = ergast.get_qualifying_results(year, round_num)
        
        # The response.content is a list containing a pandas DataFrame
        if response.content and len(response.content) > 0:
            df = response.content[0]  # Get the first (and only) DataFrame
            
            # Format the response to match the expected structure
            formatted_results = []
            for _, row in df.iterrows():
                formatted_results.append({
                    'position': int(row.get('position', 0)),
                    'Driver': {
                        'givenName': row.get('givenName', ''),
                        'familyName': row.get('familyName', '')
                    },
                    'Constructor': {
                        'name': row.get('constructorNames', [''])[0] if row.get('constructorNames') else ''
                    },
                    'Q1': str(row.get('Q1', '')),
                    'Q2': str(row.get('Q2', '')),
                    'Q3': str(row.get('Q3', ''))
                })
            
            return jsonify({
                'MRData': {
                    'RaceTable': {
                        'Races': [{
                            'QualifyingResults': formatted_results
                        }]
                    }
                }
            })
        else:
            return jsonify({'error': 'No data available'}), 404
            
    except Exception as e:
        print(f"Error in qualifying results: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    try:
        year = request.args.get('year', 'current')
        response = ergast.get_driver_info(year)
        
        # The response.content is a list containing a pandas DataFrame
        if response.content and len(response.content) > 0:
            df = response.content[0]  # Get the first (and only) DataFrame
            
            # Format the response to match the expected structure
            formatted_drivers = []
            for _, row in df.iterrows():
                formatted_drivers.append({
                    'driverId': row.get('driverId', ''),
                    'givenName': row.get('givenName', ''),
                    'familyName': row.get('familyName', ''),
                    'nationality': row.get('nationality', '')
                })
            
            return jsonify({
                'MRData': {
                    'DriverTable': {
                        'Drivers': formatted_drivers
                    }
                }
            })
        else:
            return jsonify({'error': 'No data available'}), 404
            
    except Exception as e:
        print(f"Error in drivers: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/constructors', methods=['GET'])
def get_constructors():
    try:
        year = request.args.get('year', 'current')
        response = ergast.get_constructor_info(year)
        
        # The response.content is a list containing a pandas DataFrame
        if response.content and len(response.content) > 0:
            df = response.content[0]  # Get the first (and only) DataFrame
            
            # Format the response to match the expected structure
            formatted_constructors = []
            for _, row in df.iterrows():
                formatted_constructors.append({
                    'constructorId': row.get('constructorId', ''),
                    'name': row.get('constructorName', ''),
                    'nationality': row.get('nationality', '')
                })
            
            return jsonify({
                'MRData': {
                    'ConstructorTable': {
                        'Constructors': formatted_constructors
                    }
                }
            })
        else:
            return jsonify({'error': 'No data available'}), 404
            
    except Exception as e:
        print(f"Error in constructors: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/circuits', methods=['GET'])
def get_circuits():
    try:
        year = request.args.get('year', 'current')
        response = ergast.get_circuits(year)

        # For circuits, response might be directly a DataFrame
        if hasattr(response, 'content'):
            df = response.content
        else:
            df = response
            
        # Format the response to match the expected structure
        formatted_circuits = []
        for _, row in df.iterrows():
            formatted_circuits.append({
                'circuitId': row.get('circuitId', ''),
                'name': row.get('circuitName', ''),
                'Location': {
                    'country': row.get('country', ''),
                    'locality': row.get('locality', '')
                }
            })
        
        return jsonify({
            'MRData': {
                'CircuitTable': {
                    'Circuits': formatted_circuits
                }
            }
        })

    except Exception as e:
        print(f"Error in circuits: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/rankings/drivers/elo', methods=['GET'])
def get_driver_elo_rankings():
    """Return latest driver Elo (from DB), optionally filtered by season or race."""
    try:
        year = request.args.get('season', type=int)
        round_num = request.args.get('race', type=int)
        conn = get_db_connection()

        if year and round_num:
            query = """
                SELECT
                    d.driver_id, d.first_name, d.last_name, d.code,
                    c.constructor_id, c.name as constructor_name, dr.elo
                FROM Driver_Race dr
                JOIN Driver d ON dr.driver_id = d.driver_id
                JOIN Constructor c ON dr.constructor_id = c.constructor_id
                JOIN Race r ON dr.race_id = r.race_id
                WHERE r.year = ? AND r.round = ?
                ORDER BY dr.elo DESC;
            """
            drivers = conn.execute(query, (year, round_num)).fetchall()
        elif year:
            query = """
                SELECT
                    d.driver_id, d.first_name, d.last_name, d.code,
                    c.constructor_id, c.name as constructor_name, dr.elo
                FROM
                    Driver d
                JOIN
                    (SELECT
                        dr.driver_id, dr.constructor_id, dr.elo,
                        ROW_NUMBER() OVER(PARTITION BY dr.driver_id ORDER BY r.round DESC) as rn
                     FROM Driver_Race dr
                     JOIN Race r ON dr.race_id = r.race_id
                     WHERE r.year = ?) dr ON d.driver_id = dr.driver_id
                JOIN Constructor c ON dr.constructor_id = c.constructor_id
                WHERE
                    dr.rn = 1
                ORDER BY
                    dr.elo DESC;
            """
            drivers = conn.execute(query, (year,)).fetchall()
        else:
            query = """
                SELECT
                    d.driver_id, d.first_name, d.last_name, d.code,
                    c.constructor_id, c.name as constructor_name, dr.elo
                FROM
                    Driver d
                JOIN
                    (SELECT
                        driver_id, constructor_id, elo,
                        ROW_NUMBER() OVER(PARTITION BY driver_id ORDER BY race_id DESC) as rn
                     FROM Driver_Race) dr ON d.driver_id = dr.driver_id
                JOIN Constructor c ON dr.constructor_id = c.constructor_id
                WHERE
                    dr.rn = 1
                ORDER BY
                    dr.elo DESC;
            """
            drivers = conn.execute(query).fetchall()

        conn.close()
        return jsonify(rows_to_dict_list(drivers))
    except Exception as e:
        print(f"Error in driver Elo rankings: {e}")
        return jsonify({"error": f"Database error: {e}"}), 500


@app.route('/api/rankings/combined', methods=['GET'])
def get_combined_elo_rankings():
    """Return combined driver/constructor Elo, optionally filtered by season or race."""
    try:
        year = request.args.get('season', type=int)
        round_num = request.args.get('race', type=int)
        conn = get_db_connection()

        if year and round_num:
            query = """
                SELECT
                    d.driver_id, d.first_name, d.last_name,
                    c.constructor_id, c.name as constructor_name,
                    dr.combined_elo
                FROM Driver_Race dr
                JOIN Driver d ON dr.driver_id = d.driver_id
                JOIN Constructor c ON dr.constructor_id = c.constructor_id
                JOIN Race r ON dr.race_id = r.race_id
                WHERE r.year = ? AND r.round = ?
                ORDER BY dr.combined_elo DESC;
            """
            rankings = conn.execute(query, (year, round_num)).fetchall()
        elif year:
            query = """
                SELECT
                    d.driver_id, d.first_name, d.last_name,
                    c.constructor_id, c.name as constructor_name,
                    dr.combined_elo
                FROM Driver_Race dr
                JOIN Driver d ON dr.driver_id = d.driver_id
                JOIN Constructor c ON dr.constructor_id = c.constructor_id
                JOIN Race r ON dr.race_id = r.race_id
                JOIN (
                    SELECT dr.driver_id, MAX(r.round) as max_round
                    FROM Driver_Race dr
                    JOIN Race r ON dr.race_id = r.race_id
                    WHERE r.year = ?
                    GROUP BY dr.driver_id
                ) latest ON dr.driver_id = latest.driver_id AND r.round = latest.max_round
                WHERE r.year = ?
                ORDER BY dr.combined_elo DESC;
            """
            rankings = conn.execute(query, (year, year)).fetchall()
        else:
            query = """
                SELECT
                    d.driver_id, d.first_name, d.last_name,
                    c.constructor_id, c.name as constructor_name,
                    dr.combined_elo
                FROM Driver_Race dr
                JOIN Driver d ON dr.driver_id = d.driver_id
                JOIN Constructor c ON dr.constructor_id = c.constructor_id
                JOIN (
                    SELECT driver_id, MAX(race_id) as max_race_id
                    FROM Driver_Race
                    GROUP BY driver_id
                ) latest ON dr.driver_id = latest.driver_id AND dr.race_id = latest.max_race_id
                ORDER BY dr.combined_elo DESC;
            """
            rankings = conn.execute(query).fetchall()

        conn.close()
        return jsonify(rows_to_dict_list(rankings))
    except Exception as e:
        print(f"Error in combined Elo rankings: {e}")
        return jsonify({"error": f"Database error: {e}"}), 500


@app.route('/api/rankings/drivers/elo/history/<int:driver_id>', methods=['GET'])
def get_driver_elo_history(driver_id):
    """Return full Elo history for a driver; optional season filter."""
    try:
        year_filter = request.args.get('season', type=int)
        conn = get_db_connection()
        base_query = """
            SELECT
                r.year, r.round, r.name AS race_name, r.date, dr.elo
            FROM Driver_Race dr
            JOIN Race r ON dr.race_id = r.race_id
            WHERE dr.driver_id = ?
        """
        params = [driver_id]
        if year_filter:
            base_query += " AND r.year = ?"
            params.append(year_filter)
        base_query += " ORDER BY r.year, r.round;"
        history = conn.execute(base_query, tuple(params)).fetchall()
        conn.close()
        return jsonify(rows_to_dict_list(history))
    except Exception as e:
        print(f"Error in driver Elo history: {e}")
        return jsonify({"error": f"Database error: {e}"}), 500


@app.route('/api/rankings/constructors/elo/history/<int:constructor_id>', methods=['GET'])
def get_constructor_elo_history(constructor_id):
    """Return full Elo history for a constructor; optional season filter."""
    try:
        year_filter = request.args.get('season', type=int)
        conn = get_db_connection()
        base_query = """
            SELECT
                r.year, r.round, r.name AS race_name, r.date, cr.elo
            FROM Constructor_Race cr
            JOIN Race r ON cr.race_id = r.race_id
            WHERE cr.constructor_id = ?
        """
        params = [constructor_id]
        if year_filter:
            base_query += " AND r.year = ?"
            params.append(year_filter)
        base_query += " ORDER BY r.year, r.round;"
        history = conn.execute(base_query, tuple(params)).fetchall()
        conn.close()
        return jsonify(rows_to_dict_list(history))
    except Exception as e:
        print(f"Error in constructor Elo history: {e}")
        return jsonify({"error": f"Database error: {e}"}), 500


@app.route('/api/drivers/compare/<int:driver1_id>/<int:driver2_id>', methods=['GET'])
def compare_drivers(driver1_id, driver2_id):
    """Fetch latest stats for two drivers (DB-based)."""
    try:
        conn = get_db_connection()
        query = """
            SELECT
                d.first_name,
                d.last_name,
                d.country,
                dr.elo,
                dr.combined_elo,
                dr.position,
                dr.points,
                r.year,
                r.round,
                r.name as race_name
            FROM Driver d
            JOIN Driver_Race dr ON d.driver_id = dr.driver_id
            JOIN Race r ON dr.race_id = r.race_id
            WHERE d.driver_id = ?
            ORDER BY r.year DESC, r.round DESC
            LIMIT 1;
        """
        driver1_data = conn.execute(query, (driver1_id,)).fetchone()
        driver2_data = conn.execute(query, (driver2_id,)).fetchone()
        conn.close()

        if not driver1_data or not driver2_data:
            return jsonify({"error": "One or both drivers not found"}), 404

        return jsonify({
            "driver1": dict(driver1_data),
            "driver2": dict(driver2_data)
        })
    except Exception as e:
        print(f"Error comparing drivers: {e}")
        return jsonify({"error": f"Database error: {e}"}), 500


@app.route('/api/constructors/compare/<int:constructor1_id>/<int:constructor2_id>', methods=['GET'])
def compare_constructors(constructor1_id, constructor2_id):
    """Fetch latest stats for two constructors (DB-based)."""
    try:
        conn = get_db_connection()
        query = """
            SELECT
                c.name,
                cr.elo,
                r.year,
                r.round,
                r.name as race_name
            FROM Constructor c
            JOIN Constructor_Race cr ON c.constructor_id = cr.constructor_id
            JOIN Race r ON cr.race_id = r.race_id
            WHERE c.constructor_id = ?
            ORDER BY r.year DESC, r.round DESC
            LIMIT 1;
        """
        constructor1_data = conn.execute(query, (constructor1_id,)).fetchone()
        constructor2_data = conn.execute(query, (constructor2_id,)).fetchone()
        conn.close()

        if not constructor1_data or not constructor2_data:
            return jsonify({"error": "One or both constructors not found"}), 404

        return jsonify({
            "constructor1": dict(constructor1_data),
            "constructor2": dict(constructor2_data)
        })
    except Exception as e:
        print(f"Error comparing constructors: {e}")
        return jsonify({"error": f"Database error: {e}"}), 500


@app.route("/api/available_races/<int:year>", methods=["GET"])
def get_available_races(year):
    """Return race names for the given year that have qualifying data in the database."""
    try:
        conn = get_db_connection()
        query = """
            SELECT DISTINCT r.name AS race_name
            FROM Race r
            JOIN Driver_Race dr ON r.race_id = dr.race_id
            WHERE r.year = ?
              AND dr.qualifying_position IS NOT NULL
            ORDER BY r.round ASC;
        """
        df = pd.read_sql_query(query, conn, params=(year,))
        conn.close()

        races = df["race_name"].tolist()
        return jsonify(races)
    except Exception as e:
        print(f"Error loading available races: {e}")
        return jsonify({"error": f"Failed to load available races: {e}"}), 500


@app.route("/api/race_predict", methods=["GET"])
def race_predict_from_db():
    """Generate race predictions using qualifying + tyre degradation data stored in SQLite."""
    try:
        year = int(request.args.get("year", 2025))
        gp_name = request.args.get("gp_name")
        if not gp_name:
            return jsonify({"error": "Missing gp_name parameter"}), 400

        def normalize_gp_name(name: str):
            mapping = {
                "Australia": "Australian Grand Prix",
                "China": "Chinese Grand Prix",
                "Japan": "Japanese Grand Prix",
                "Bahrain": "Bahrain Grand Prix",
                "Saudi Arabia": "Saudi Arabian Grand Prix",
                "Emilia Romagna": "Emilia Romagna Grand Prix",
                "Monaco": "Monaco Grand Prix",
                "Spain": "Spanish Grand Prix",
                "Canada": "Canadian Grand Prix",
                "Austria": "Austrian Grand Prix",
                "Great Britain": "British Grand Prix",
                "Belgium": "Belgian Grand Prix",
                "Hungary": "Hungarian Grand Prix",
                "Netherlands": "Dutch Grand Prix",
                "Italy": "Italian Grand Prix",
                "Azerbaijan": "Azerbaijan Grand Prix",
                "Singapore": "Singapore Grand Prix",
                "United States": "United States Grand Prix",
                "Mexico": "Mexico City Grand Prix",
                "Brazil": "Sao Paulo Grand Prix",
                "Qatar": "Qatar Grand Prix",
                "Abu Dhabi": "Abu Dhabi Grand Prix",
                "Las Vegas": "Las Vegas Grand Prix",
            }
            base = mapping.get(name.strip(), name)
            variants = [base]
            # Add accented variant for Sao/São Paulo
            if "Sao Paulo" in base:
                variants.append(base.replace("Sao", "São"))
            return variants

        name_variants = normalize_gp_name(gp_name)

        query = """
            SELECT
                d.code AS DriverCode,
                d.first_name,
                d.last_name,
                c.name AS ConstructorName,
                dr.Q1, dr.Q2, dr.Q3,
                dr.qualifying_position,
                dr.avg_tire_deg_per_lap
            FROM Driver_Race dr
            JOIN Driver d ON dr.driver_id = d.driver_id
            JOIN Constructor c ON dr.constructor_id = c.constructor_id
            JOIN Race r ON dr.race_id = r.race_id
            WHERE r.year = ? AND LOWER(r.name) LIKE LOWER(?)
            ORDER BY dr.qualifying_position
        """

        df = pd.DataFrame()
        conn = get_db_connection()
        for variant in name_variants:
            df = pd.read_sql_query(query, conn, params=(year, f"%{variant}%"))
            if not df.empty:
                normalized_name = variant
                break
        conn.close()

        if df.empty:
            return jsonify({"detail": f"No qualifying data found for '{gp_name}' ({'/'.join(name_variants)}) {year}"}), 404

        df["Driver"] = df.apply(lambda r: f"{r['first_name']} {r['last_name']}".strip(), axis=1)

        def best_time(row):
            for q in ["Q3", "Q2", "Q1"]:
                val = row.get(q)
                if val and val != "None":
                    try:
                        return pd.to_timedelta(val).total_seconds()
                    except Exception:
                        continue
            return None

        df["QualifyingTime (s)"] = df.apply(best_time, axis=1)
        df = df.dropna(subset=["QualifyingTime (s)"])

        df["HasDegData"] = df["avg_tire_deg_per_lap"].notna()
        median_deg = df["avg_tire_deg_per_lap"].median(skipna=True)
        df["RelativeDeg"] = df["avg_tire_deg_per_lap"] - median_deg

        def adjust(row):
            if not row["HasDegData"]:
                return 0
            if row["RelativeDeg"] < 0:
                return -1  # better tyre management
            elif row["RelativeDeg"] > 0:
                return 1   # worse tyre management
            return 0

        df["PositionAdjustment"] = df.apply(adjust, axis=1)
        df["PredictedRacePosition"] = (
            df["qualifying_position"] + df["PositionAdjustment"]
        ).clip(1, len(df))
        df = df.sort_values("PredictedRacePosition").reset_index(drop=True)
        df["PredictedRacePosition"] = df.index + 1
        df["PredictionMethod"] = df.apply(
            lambda r: "qualifying_and_tire_deg" if r["HasDegData"] else "qualifying_only",
            axis=1,
        )

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        for _, row in df.iterrows():
            cur.execute("""
                INSERT INTO Race_Predictions (
                    year, gp_name, driver_code, driver_name,
                    qualifying_time, qualifying_position,
                    predicted_race_position, tire_deg_rate, prediction_method
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                year, gp_name, row["DriverCode"], row["Driver"],
                row["QualifyingTime (s)"], row["qualifying_position"],
                row["PredictedRacePosition"], row["avg_tire_deg_per_lap"],
                row["PredictionMethod"]
            ))
        conn.commit()
        conn.close()

        import math
        predictions = []
        for i, row in df.iterrows():
            tire_deg = row["avg_tire_deg_per_lap"]
            if isinstance(tire_deg, float) and (math.isnan(tire_deg) or math.isinf(tire_deg)):
                tire_deg = None
            predictions.append({
                "position": int(i + 1),
                "driver": row["Driver"],
                "driver_code": row["DriverCode"],
                "constructor_name": row["ConstructorName"],
                "qualifying_time": round(row["QualifyingTime (s)"], 3),
                "qualifying_position": int(row["qualifying_position"]),
                "predicted_race_position": int(row["PredictedRacePosition"]),
                "tire_deg_rate": round(tire_deg, 4) if tire_deg is not None else None,
                "prediction_method": row["PredictionMethod"],
            })

        return jsonify({
            "year": year,
            "gp_name": normalized_name,
            "predictions": predictions
        })

    except Exception as e:
        print(f"Prediction generation failed: {e}")
        return jsonify({"error": f"Prediction generation failed: {e}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
     app.run(debug=True, host='0.0.0.0', port=5000)
