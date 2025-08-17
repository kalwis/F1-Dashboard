from flask import Flask, request, jsonify
import round_elo as elo
import pandas as pd

app = Flask(__name__)

@app.route('/elo', methods=['GET'])
def getElo():
    year = request.args.get('year', type=int)
    type = request.args.get('type', type=int)
    a = elo.get_season_elos(year)
    jsonVersion = (a[type].to_dict(orient='records'))
    return jsonVersion

if __name__ == "__main__":
    app.run(debug=True)