import { useEffect, useState } from 'react';
import fastf1Api from '../../services/api.js';
import { FaTrophy } from 'react-icons/fa';

export default function LatestRaceResults() {
  const [results, setResults] = useState([]);
  const [raceInfo, setRaceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLatestResults = async () => {
      try {
        // First get the current season schedule to find the latest completed race
        const scheduleData = await fastf1Api.getSeasonSchedule();
        const races = scheduleData.MRData.RaceTable.Races;
        const today = new Date();
        
        // Find the most recent completed race
        const completedRaces = races.filter(race => new Date(race.date) < today);
        const latestRace = completedRaces[completedRaces.length - 1];
        
        if (latestRace) {
          setRaceInfo(latestRace);
          
          // Get results for the latest race
          const resultsData = await fastf1Api.getRaceResults('current', latestRace.round);
          const raceResults = resultsData.MRData.RaceTable.Races[0].Results;
          // Show all drivers that gained points (positions 1-10 typically score points)
          const scoringDrivers = raceResults.filter(result => result.points > 0);
          setResults(scoringDrivers);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching latest race results:', error);
        setError(true);
        setLoading(false);
      }
    };

    fetchLatestResults();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30 mx-auto mb-2"></div>
          <div className="text-sm">Loading results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-400">
          <FaTrophy className="mx-auto mb-2 text-2xl" />
          <div className="text-sm">Backend server not started</div>
        </div>
      </div>
    );
  }

  if (!raceInfo || results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <FaTrophy className="mx-auto mb-2 text-2xl" />
          <div className="text-sm">No race results available</div>
        </div>
      </div>
    );
  }

  const podiumResults = results.slice(0, 3);
  const otherResults = results.slice(3);

  return (
    <div className="space-y-4">
      {/* Race Header */}
      <div className="flex items-center justify-between text-xs text-white/70 mb-3">
        <span className="font-bold">{raceInfo.Circuit.Location.country} GP</span>
        <span className="font-bold">Round {raceInfo.round} • {formatDate(raceInfo.date)}</span>
      </div>

      {/* Podium Display */}
      <div className="relative">
        <div className="flex items-end justify-center space-x-2 mb-4">
          {/* 2nd Place */}
          {podiumResults[1] && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-400 text-black flex items-center justify-center text-lg font-bold mb-2">
                2
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-white">
                  {podiumResults[1].Driver.givenName} {podiumResults[1].Driver.familyName}
                </div>
                <div className="text-xs text-green-400 font-bold mt-1">+{podiumResults[1].points}pts</div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {podiumResults[0] && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500 text-black flex items-center justify-center text-xl font-bold mb-2">
                1
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-white">
                  {podiumResults[0].Driver.givenName} {podiumResults[0].Driver.familyName}
                </div>
                <div className="text-sm text-green-400 font-bold mt-1">+{podiumResults[0].points}pts</div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {podiumResults[2] && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-lg font-bold mb-2">
                3
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-white">
                  {podiumResults[2].Driver.givenName} {podiumResults[2].Driver.familyName}
                </div>
                <div className="text-xs text-green-400 font-bold mt-1">+{podiumResults[2].points}pts</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Other Results */}
      {otherResults.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-white/60 font-medium mb-2">Other Scoring Drivers</div>
          {otherResults.map((result) => (
            <div 
              key={result.position} 
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {/* Position Badge */}
                <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold">
                  {result.position}
                </div>
                
                {/* Driver Info */}
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">
                    {result.Driver.givenName} {result.Driver.familyName}
                  </div>
                </div>
              </div>
              
              {/* Points and Status */}
              <div className="text-right">
                {result.points > 0 ? (
                  <div className="font-bold text-green-400 text-sm">
                    +{result.points}
                  </div>
                ) : (
                  <div className="text-xs text-white/40">
                    {result.status === 'Finished' ? 'Finished' : result.status}
                  </div>
                )}
                <div className="text-xs text-white/60">pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
