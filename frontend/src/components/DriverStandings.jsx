import { useEffect, useState } from 'react';
import fastf1Api from '../services/api.js';

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

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return 'bg-yellow-500 text-black';
      case 2: return 'bg-gray-400 text-black';
      case 3: return 'bg-amber-600 text-white';
      default: return 'bg-white/10 text-white';
    }
  };

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

  return (
    <div className="h-full space-y-2">
      {drivers.map((driver, index) => {
        console.log(`Driver ${index + 1}:`, driver);
        return (
          <div key={driver.Driver?.driverId || index} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              {/* Position Badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(index + 1)}`}>
                {index + 1}
              </div>
              
              {/* Driver Info */}
              <div className="flex-1">
                <div className="font-semibold text-white">
                  {driver.Driver?.givenName || 'Unknown'} {driver.Driver?.familyName || 'Driver'}
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full border inline-block mt-1 ${getConstructorColor(driver.Constructor?.name)}`}>
                  {driver.Constructor?.name || 'Unknown Team'}
                </div>
              </div>
            </div>
            
            {/* Points */}
            <div className="text-right">
              <div className="font-bold text-white text-lg">
                {driver.points || 0}
              </div>
              <div className="text-xs text-white/60">pts</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
