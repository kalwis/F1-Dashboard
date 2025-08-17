from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
import fastf1.ergast
import os
import json
from datetime import datetime

# Enable cache
os.makedirs("f1_cache", exist_ok=True)
fastf1.Cache.enable_cache("f1_cache")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Ergast API
ergast = fastf1.ergast.Ergast()

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

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000)


