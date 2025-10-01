import React from 'react';
import DashboardCard from '../layout/DashboardCard';
import RankingItem from './RankingItem';

export default function CombinedRankingsCard({ combinedRankings, selectedYear }) {
  return (
    <DashboardCard 
      title={`🏎️ Combined Driver-Car Elo (${selectedYear})`}
    >
      <div className="h-[35rem] overflow-y-auto custom-scrollbar">
        {/* Top 3 Highlight */}
        <div className="space-y-2 mb-4 p-3 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl border border-blue-500/20">
          <div className="text-blue-400 font-semibold text-xs uppercase tracking-wider mb-2">Podium Positions</div>
          {combinedRankings.slice(0, 3).map((entry, index) => (
            <RankingItem
              key={`${entry.driver_id}-${entry.constructor_id}`}
              position={index + 1}
              name={`${entry.first_name} ${entry.last_name}`}
              subtitle={entry.constructor_name}
              score={entry.combined_elo}
              scoreLabel="Combined"
              isPodium={true}
            />
          ))}
        </div>

        {/* Rest of Rankings */}
        {combinedRankings.length > 3 && (
          <div className="space-y-2">
            <div className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-2 px-1">Other Drivers</div>
            {combinedRankings.slice(3).map((entry, index) => (
              <RankingItem
                key={`${entry.driver_id}-${entry.constructor_id}`}
                position={index + 4}
                name={`${entry.first_name} ${entry.last_name}`}
                subtitle={entry.constructor_name}
                score={entry.combined_elo}
                scoreLabel="Combined"
                isPodium={false}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 text-xs text-white/60 p-2 bg-black/20 rounded-lg border border-white/10">
        💡 <strong>Combined Elo</strong> blends driver skill with constructor performance using weighted k-factor. Reflects both driver ability and car quality.
      </div>
    </DashboardCard>
  );
}
