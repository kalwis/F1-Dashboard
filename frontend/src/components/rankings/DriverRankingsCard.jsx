import React from 'react';
import DashboardCard from '../layout/DashboardCard';
import RankingItem from './RankingItem';
import { FaUsers } from 'react-icons/fa';

export default function DriverRankingsCard({ driverRankings, selectedYear }) {
  return (
    <DashboardCard 
      title={`Driver Elo Rankings${selectedYear ? ` (${selectedYear})` : ' (All Time)'}`}
      icon={FaUsers}
    >
      <div className="h-[35rem] p-4 bg-black/10 rounded shadow-inner text-sm text-white overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {driverRankings.map((driver, index) => (
            <RankingItem
              key={driver.driver_id}
              position={index + 1}
              name={`${driver.first_name} ${driver.last_name}`}
              subtitle={driver.constructor_name}
              score={driver.elo}
              scoreLabel="Elo"
            />
          ))}
        </div>
        <p className="text-xs text-white/60 mt-4 p-2 bg-white/5 rounded">
          Updated after each race. Uses one-to-many Elo algorithm with custom k-factor. (F4, NF2)
        </p>
      </div>
    </DashboardCard>
  );
}
