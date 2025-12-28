import React from 'react';
import DashboardCard from '../layout/DashboardCard';
import RankingItem from './RankingItem';

export default function DriverRankingsCard({ driverRankings, selectedYear }) {
  const hasData = driverRankings && driverRankings.length > 0;
  const podium = hasData ? driverRankings.slice(0, 3) : [];
  const rest = hasData && driverRankings.length > 3 ? driverRankings.slice(3) : [];

  return (
    <DashboardCard title={`Driver Standings (${selectedYear})`}>
      <div className="h-[35rem] overflow-y-auto custom-scrollbar">
        {/* Top 3 Highlight */}
        <div className="space-y-2 mb-4 p-3 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-xl border border-yellow-500/20">
          <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wider mb-2">
            Podium positions
          </div>
          {podium.map((driver, index) => (
            <RankingItem
              key={driver.driver_id || index}
              position={index + 1}
              name={`${driver.first_name} ${driver.last_name}`.trim()}
              subtitle={driver.constructor_name}
              score={driver.points ?? driver.elo}
              scoreLabel="Points"
              isPodium
            />
          ))}
          {!podium.length && (
            <div className="text-white/60 text-sm">No standings available yet.</div>
          )}
        </div>

        {/* Rest of Rankings */}
        {!!rest && rest.length > 0 && (
          <div className="space-y-2">
            <div className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-2 px-1">
              Other drivers
            </div>
            {rest.map((driver, index) => (
              <RankingItem
                key={driver.driver_id || index}
                position={index + 4}
                name={`${driver.first_name} ${driver.last_name}`.trim()}
                subtitle={driver.constructor_name}
                score={driver.points ?? driver.elo}
                scoreLabel="Points"
                isPodium={false}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 text-xs text-white/60 p-2 bg-black/20 rounded-lg border border-white/10">
        Standings are sourced from the local FastF1 backend. Points reflect the current season totals.
      </div>
    </DashboardCard>
  );
}
