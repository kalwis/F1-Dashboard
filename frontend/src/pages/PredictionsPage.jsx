import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/layout/DashboardCard';
import GPSSelector from '../components/shared/GPSSelector';
import SyncStatus from '../components/layout/SyncStatus';
import apiService from '../services/api';

export default function PredictionsPage() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRace, setSelectedRace] = useState('');
  const [availableRaces, setAvailableRaces] = useState([]);
  const [checkingRaces, setCheckingRaces] = useState(true);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Team mapping for 2025 F1 grid
  const teamMapping = {
    'VER': 'Red Bull Racing',
    'LEC': 'Ferrari',
    'SAI': 'Ferrari',
    'HAM': 'Mercedes',
    'RUS': 'Mercedes',
    'NOR': 'McLaren',
    'PIA': 'McLaren',
    'ALO': 'Aston Martin',
    'STR': 'Aston Martin',
    'OCO': 'Alpine',
    'GAS': 'Alpine',
    'TSU': 'RB',
    'ALB': 'Williams',
    'HUL': 'Sauber',
    'ANT': 'Mercedes',
    'BEA': 'Ferrari',
    'COL': 'Williams',
    'BOR': 'RB',
    'HAD': 'Alpine',
    'LAW': 'Red Bull Racing'
  };

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
      else if (raceName.includes('United States') && !raceName.includes('Miami')) predictionName = 'United States';
      else if (raceName.includes('Mexico City')) predictionName = 'Mexico';
      else if (raceName.includes('São Paulo')) predictionName = 'Brazil';
      else if (raceName.includes('Las Vegas')) predictionName = 'United States'; // Las Vegas maps to United States in prediction API
      else if (raceName.includes('Qatar')) predictionName = 'Qatar';
      else if (raceName.includes('Abu Dhabi')) predictionName = 'Abu Dhabi';
      
      return {
        name: predictionName,
        date: race.date.split(' ')[0], // Extract just the date part
        raceName: raceName
      };
    });
    
    return calendar;
  };

  const fetchPredictions = async () => {
    if (!selectedRace) {
      console.log('No race selected, skipping prediction fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching predictions for:', selectedRace);
      // Use the race prediction API - always 2025
      const data = await apiService.getRacePrediction(2025, selectedRace);
      console.log('Predictions received:', data);
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      
      // Extract the actual error message from the API response
      let errorMessage = 'Failed to load race predictions. Please check if the prediction API server is running on port 8000.';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data) {
        // If the response data is already an object with detail
        errorMessage = err.response.data.detail || JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRaceCalendar = async () => {
      try {
        const calendar = await fetchRaceCalendar();
        console.log('Race calendar loaded:', calendar);
        const available = getAvailableRaces(calendar);
        console.log('Available races:', available);
        setAvailableRaces(available);
        setCheckingRaces(false);
        
        // Set the first available race as default (most recent with data)
        if (available.length > 0) {
          console.log('Setting default race to:', available[0]);
          setSelectedRace(available[0]);
        }
      } catch (err) {
        console.error('Error loading race calendar:', err);
        setCheckingRaces(false);
      }
    };
    
    loadRaceCalendar();
  }, []);

  useEffect(() => {
    if (availableRaces.length > 0 && selectedRace) {
      fetchPredictions();
    }
  }, [selectedRace, availableRaces]);

  if (checkingRaces) {
    return (
      <div className="pt-20 p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Race Predictions
          </h1>
          <p className="text-lg text-white/70 max-w-4xl mx-auto whitespace-nowrap">
            Machine learning race predictions based on qualifying results and tire degradation analysis
          </p>
        </div>
        <div className="text-center text-white/60">Loading...</div>
      </div>
    );
  }

  if (availableRaces.length === 0) {
    return (
      <div className="pt-20 p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Race Predictions
          </h1>
          <p className="text-lg text-white/70 max-w-4xl mx-auto whitespace-nowrap">
            Machine learning race predictions based on qualifying results and tire degradation analysis
          </p>
        </div>
        <div className="text-center text-white/60">
          <div className="mb-4 text-xl">No 2025 races have occurred yet.</div>
          <div className="text-sm">Race predictions will be available once qualifying sessions have taken place.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Race Predictions
          </h1>
          <p className="text-lg text-white/70 max-w-4xl mx-auto whitespace-nowrap">
            Machine learning race predictions based on qualifying results and tire degradation analysis
          </p>
        </div>
        <div className="text-center text-white/60">Loading race predictions...</div>
      </div>
    );
  }

  const ErrorPopup = () => {
    if (!showErrorPopup) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border border-gray-600">
          <div className="text-center">
            <div className="text-red-400 text-lg font-semibold mb-4">
              Prediction API Error
            </div>
            <div className="text-gray-300 mb-6">
              {error}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowErrorPopup(false);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ErrorPopup />
      <div className="pt-20 p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            Race Predictions
          </h1>
          <p className="text-lg text-white/70 max-w-4xl mx-auto whitespace-nowrap">
            Machine learning race predictions based on qualifying results and tire degradation analysis
          </p>
        </div>

        {/* GP Selection Section */}
        <div className="mb-8">
          <GPSSelector
            selectedGP={selectedRace}
            setSelectedGP={setSelectedRace}
            availableGPs={availableRaces}
            loading={loading}
          />
        </div>

        {!selectedRace && (
          <div className="text-center text-white/60 mt-8 p-8 bg-gradient-to-r from-black/20 to-black/10 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-xl mb-3 font-medium">Select a race above to view predictions</div>
            <div className="text-sm">Choose from the available 2025 races to see tire degradation analysis and race position predictions</div>
          </div>
        )}

      {predictions && (
        <div className="space-y-8">
          {/* Race Predictions */}
          <DashboardCard title={`🏁 2025 ${selectedRace} GP - Race Predictions`}>
            <div className="overflow-x-auto max-h-[32rem] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-white/80 border-b border-white/10">
                    <th className="pb-3 font-semibold">Predicted</th>
                    <th className="pb-3 font-semibold">Driver</th>
                    <th className="pb-3 font-semibold">Team</th>
                    <th className="pb-3 font-semibold">Qualifying</th>
                    <th className="pb-3 font-semibold">Q Time</th>
                    <th className="pb-3 font-semibold">Tire Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.predictions.slice(0, 20).map((prediction) => {
                    const positionChange = prediction.predicted_race_position - prediction.qualifying_position;
                    const teamName = teamMapping[prediction.driver_code] || 'Unknown';
                    
                    return (
                      <tr key={prediction.position} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-lg">{prediction.predicted_race_position}</span>
                            {positionChange !== 0 && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                positionChange < 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {positionChange < 0 ? `+${Math.abs(positionChange)}` : `-${positionChange}`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-white font-medium">{prediction.driver}</td>
                        <td className="py-3 pr-4 text-white/80 text-sm">{teamName}</td>
                        <td className="py-3 pr-4 text-white/80 font-medium">P{prediction.qualifying_position}</td>
                        <td className="py-3 pr-4 text-white/80 text-sm">
                          {prediction.qualifying_time ? `${prediction.qualifying_time.toFixed(3)}s` : 'N/A'}
                        </td>
                        <td className="py-3 text-white/80">
                          {prediction.tire_deg_rate !== null && prediction.tire_deg_rate !== undefined ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  prediction.tire_deg_rate < 0 ? 'bg-green-500/20 text-green-400' :
                                  prediction.tire_deg_rate < 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {prediction.tire_deg_rate < 0 ? 'Excellent Tire Life' :
                                   prediction.tire_deg_rate < 0.5 ? 'Good Tire Life' : 'Poor Tire Life'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  prediction.prediction_method === 'qualifying_and_tire_deg' ? 
                                  'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                  {prediction.prediction_method === 'qualifying_and_tire_deg' ? 'High Confidence' : 'Medium Confidence'}
                                </span>
                              </div>
                              <div className="text-xs text-white/60">
                                Tire degradation: {prediction.tire_deg_rate.toFixed(3)}s/lap
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                                Qualifying Only
                              </span>
                              <span className="text-xs text-white/40">
                                No tire data available
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {predictions.predictions.length > 20 && (
              <div className="text-center text-white/60 mt-3 p-2 bg-black/10 rounded-lg border border-white/10">
                Showing top 20 predictions. Total drivers: {predictions.predictions.length}
              </div>
            )}
            <p className="text-xs text-white/60 mt-2">
              Race predictions based on qualifying position and tire degradation analysis. 
              Priority: Sprint Race &gt; FP2 &gt; FP3. Lower tire degradation values indicate better race pace.
              Position changes show movement from qualifying to predicted race finish.
            </p>
          </DashboardCard>

          {/* Prediction Summary */}
          <DashboardCard title="📊 Prediction Summary">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-xl border border-blue-500/20">
                <div className="text-blue-300 text-sm font-medium mb-2">Total Drivers</div>
                <div className="text-white text-3xl font-bold">{predictions.predictions.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-xl border border-green-500/20">
                <div className="text-green-300 text-sm font-medium mb-2">With Tire Analysis</div>
                <div className="text-white text-3xl font-bold">
                  {predictions.predictions.filter(p => p.tire_deg_rate !== null && p.tire_deg_rate !== undefined).length}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-6 rounded-xl border border-orange-500/20">
                <div className="text-orange-300 text-sm font-medium mb-2">Qualifying Only</div>
                <div className="text-white text-3xl font-bold">
                  {predictions.predictions.filter(p => p.tire_deg_rate === null || p.tire_deg_rate === undefined).length}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-xl border border-purple-500/20">
                <div className="text-purple-300 text-sm font-medium mb-2">Avg Position Change</div>
                <div className="text-white text-3xl font-bold">
                  {(() => {
                    const changes = predictions.predictions.map(p => p.predicted_race_position - p.qualifying_position);
                    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
                    return avgChange > 0 ? `+${avgChange.toFixed(1)}` : avgChange.toFixed(1);
                  })()}
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-black/20 to-black/10 rounded-xl border border-white/10">
              <div className="font-semibold text-white mb-3">Position Changes:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const changes = predictions.predictions.map(p => p.predicted_race_position - p.qualifying_position);
                  const gained = changes.filter(c => c < 0).length;
                  const lost = changes.filter(c => c > 0).length;
                  const same = changes.filter(c => c === 0).length;
                  
                  return (
                    <>
                      <div className="text-center">
                        <div className="text-green-400 text-lg font-bold">↑ {gained}</div>
                        <div className="text-green-300 text-xs">gained</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 text-lg font-bold">↓ {lost}</div>
                        <div className="text-red-300 text-xs">lost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white/60 text-lg font-bold">= {same}</div>
                        <div className="text-white/40 text-xs">same</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white/60 text-lg font-bold">±3</div>
                        <div className="text-white/40 text-xs">max change</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </DashboardCard>

          {/* Methodology Info */}
          <div className="text-sm text-white/60 p-6 bg-gradient-to-r from-black/20 to-black/10 rounded-xl border border-white/10">
            <div className="space-y-3">
              <div className="font-semibold text-white text-lg mb-4">🤖 Machine Learning Methodology:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Uses qualifying results as baseline starting positions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Analyzes tire degradation from practice sessions or sprint races</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Machine learning model adjusts positions based on race pace patterns</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Maximum position change: ±3 positions from qualifying</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Data source: FastF1 library with official F1 timing data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Sync Info */}
      <div className="mt-12">
        <SyncStatus />
      </div>
      </div>
    </>
  );
}
