import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS
import os


app = Flask(__name__)
# Enable CORS to allow your React app to make requests to this backend
CORS(app) 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Join that path with the relative path to the database

DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'f1_data.db')

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DATABASE_PATH)
    # This makes the database return rows as dictionary-like objects
    conn.row_factory = sqlite3.Row 
    return conn

# --- API Endpoint to Get All Drivers ---
@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    """Fetches all drivers from the Driver table and returns them as JSON."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Execute a query to select all drivers
        cursor.execute("SELECT * FROM Driver")
        drivers = cursor.fetchall()
        conn.close()
        
        # Convert the database rows to a list of dictionaries
        # This makes it easy to convert to JSON
        drivers_list = [dict(row) for row in drivers]
        
        return jsonify(drivers_list)
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve data from the database"}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    

@app.route('/api/driver_race/<int:year>', methods=['GET'])
def get_driver_race(year):
    """Fetches all driver race from the Driver table and returns them as JSON."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * From Driver_Race INNER JOIN Race ON Driver_Race.race_id = Race.race_id WHERE year = ?;"
        cursor.execute(query, (year,))

        drivers = cursor.fetchall()
        conn.close()
        
        # Convert the database rows to a list of dictionaries
        # This makes it easy to convert to JSON
        drivers_list = [dict(row) for row in drivers]
        
        return jsonify(drivers_list)
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve data from the database"}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    



@app.route('/api/constructor_race/<int:year>', methods=['GET'])
def get_constructor_race(year):
    """Fetches all driver race from the Driver table and returns them as JSON."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * From Constructor_Race INNER JOIN Race ON Constructor_Race.race_id = Race.race_id WHERE year = ?;"
        cursor.execute(query, (year,))
        
        drivers = cursor.fetchall()
        conn.close()
        
        # Convert the database rows to a list of dictionaries
        # This makes it easy to convert to JSON
        drivers_list = [dict(row) for row in drivers]
        
        return jsonify(drivers_list)
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve data from the database"}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    

from flask import Flask, jsonify, request
import sqlite3

# Assume app is defined, e.g., app = Flask(__name__)
# Assume get_db_connection is defined to connect to your DB

# --- Helper function to convert cursor results to list of dicts ---
def rows_to_dict_list(cursor_rows):
    """Converts a list of sqlite3.Row objects to a list of dictionaries."""
    return [dict(row) for row in cursor_rows]

# ========================================
# Comparison Endpoints
# ========================================

@app.route('/api/drivers/compare/<int:driver1_id>/<int:driver2_id>', methods=['GET'])
def compare_drivers(driver1_id, driver2_id):
    """Fetches career stats and latest Elo for two drivers to compare them."""
    try:
        conn = get_db_connection()
        
        # Fetch basic info and latest race stats for each driver
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

        response = {
            "driver1": dict(driver1_data),
            "driver2": dict(driver2_data)
        }
        
        return jsonify(response)
        
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

@app.route('/api/constructors/compare/<int:constructor1_id>/<int:constructor2_id>', methods=['GET'])
def compare_constructors(constructor1_id, constructor2_id):
    """Fetches latest Elo for two constructors to compare them."""
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

        response = {
            "constructor1": dict(constructor1_data),
            "constructor2": dict(constructor2_data)
        }
        
        return jsonify(response)

    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


# ========================================
# Ranking & History Endpoints
# ========================================

@app.route('/api/rankings/drivers/elo', methods=['GET'])
def get_driver_elo_rankings():
    """Returns the latest Elo score for every driver, ranked highest to lowest."""
    try:
        conn = get_db_connection()
        query = """
            SELECT
                d.driver_id, d.first_name, d.last_name, d.code, dr.elo
            FROM
                Driver d
            JOIN
                (SELECT
                    driver_id, elo,
                    ROW_NUMBER() OVER(PARTITION BY driver_id ORDER BY race_id DESC) as rn
                 FROM Driver_Race) dr ON d.driver_id = dr.driver_id
            WHERE
                dr.rn = 1
            ORDER BY
                dr.elo DESC;
        """
        drivers = conn.execute(query).fetchall()
        conn.close()
        
        return jsonify(rows_to_dict_list(drivers))

    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500
        
@app.route('/api/rankings/drivers/elo/history/<int:driver_id>', methods=['GET'])
def get_driver_elo_history(driver_id):
    """
    Returns the full Elo history for a specific driver.
    Can be filtered by season using a query parameter, e.g., ?season=2023
    """
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

    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


@app.route('/api/rankings/combined', methods=['GET'])
def get_combined_elo_rankings():
    """Returns the latest combined driver-constructor Elo scores, ranked."""
    try:
        conn = get_db_connection()
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

    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


# ========================================
# Specific Race Elo Endpoints
# ========================================
# Note: These are functionally duplicates of the ones below, just with a different URL schema.

@app.route('/api/rankings/drivers/elo', methods=['GET'])
def get_driver_elo_by_race_query():
    """
    Returns driver Elo for a specific race via query params.
    e.g., /api/rankings/drivers/elo?season=2023&race=5
    """
    year = request.args.get('season', type=int)
    round_num = request.args.get('race', type=int)
    
    if not year or not round_num:
        # This will fall through to the get_driver_elo_rankings function if no params are provided.
        # If you want a specific error, you can add it here.
        return get_driver_elo_rankings()

    return get_elo_for_drivers_in_race(year, round_num)

@app.route('/api/rankings/constructors/elo', methods=['GET'])
def get_constructor_elo_by_race_query():
    """
    Returns constructor Elo for a specific race via query params.
    e.g., /api/rankings/constructors/elo?season=2023&race=5
    """
    year = request.args.get('season', type=int)
    round_num = request.args.get('race', type=int)
    
    if not year or not round_num:
        return jsonify({"error": "Both 'season' and 'race' query parameters are required."}), 400
        
    return get_elo_for_constructors_in_race(year, round_num)

# ========================================
# Path-based Elo Endpoints
# ========================================

@app.route('/api/elo/drivers/<int:year>/<int:round_num>', methods=['GET'])
def get_elo_for_drivers_in_race(year, round_num):
    """Returns the Elo for all drivers in a specific race."""
    try:
        conn = get_db_connection()
        query = """
            SELECT
                d.driver_id, d.first_name, d.last_name, d.code, dr.elo
            FROM Driver_Race dr
            JOIN Driver d ON dr.driver_id = d.driver_id
            JOIN Race r ON dr.race_id = r.race_id
            WHERE r.year = ? AND r.round = ?
            ORDER BY dr.elo DESC;
        """
        drivers = conn.execute(query, (year, round_num)).fetchall()
        conn.close()
        
        return jsonify(rows_to_dict_list(drivers))

    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

@app.route('/api/elo/constructors/<int:year>/<int:round_num>', methods=['GET'])
def get_elo_for_constructors_in_race(year, round_num):
    """Returns the Elo for all constructors in a specific race."""
    try:
        conn = get_db_connection()
        query = """
            SELECT
                c.constructor_id, c.name, cr.elo
            FROM Constructor_Race cr
            JOIN Constructor c ON cr.constructor_id = c.constructor_id
            JOIN Race r ON cr.race_id = r.race_id
            WHERE r.year = ? AND r.round = ?
            ORDER BY cr.elo DESC;
        """
        constructors = conn.execute(query, (year, round_num)).fetchall()
        conn.close()
        
        return jsonify(rows_to_dict_list(constructors))

    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

@app.route('/api/elo/combined/<int:year>/<int:round_num>', methods=['GET'])
def get_combined_elo_for_race(year, round_num):
    """Returns the combined driver-constructor Elo for a specific race."""
    try:
        conn = get_db_connection()
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
        results = conn.execute(query, (year, round_num)).fetchall()
        conn.close()
        
        return jsonify(rows_to_dict_list(results))

    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


# --- Run the Flask App ---
if __name__ == '__main__':
    # The host='0.0.0.0' makes the server accessible on your local network
    # The port can be any available port, 5000 is common for Flask
    app.run(host='0.0.0.0', port=5000, debug=True)
