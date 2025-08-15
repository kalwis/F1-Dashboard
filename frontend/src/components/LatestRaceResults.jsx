import { useEffect, useState } from 'react';
import fastf1Api from '../services/fastf1Api';

export default function LatestRaceResults() {
  const [results, setResults] = useState([]);
  const [raceInfo, setRaceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          setResults(raceResults.slice(0, 5));
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

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Backend server not started</div>;
  }

  return (
    <div>
      {raceInfo && (
        <div className="text-xs text-gray-600 mb-2 text-center">
          {raceInfo.Circuit.Location.country} GP - Round {raceInfo.round}
        </div>
      )}
      <ol className="list-decimal list-inside space-y-1">
        {results.map((result) => (
          <li key={result.position}>
            <span className="font-medium">{result.Driver.familyName}</span>
            <span className="text-gray-600"> ({result.Constructor.name})</span>
            {result.points > 0 && (
              <span className="text-green-600 font-medium"> +{result.points}pts</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
