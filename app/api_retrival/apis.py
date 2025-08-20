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
def get_driver_race(year):
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

# --- Run the Flask App ---
if __name__ == '__main__':
    # The host='0.0.0.0' makes the server accessible on your local network
    # The port can be any available port, 5000 is common for Flask
    app.run(host='0.0.0.0', port=5000, debug=True)
