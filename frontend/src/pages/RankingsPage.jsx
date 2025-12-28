import React, { useState, useEffect, useMemo } from 'react';
import YearSelector from '../components/rankings/YearSelector';
import DriverRankingsCard from '../components/rankings/DriverRankingsCard';
import CombinedRankingsCard from '../components/rankings/CombinedRankingsCard';
import SyncStatus from '../components/layout/SyncStatus';
import fastf1Api from '../services/api';

export default function RankingsPage() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [driverRankings, setDriverRankings] = useState([]);
  const [combinedRankings, setCombinedRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('current');
  const [availableYears, setAvailableYears] = useState([]);
  const [showAllYears, setShowAllYears] = useState(false);

  // Available years (current + recent seasons)
  useEffect(() => {
    const years = ['current'];
    for (let i = 0; i < 5; i += 1) {
      years.push((currentYear - i).toString());
    }
    setAvailableYears(years);
    setSelectedYear('current');
  }, [currentYear]);

  // Fetch rankings when selectedYear changes
  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedYear) return;

      try {
        setLoading(true);

        const yearParam = selectedYear === 'current' ? 'current' : selectedYear;

        // Driver standings -> driver rankings
        const driverData = await fastf1Api.getDriverStandings(yearParam);
        const driverStandings =
          driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        const mappedDrivers = driverStandings.map((entry) => ({
          driver_id: entry?.Driver?.driverId || '',
          first_name: entry?.Driver?.givenName || '',
          last_name: entry?.Driver?.familyName || '',
          constructor_name: entry?.Constructor?.name || '',
          elo: Number(entry?.points) || 0,
          points: Number(entry?.points) || 0,
          position: Number(entry?.position) || 0,
        }));
        setDriverRankings(mappedDrivers);

        // Constructor standings -> combined rankings fallback
        const constructorData = await fastf1Api.getConstructorStandings(yearParam);
        const constructorStandings =
          constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
        const mappedConstructors = constructorStandings.map((entry) => ({
          constructor_id: entry?.Constructor?.constructorId || '',
          constructor_name: entry?.Constructor?.name || '',
          combined_elo: Number(entry?.points) || 0,
          points: Number(entry?.points) || 0,
          position: Number(entry?.position) || 0,
        }));
        setCombinedRankings(mappedConstructors);

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
      <div className="pt-28 p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
            Driver & Constructor Rankings
          </h1>
          <p className="text-lg text-white/70 max-w-4xl mx-auto">
            Championship standings pulled from the local FastF1 backend
          </p>
        </div>
        <div className="text-center text-white/60">Loading rankings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 p-6 font-sans text-gray-200 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
            Driver & Constructor Rankings
          </h1>
          <p className="text-lg text-white/70 max-w-4xl mx-auto">
            Championship standings pulled from the local FastF1 backend
          </p>
        </div>
        <div className="text-center p-6 bg-red-500/10 rounded-xl border border-red-500/20">
          <div className="text-red-400 text-lg font-semibold mb-2">Error Loading Rankings</div>
          <div className="text-red-300">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 p-6 font-sans text-gray-200 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
          Driver & Constructor Rankings
        </h1>
        <p className="text-lg text-white/70 max-w-4xl mx-auto">
          Championship standings pulled from the local FastF1 backend
        </p>
      </div>

      {/* Year Selector */}
      <YearSelector
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        availableYears={availableYears}
        showAllYears={showAllYears}
        setShowAllYears={setShowAllYears}
        loading={loading}
      />

      {/* Summary Stats */}
      {driverRankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 p-6 rounded-xl border border-yellow-500/20">
            <div className="text-yellow-300 text-sm font-medium mb-2">Top Driver</div>
            <div className="text-white text-xl font-bold">{`${driverRankings[0]?.first_name} ${driverRankings[0]?.last_name}`}</div>
            <div className="text-yellow-300/60 text-xs mt-1">{Math.round(driverRankings[0]?.points)} pts</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-xl border border-blue-500/20">
            <div className="text-blue-300 text-sm font-medium mb-2">Total Drivers</div>
            <div className="text-white text-3xl font-bold">{driverRankings.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-xl border border-purple-500/20">
            <div className="text-purple-300 text-sm font-medium mb-2">Avg Points</div>
            <div className="text-white text-3xl font-bold">
              {Math.round(driverRankings.reduce((sum, d) => sum + d.points, 0) / driverRankings.length)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-xl border border-green-500/20">
            <div className="text-green-300 text-sm font-medium mb-2">Season</div>
            <div className="text-white text-3xl font-bold">{selectedYear === 'current' ? `${currentYear} (current)` : selectedYear}</div>
          </div>
        </div>
      )}

      {/* Main grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Driver Rankings */}
        <DriverRankingsCard
          driverRankings={driverRankings}
          selectedYear={selectedYear === 'current' ? currentYear : selectedYear}
        />

        {/* Constructor Rankings */}
        <CombinedRankingsCard
          combinedRankings={combinedRankings}
          selectedYear={selectedYear === 'current' ? currentYear : selectedYear}
        />
      </div>

      {/* Info */}
      <div className="mt-8 text-sm text-white/60 p-6 bg-gradient-to-r from-black/20 to-black/10 rounded-xl border border-white/10">
        <div className="space-y-3">
          <div className="font-semibold text-white text-lg mb-4">About these rankings</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1" aria-hidden="true">•</span>
                <span><strong>Drivers:</strong> Sorted by championship points for the selected season.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1" aria-hidden="true">•</span>
                <span><strong>Constructors:</strong> Uses constructor standings as a combined driver-car view.</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1" aria-hidden="true">•</span>
                <span>Data is fetched live from the local FastF1 backend.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1" aria-hidden="true">•</span>
                <span>Points update after each race; select a year to view a different season.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sync Info */}
      <div className="mt-6">
        <SyncStatus />
      </div>
    </div>
  );
}
