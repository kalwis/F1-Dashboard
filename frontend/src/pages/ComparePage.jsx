import React, { useState, useEffect } from "react";
import FilterModal from '../components/compare/FilterModal';
import FilterSummary from '../components/compare/FilterSummary';
import SyncStatus from '../components/layout/SyncStatus';

export default function ComparePage() {
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [selectedDriver1, setSelectedDriver1] = useState('');
  const [selectedDriver2, setSelectedDriver2] = useState('');
  const [selectedConstructor1, setSelectedConstructor1] = useState('');
  const [selectedConstructor2, setSelectedConstructor2] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonType, setComparisonType] = useState('driver-vs-driver'); // 'driver-vs-driver', 'constructor-vs-constructor'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch drivers for selected year using the existing endpoint
        const driverResponse = await fetch(`http://localhost:5001/api/rankings/drivers/elo?season=${selectedYear}`);
        const driverData = await driverResponse.json();
        setDrivers(driverData.slice(0, 50)); // Top 50 drivers for dropdown
        
        // Fetch constructors from combined rankings
        const combinedResponse = await fetch(`http://localhost:5001/api/rankings/combined?season=${selectedYear}`);
        const combinedData = await combinedResponse.json();
        const uniqueConstructors = combinedData.reduce((acc, entry) => {
          if (!acc.find(c => c.constructor_id === entry.constructor_id)) {
            acc.push({
              constructor_id: entry.constructor_id,
              name: entry.constructor_name
            });
          }
          return acc;
        }, []);
        setConstructors(uniqueConstructors.slice(0, 20)); // Top 20 constructors
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    setSelectedDriver1('');
    setSelectedDriver2('');
    setSelectedConstructor1('');
    setSelectedConstructor2('');
  }, [selectedYear]);


  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-8">
        <div className="col-span-1 md:col-span-2 text-center text-gray-500">Loading comparison data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-8">
        <div className="col-span-1 md:col-span-2 text-center text-red-500">{error}</div>
      </div>
    );
  }

  const hasSelections = (comparisonType === 'driver-vs-driver' && (selectedDriver1 || selectedDriver2)) ||
                      (comparisonType === 'constructor-vs-constructor' && (selectedConstructor1 || selectedConstructor2));

  return (
    <div className="p-6 font-sans text-gray-200 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-white">
        Driver & Constructor Comparison
      </h1>

      {/* Filter Summary */}
      <FilterSummary 
        selectedYear={selectedYear}
        comparisonType={comparisonType}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        hasSelections={hasSelections}
        selectedDriver1={selectedDriver1}
        selectedDriver2={selectedDriver2}
        selectedConstructor1={selectedConstructor1}
        selectedConstructor2={selectedConstructor2}
        drivers={drivers}
        constructors={constructors}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        comparisonType={comparisonType}
        setComparisonType={setComparisonType}
        drivers={drivers}
        constructors={constructors}
        selectedDriver1={selectedDriver1}
        setSelectedDriver1={setSelectedDriver1}
        selectedDriver2={selectedDriver2}
        setSelectedDriver2={setSelectedDriver2}
        selectedConstructor1={selectedConstructor1}
        setSelectedConstructor1={setSelectedConstructor1}
        selectedConstructor2={selectedConstructor2}
        setSelectedConstructor2={setSelectedConstructor2}
      />

      {/* Footer Sync Info */}
      <div className="mt-6">
        <SyncStatus />
      </div>
    </div>
  );
}
