import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/layout/DashboardCard';
import GPSSelector from '../components/shared/GPSSelector';
import apiService from '../services/api';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRace, setSelectedRace] = useState('');
  const [availableRaces, setAvailableRaces] = useState([]);
  const [checkingRaces, setCheckingRaces] = useState(true);
  const [raceCalendar, setRaceCalendar] = useState([]);

  const getAvailableRaces = (calendar) => {
    const available = [];
    
    // Return all races that have qualifying data available
    for (const race of calendar) {
      available.push(race.name); // Use the mapped prediction name, not the full race name
    }
    
    return available;
  };

  const fetchRaceCalendar = async () => {
    const response = await apiService.getSeasonSchedule(2025);
    const races = response.MRData?.RaceTable?.Races || [];
    
    // Map API response to our format and convert race names to match prediction API
    const calendar = races.map(race => {
      const raceName = race.raceName;
      // Convert full race names to the format expected by prediction API
      let predictionName = raceName;
      if (raceName.includes('Australian')) predictionName = 'Australia';
      else if (raceName.includes('Chinese')) predictionName = 'China';
      else if (raceName.includes('Japanese')) predictionName = 'Japan';
      else if (raceName.includes('Bahrain')) predictionName = 'Bahrain';
      else if (raceName.includes('Saudi Arabian')) predictionName = 'Saudi Arabia';
      else if (raceName.includes('Miami')) predictionName = 'Miami';
      else if (raceName.includes('Emilia Romagna')) predictionName = 'Emilia Romagna';
      else if (raceName.includes('Monaco')) predictionName = 'Monaco';
      else if (raceName.includes('Spanish')) predictionName = 'Spain';
      else if (raceName.includes('Canadian')) predictionName = 'Canada';
      else if (raceName.includes('Austrian')) predictionName = 'Austria';
      else if (raceName.includes('British')) predictionName = 'Great Britain';
      else if (raceName.includes('Belgian')) predictionName = 'Belgium';
      else if (raceName.includes('Hungarian')) predictionName = 'Hungary';
      else if (raceName.includes('Dutch')) predictionName = 'Netherlands';
      else if (raceName.includes('Italian')) predictionName = 'Italy';
      else if (raceName.includes('Azerbaijan')) predictionName = 'Azerbaijan';
      else if (raceName.includes('Singapore')) predictionName = 'Singapore';
      else if (raceName.includes('United States')) predictionName = 'United States';
      else if (raceName.includes('Mexico City')) predictionName = 'Mexico';
      else if (raceName.includes('São Paulo')) predictionName = 'Brazil';
      else if (raceName.includes('Las Vegas')) predictionName = 'United States';
      else if (raceName.includes('Qatar')) predictionName = 'Qatar';
      else if (raceName.includes('Abu Dhabi')) predictionName = 'Abu Dhabi';
      
      return {
        name: predictionName,
        date: race.date.split(' ')[0], // Extract just the date part
        raceName: raceName
      };
    });
    
    setRaceCalendar(calendar);
    return calendar;
  };

  const fetchPredictions = async () => {
    if (!selectedRace) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the race prediction API - always 2025
      const data = await apiService.getRacePrediction(2025, selectedRace);
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to load race predictions. Please check if the prediction API server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRaceCalendar = async () => {
      const calendar = await fetchRaceCalendar();
      const available = getAvailableRaces(calendar);
      setAvailableRaces(available);
      setCheckingRaces(false);
      
      // Set the latest (last) available race as default
      if (available.length > 0) {
        setSelectedRace(available[available.length - 1]);
      }
    };
    
    loadRaceCalendar();
  }, []);

  useEffect(() => {
    if (availableRaces.length > 0) {
      fetchPredictions();
    }
  }, [selectedRace, availableRaces]);

  if (checkingRaces) {
    return (
      <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
          Race Predictions
        </h1>
        <div className="text-center text-white/60">Loading...</div>
      </div>
    );
  }

  if (availableRaces.length === 0) {
    return (
      <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
          Race Predictions
        </h1>
        <div className="text-center text-white/60">
          <div className="mb-4">No 2025 races have occurred yet.</div>
          <div className="text-sm">Race predictions will be available once qualifying sessions have taken place.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
          Race Predictions
        </h1>
        <div className="text-center text-white/60">Loading race predictions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
          Race Predictions
        </h1>
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
        Race Predictions
      </h1>

      {/* GP Selection */}
      <GPSSelector
        selectedGP={selectedRace}
        setSelectedGP={setSelectedRace}
        availableGPs={availableRaces}
        loading={loading}
      />

      {predictions && (
        <>
          {/* Race Predictions */}
          <DashboardCard title={`2025 ${selectedRace} GP - Race Predictions`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-white/80">
                    <th className="pb-2">Position</th>
                    <th className="pb-2">Driver</th>
                    <th className="pb-2">Team</th>
                    <th className="pb-2">Tire Management</th>
                    <th className="pb-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.predictions.map((prediction) => (
                    <tr key={prediction.position} className="border-t border-white/10">
                      <td className="py-2 pr-4 text-white font-bold text-lg">{prediction.predicted_race_position}</td>
                      <td className="py-2 pr-4 text-white font-medium">{prediction.driver}</td>
                      <td className="py-2 pr-4 text-white/80">{prediction.driver_code}</td>
                      <td className="py-2 pr-4 text-white/80">
                        {prediction.tire_deg_rate ? (
                          <span className={`px-2 py-1 rounded text-xs ${
                            prediction.tire_deg_rate < 0 ? 'bg-green-500/20 text-green-400' :
                            prediction.tire_deg_rate < 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {prediction.tire_deg_rate < 0 ? 'Excellent' :
                             prediction.tire_deg_rate < 1 ? 'Good' : 'Poor'}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="py-2 text-white/60 text-xs">
                        {prediction.prediction_method === 'qualifying_and_tire_deg' ? 'High' : 'Medium'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-white/60 mt-2">
              Race predictions based on qualifying position and tire degradation analysis. 
              Priority: Sprint Race &gt; FP2 &gt; FP3. Lower tire degradation values indicate better race pace.
            </p>
          </DashboardCard>

          {/* Methodology Info */}
          <div className="text-sm text-white/60 mt-6 p-4 bg-black/10 rounded-lg border border-white/10">
            <div className="space-y-2">
              <div className="font-semibold text-white">Prediction Methodology:</div>
              <div>• Uses qualifying results as baseline starting positions</div>
              <div>• Analyzes tire degradation from practice sessions or sprint races</div>
              <div>• Adjusts positions based on race pace and tire management</div>
              <div>• Maximum position change: ±3 positions from qualifying</div>
              <div>• Data source: FastF1 library with official F1 timing data</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
