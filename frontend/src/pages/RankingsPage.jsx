import React from 'react';
import DashboardCard from '../components/DashboardCard';

export default function RankingsPage() {
  return (
    <div className="p-6 font-sans text-gray-800">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
        Driver & Constructor Rankings
      </h1>

      {/* Driver Rankings (F4) */}
      <DashboardCard title="Driver Elo Rankings">
        <div className="h-60 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm text-center px-4">
          [Sortable Table: Driver Name | Current Elo | Avg Elo | Wins | Fastest Laps]<br />
          Updated after each race. Uses one-to-many Elo algorithm with custom k-factor. (F4, NF2)
        </div>
      </DashboardCard>

      {/* Constructor Rankings (F4) */}
      <DashboardCard title="Constructor Elo Rankings">
        <div className="h-60 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm text-center px-4">
          [Bar Chart: Constructors sorted by Elo]<br />
          Elo ratings adjust based on car performance and k-factor distinct from driver. (F4, NF1)
        </div>
      </DashboardCard>

      {/* Combined Driver-Constructor Rankings (F5) */}
      <DashboardCard title="Combined Driver-Car Elo">
        <div className="h-60 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm text-center px-4">
          [Line Chart or Table: Driver-Constructor pairs with Elo score trends]<br />
          Reflects blended skill-performance via constructor-weighted k-factor. (F5, NF1, NF2)
        </div>
      </DashboardCard>

      {/* Filtering Note */}
      <div className="text-sm text-gray-600 mt-4">
        Users can filter these rankings by race, season, driver, or constructor for deeper exploration. (F7)
      </div>
    </div>
  );
}