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

  // 2025 F1 calendar with race dates
  const raceCalendar = [
    { name: 'Bahrain', date: '2025-03-02' },
    { name: 'Saudi Arabia', date: '2025-03-09' },
    { name: 'Australia', date: '2025-03-23' },
    { name: 'Japan', date: '2025-04-06' },
    { name: 'China', date: '2025-04-20' },
    { name: 'Miami', date: '2025-05-04' },
    { name: 'Emilia Romagna', date: '2025-05-18' },
    { name: 'Monaco', date: '2025-05-25' },
    { name: 'Canada', date: '2025-06-08' },
    { name: 'Spain', date: '2025-06-22' },
    { name: 'Austria', date: '2025-06-29' },
    { name: 'Great Britain', date: '2025-07-06' },
    { name: 'Hungary', date: '2025-07-27' },
    { name: 'Belgium', date: '2025-08-03' },
    { name: 'Netherlands', date: '2025-08-24' },
    { name: 'Italy', date: '2025-08-31' },
    { name: 'Azerbaijan', date: '2025-09-14' },
    { name: 'Singapore', date: '2025-09-21' },
    { name: 'United States', date: '2025-10-19' },
    { name: 'Mexico', date: '2025-10-26' },
    { name: 'Brazil', date: '2025-11-02' },
    { name: 'Qatar', date: '2025-11-23' },
    { name: 'Abu Dhabi', date: '2025-12-07' }
  ];

  const getAvailableRaces = () => {
    const today = new Date();
    const available = [];
    
    // Check races in chronological order
    for (const race of raceCalendar) {
      const raceDate = new Date(race.date);
      // Consider race available if it's within 2 weeks of today (allowing for qualifying data)
      const twoWeeksAgo = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000));
      
      if (raceDate <= twoWeeksAgo) {
        available.push(race.name);
      }
    }
    
    return available;
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
    const available = getAvailableRaces();
    setAvailableRaces(available);
    setCheckingRaces(false);
    
    // Set the latest (last) available race as default
    if (available.length > 0) {
      setSelectedRace(available[available.length - 1]);
    }
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
