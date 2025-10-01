import React from 'react';
import DashboardCard from '../layout/DashboardCard';
import RankingItem from './RankingItem';

export default function DriverRankingsCard({ driverRankings, selectedYear }) {
  return (
    <DashboardCard 
      title={`🏆 Driver Elo Rankings (${selectedYear})`}
    >
      <div className="h-[35rem] overflow-y-auto custom-scrollbar">
        {/* Top 3 Highlight */}
        <div className="space-y-2 mb-4 p-3 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-xl border border-yellow-500/20">
          <div className="text-yellow-400 font-semibold text-xs uppercase tracking-wider mb-2">Podium Positions</div>
          {driverRankings.slice(0, 3).map((driver, index) => (
            <RankingItem
              key={driver.driver_id}
              position={index + 1}
              name={`${driver.first_name} ${driver.last_name}`}
              subtitle={driver.constructor_name}
              score={driver.elo}
              scoreLabel="Elo"
              isPodium={true}
            />
          ))}
        </div>

        {/* Rest of Rankings */}
        {driverRankings.length > 3 && (
          <div className="space-y-2">
            <div className="text-white/60 font-semibold text-xs uppercase tracking-wider mb-2 px-1">Other Drivers</div>
            {driverRankings.slice(3).map((driver, index) => (
              <RankingItem
                key={driver.driver_id}
                position={index + 4}
                name={`${driver.first_name} ${driver.last_name}`}
                subtitle={driver.constructor_name}
                score={driver.elo}
                scoreLabel="Elo"
                isPodium={false}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 text-xs text-white/60 p-2 bg-black/20 rounded-lg border border-white/10">
        💡 <strong>Driver Elo</strong> measures individual driver skill based on race finishing positions and head-to-head performance against other drivers.
      </div>
    </DashboardCard>
  );
}
