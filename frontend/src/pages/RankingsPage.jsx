import React, { useState, useEffect } from 'react';
import YearSelector from '../components/rankings/YearSelector';
import DriverRankingsCard from '../components/rankings/DriverRankingsCard';
import CombinedRankingsCard from '../components/rankings/CombinedRankingsCard';
import SyncStatus from '../components/layout/SyncStatus';
import { FaCalendarAlt } from 'react-icons/fa';

export default function RankingsPage() {
  const [driverRankings, setDriverRankings] = useState([]);
  const [combinedRankings, setCombinedRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [showAllYears, setShowAllYears] = useState(false);

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
    const fetchRankings = async () => {
      try {
        setLoading(true);
        
        // Build URL with year parameter
        const yearParam = `?season=${selectedYear}`;
        
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


  if (loading) {
    return (
      <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
          Driver & Constructor Rankings
        </h1>
        <div className="text-center text-white/60">Loading rankings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
          Driver & Constructor Rankings
        </h1>
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
        Driver & Constructor Rankings
      </h1>

      {/* Year Selector */}
      <YearSelector
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        availableYears={availableYears}
        showAllYears={showAllYears}
        setShowAllYears={setShowAllYears}
        loading={loading}
      />

      {/* Main grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Driver Rankings */}
        <DriverRankingsCard 
          driverRankings={driverRankings}
          selectedYear={selectedYear}
        />

        {/* Combined Driver-Constructor Rankings */}
        <CombinedRankingsCard 
          combinedRankings={combinedRankings}
          selectedYear={selectedYear}
        />
        
      </div>

      {/* Filtering Note */}
      <div className="text-sm text-white/60 mt-6 p-4 bg-black/10 rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-white/60" />
          <span>
            Rankings can be filtered by season using the year selector above. Additional filtering by race, driver, or constructor is available for deeper exploration. (F7)
          </span>
        </div>
      </div>

      {/* Footer Sync Info */}
      <div className="mt-6">
        <SyncStatus />
      </div>
    </div>
  );
}