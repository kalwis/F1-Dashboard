import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';

export default function RankingsPage() {
  const [driverRankings, setDriverRankings] = useState([]);
  const [combinedRankings, setCombinedRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch available years on component mount
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/years');
        const years = await response.json();
        setAvailableYears(years);
        // Set the latest year as default
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (err) {
        console.error('Error fetching available years:', err);
      }
    };

    fetchAvailableYears();
  }, []);

  // Fetch rankings when selectedYear changes
  useEffect(() => {
    if (selectedYear === null) return; // Don't fetch until we have a year selected

    const fetchRankings = async () => {
      try {
        setLoading(true);
        
        // Build URL with year parameter if selected
        const yearParam = selectedYear ? `?season=${selectedYear}` : '';
        
        // Fetch driver Elo rankings
        const driverResponse = await fetch(`http://localhost:5001/api/rankings/drivers/elo${yearParam}`);
        const driverData = await driverResponse.json();
        setDriverRankings(driverData.slice(0, 20)); // Top 20 drivers
        
        // Fetch combined rankings
        const combinedResponse = await fetch(`http://localhost:5001/api/rankings/combined${yearParam}`);
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
  }, [selectedYear]);

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

      {/* Year Selector */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <label htmlFor="year-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Select Season:
        </label>
        <select
          id="year-select"
          value={selectedYear || ''}
          onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
          disabled={loading}
        >
          <option value="">All Time</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {selectedYear && (
          <span className="text-sm text-gray-600">
            Showing rankings for {selectedYear} season
          </span>
        )}
      </div>

      {/* Driver Rankings (F4) */}
      <DashboardCard title={`Driver Elo Rankings${selectedYear ? ` (${selectedYear})` : ' (All Time)'}`}>
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
      <DashboardCard title={`Combined Driver-Car Elo${selectedYear ? ` (${selectedYear})` : ' (All Time)'}`}>
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
        Rankings can now be filtered by season using the year selector above. Additional filtering by race, driver, or constructor is available for deeper exploration. (F7)
      </div>
    </div>
  );
}