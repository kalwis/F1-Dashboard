import { useEffect, useState } from 'react';
import fastf1Api from '../services/api.js';

export default function ConstructorStandings() {
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fastf1Api.getConstructorStandings()
      .then((data) => {
        console.log('Constructor Standings API Response:', data);
        const standings =
          data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        console.log('Constructor Standings Data:', standings);
        console.log('Number of constructors:', standings.length);
        setConstructors(standings);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching constructor standings:', error);
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



  return (
    <div className="space-y-2">
      {constructors.map((constructor, index) => (
        <div 
          key={constructor.Constructor?.constructorId || index} 
          className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {/* Position Badge */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(index + 1)}`}>
              {index + 1}
            </div>
            
            {/* Constructor Info */}
            <div className="flex-1">
              <div className="font-semibold text-white">
                {constructor.Constructor?.name || 'Unknown Team'}
              </div>
            </div>
          </div>
          
          {/* Points */}
          <div className="text-right">
            <div className="font-bold text-white text-lg">
              {constructor.points || 0}
            </div>
            <div className="text-xs text-white/60">pts</div>
          </div>
        </div>
      ))}
    </div>
  );
}
