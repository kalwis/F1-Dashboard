import React from 'react';
import DashboardCard from '../layout/DashboardCard';
import RankingItem from './RankingItem';
import { FaCar } from 'react-icons/fa';

export default function CombinedRankingsCard({ combinedRankings, selectedYear }) {
  return (
    <DashboardCard 
      title={`Combined Driver-Car Elo (${selectedYear})`}
      icon={FaCar}
    >
      <div className="h-[35rem] p-4 bg-black/10 rounded shadow-inner text-sm text-white overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {combinedRankings.map((entry, index) => (
            <RankingItem
              key={`${entry.driver_id}-${entry.constructor_id}`}
              position={index + 1}
              name={`${entry.first_name} ${entry.last_name}`}
              subtitle={entry.constructor_name}
              score={entry.combined_elo}
              scoreLabel="Combined"
            />
          ))}
        </div>
        <p className="text-xs text-white/60 mt-4 p-2 bg-white/5 rounded">
          Reflects blended skill-performance via constructor-weighted k-factor. (F5, NF1, NF2)
        </p>
      </div>
    </DashboardCard>
  );
}
