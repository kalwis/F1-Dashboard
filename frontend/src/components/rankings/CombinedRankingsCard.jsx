import React from 'react';
import DashboardCard from '../layout/DashboardCard';
import RankingItem from './RankingItem';

// Shows constructor standings; treats constructor points as the combined score.
export default function CombinedRankingsCard({ combinedRankings, selectedYear }) {
  const hasData = combinedRankings && combinedRankings.length > 0;
  const podium = hasData ? combinedRankings.slice(0, 3) : [];
  const rest = hasData && combinedRankings.length > 3 ? combinedRankings.slice(3) : [];

  return (
    <DashboardCard title={`Constructor Standings (${selectedYear})`}>
      <div className="h-[35rem] overflow-y-auto custom-scrollbar">
        {/* Top 3 Highlight */}
        <div className="space-y-2 mb-4 p-3 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl border border-blue-500/20">
          <div className="text-blue-400 font-semibold text-xs uppercase tracking-wider mb-2">
            Podium positions
          </div>
          {podium.map((entry, index) => (
            <RankingItem
              key={entry.constructor_id || index}
              position={index + 1}
              name={entry.constructor_name}
              subtitle="Team"
              score={entry.points ?? entry.combined_elo}
              scoreLabel="Points"
              isPodium
            />
          ))}
          {!podium.length && (
            <div className="text-white/60 text-sm">No constructor standings available yet.</div>
          )}
        </div>

        {/* Rest of Rankings */}
        {!!rest && rest.length > 0 && (
          <div className="space-y-2">
            <div className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-2 px-1">
              Other teams
            </div>
            {rest.map((entry, index) => (
              <RankingItem
                key={entry.constructor_id || index}
                position={index + 4}
                name={entry.constructor_name}
                subtitle="Team"
                score={entry.points ?? entry.combined_elo}
                scoreLabel="Points"
                isPodium={false}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 text-xs text-white/60 p-2 bg-black/20 rounded-lg border border-white/10">
        Constructor points are pulled from the local FastF1 backend for the selected season.
      </div>
    </DashboardCard>
  );
}
