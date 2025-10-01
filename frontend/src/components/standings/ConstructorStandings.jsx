import { useEffect, useState } from 'react';
import fastf1Api from '../../services/api.js';
import LeaderboardItem from '../shared/LeaderboardItem';

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

  const renderConstructor = (constructor, index) => {
    const position = index + 1;
    const isPodium = position <= 3;

    return (
      <LeaderboardItem
        key={constructor.Constructor?.constructorId || index}
        position={position}
        isPodium={isPodium}
        name={constructor.Constructor?.name || 'Unknown Team'}
        score={constructor.points || 0}
        scoreLabel="pts"
      />
    );
  };

  return (
    <div className="h-full">
      {/* Top 3 Highlight */}
      <div className="space-y-2 mb-4 p-3 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl border border-blue-500/20">
        <div className="text-blue-400 font-semibold text-xs uppercase tracking-wider mb-2">Podium Positions</div>
        {constructors.slice(0, 3).map((constructor, index) => renderConstructor(constructor, index))}
      </div>

      {/* Rest of Constructors */}
      {constructors.length > 3 && (
        <div className="space-y-2">
          <div className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-2 px-1">Other Teams</div>
          {constructors.slice(3).map((constructor, index) => renderConstructor(constructor, index + 3))}
        </div>
      )}
    </div>
  );
}
