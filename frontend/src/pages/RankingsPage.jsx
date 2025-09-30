import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';

export default function RankingsPage() {
  const [driverRankings, setDriverRankings] = useState([]);
  const [combinedRankings, setCombinedRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        
        // Fetch driver Elo rankings
        const driverResponse = await fetch('https://f1-dashboard-doj4.onrender.com/api/rankings/drivers/elo');
        const driverData = await driverResponse.json();
        setDriverRankings(driverData.slice(0, 20)); // Top 20 drivers
        
        // Fetch combined rankings
        const combinedResponse = await fetch('https://f1-dashboard-doj4.onrender.com/api/rankings/combined');
        const combinedData = await combinedResponse.json();
        setCombinedRankings(combinedData.slice(0, 20)); // Top 20 combined
        
        setError(null);
      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError('Failed to load rankings. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return 'bg-yellow-500 text-black';
      case 2: return 'bg-gray-400 text-black';
      case 3: return 'bg-amber-600 text-white';
      default: return 'bg-white/10 text-white';
    }
  };

  if (loading) {
    return (
      <div className="p-6 font-sans text-gray-800">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
          Driver & Constructor Rankings
        </h1>
        <div className="text-center text-gray-500">Loading rankings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 font-sans text-gray-800">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
          Driver & Constructor Rankings
        </h1>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans text-gray-800">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
        Driver & Constructor Rankings
      </h1>

      {/* Driver Rankings (F4) */}
      <DashboardCard title="Driver Elo Rankings">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {driverRankings.map((driver, index) => (
            <div key={driver.driver_id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(index + 1)}`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {driver.first_name} {driver.last_name}
                  </div>
                  <div className="text-xs text-white/60">
                    {driver.code}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-lg">
                  {Math.round(driver.elo)}
                </div>
                <div className="text-xs text-white/60">Elo</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Updated after each race. Uses one-to-many Elo algorithm with custom k-factor. (F4, NF2)
        </p>
      </DashboardCard>

      {/* Combined Driver-Constructor Rankings (F5) */}
      <DashboardCard title="Combined Driver-Car Elo">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {combinedRankings.map((entry, index) => (
            <div key={`${entry.driver_id}-${entry.constructor_id}`} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(index + 1)}`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {entry.first_name} {entry.last_name}
                  </div>
                  <div className="text-xs text-white/60">
                    {entry.constructor_name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-lg">
                  {Math.round(entry.combined_elo)}
                </div>
                <div className="text-xs text-white/60">Combined</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Reflects blended skill-performance via constructor-weighted k-factor. (F5, NF1, NF2)
        </p>
      </DashboardCard>

      {/* Filtering Note */}
      <div className="text-sm text-gray-600 mt-4">
        Users can filter these rankings by race, season, driver, or constructor for deeper exploration. (F7)
      </div>
    </div>
  );
}