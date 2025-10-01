import { useEffect, useState } from 'react';
import fastf1Api from '../../services/api.js';
import LeaderboardItem from '../shared/LeaderboardItem';

export default function DriverStandings() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fastf1Api.getDriverStandings()
      .then((data) => {
        console.log('Driver Standings API Response:', data);
        const standings =
          data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        console.log('Driver Standings Data:', standings);
        setDrivers(standings);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching driver standings:', error);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Backend server not started</div>;
  }

  const getConstructorColor = (constructorName) => {
    const colors = {
      'Red Bull': 'text-red-400 border-red-400',
      'Ferrari': 'text-red-500 border-red-500',
      'Mercedes': 'text-cyan-400 border-cyan-400',
      'McLaren': 'text-orange-400 border-orange-400',
      'Aston Martin': 'text-green-400 border-green-400',
      'Alpine': 'text-blue-400 border-blue-400',
      'Williams': 'text-blue-500 border-blue-500',
      'Haas F1 Team': 'text-white border-white',
      'Kick Sauber': 'text-green-500 border-green-500',
      'RB': 'text-blue-300 border-blue-300'
    };
    return colors[constructorName] || 'text-white/60 border-white/30';
  };

  const renderDriver = (driver, index) => {
    const position = index + 1;
    const isPodium = position <= 3;

    return (
      <LeaderboardItem
        key={driver.Driver?.driverId || index}
        position={position}
        isPodium={isPodium}
        name={`${driver.Driver?.givenName || 'Unknown'} ${driver.Driver?.familyName || 'Driver'}`}
        score={driver.points || 0}
        scoreLabel="pts"
        extraInfo={
          <div className={`text-xs font-medium px-2 py-1 rounded-full border inline-block ${getConstructorColor(driver.Constructor?.name)}`}>
            {driver.Constructor?.name || 'Unknown Team'}
          </div>
        }
      />
    );
  };

  return (
    <div className="h-full">
      {/* Top 3 Highlight */}
      <div className="space-y-2 mb-4 p-3 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-xl border border-yellow-500/20">
        <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wider mb-2">Podium Positions</div>
        {drivers.slice(0, 3).map((driver, index) => renderDriver(driver, index))}
      </div>

      {/* Rest of Drivers */}
      {drivers.length > 3 && (
        <div className="space-y-2">
          <div className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-2 px-1">Other Drivers</div>
          {drivers.slice(3).map((driver, index) => renderDriver(driver, index + 3))}
        </div>
      )}
    </div>
  );
}
