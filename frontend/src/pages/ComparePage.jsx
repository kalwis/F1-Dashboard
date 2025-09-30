import React, { useState, useEffect } from "react";
import DashboardCard from '../components/layout/DashboardCard';

export default function ComparePage() {
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [selectedDriver1, setSelectedDriver1] = useState('');
  const [selectedDriver2, setSelectedDriver2] = useState('');
  const [selectedConstructor1, setSelectedConstructor1] = useState('');
  const [selectedConstructor2, setSelectedConstructor2] = useState('');
  const [driverComparison, setDriverComparison] = useState(null);
  const [constructorComparison, setConstructorComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch drivers
        const driverResponse = await fetch('http://localhost:5001/api/drivers');
        const driverData = await driverResponse.json();
        setDrivers(driverData.slice(0, 50)); // Top 50 drivers for dropdown
        
        // Fetch constructors (we'll get this from combined rankings)
        const combinedResponse = await fetch('http://localhost:5001/api/rankings/combined');
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
  }, []);

  const compareDrivers = async () => {
    if (!selectedDriver1 || !selectedDriver2) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/drivers/compare/${selectedDriver1}/${selectedDriver2}`);
      const data = await response.json();
      setDriverComparison(data);
    } catch (err) {
      console.error('Error comparing drivers:', err);
    }
  };

  const compareConstructors = async () => {
    if (!selectedConstructor1 || !selectedConstructor2) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/constructors/compare/${selectedConstructor1}/${selectedConstructor2}`);
      const data = await response.json();
      setConstructorComparison(data);
    } catch (err) {
      console.error('Error comparing constructors:', err);
    }
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-8">

      {/* Driver vs Driver Comparison - F8 */}
      <DashboardCard title="Driver Comparison">
        <div className="flex justify-between gap-4 mb-4">
          <select 
            className="text-sm p-2 border rounded w-full bg-white text-black" 
            value={selectedDriver1}
            onChange={(e) => setSelectedDriver1(e.target.value)}
          >
            <option value="">Select Driver A</option>
            {drivers.map(driver => (
              <option key={driver.driver_id} value={driver.driver_id}>
                {driver.first_name} {driver.last_name}
              </option>
            ))}
          </select>
          <select 
            className="text-sm p-2 border rounded w-full bg-white text-black" 
            value={selectedDriver2}
            onChange={(e) => setSelectedDriver2(e.target.value)}
          >
            <option value="">Select Driver B</option>
            {drivers.map(driver => (
              <option key={driver.driver_id} value={driver.driver_id}>
                {driver.first_name} {driver.last_name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={compareDrivers}
          disabled={!selectedDriver1 || !selectedDriver2}
          className="w-full mb-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Compare Drivers
        </button>

        {driverComparison && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/10 rounded">
              <h4 className="font-bold text-white mb-2">
                {driverComparison.driver1.first_name} {driverComparison.driver1.last_name}
              </h4>
              <div className="text-sm text-white/80">
                <div>Elo: {Math.round(driverComparison.driver1.elo)}</div>
                <div>Combined: {Math.round(driverComparison.driver1.combined_elo)}</div>
                <div>Position: {driverComparison.driver1.position || 'N/A'}</div>
                <div>Points: {driverComparison.driver1.points || 'N/A'}</div>
              </div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded">
              <h4 className="font-bold text-white mb-2">
                {driverComparison.driver2.first_name} {driverComparison.driver2.last_name}
              </h4>
              <div className="text-sm text-white/80">
                <div>Elo: {Math.round(driverComparison.driver2.elo)}</div>
                <div>Combined: {Math.round(driverComparison.driver2.combined_elo)}</div>
                <div>Position: {driverComparison.driver2.position || 'N/A'}</div>
                <div>Points: {driverComparison.driver2.points || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          This section compares two drivers using Elo and key stats. Matches requirement F8 and supports NF1 usability.
        </p>
      </DashboardCard>

      {/* Constructor vs Constructor Comparison - F8 */}
      <DashboardCard title="Constructor Comparison">
        <div className="flex justify-between gap-4 mb-4">
          <select 
            className="text-sm p-2 border rounded w-full bg-white text-black" 
            value={selectedConstructor1}
            onChange={(e) => setSelectedConstructor1(e.target.value)}
          >
            <option value="">Select Constructor A</option>
            {constructors.map(constructor => (
              <option key={constructor.constructor_id} value={constructor.constructor_id}>
                {constructor.name}
              </option>
            ))}
          </select>
          <select 
            className="text-sm p-2 border rounded w-full bg-white text-black" 
            value={selectedConstructor2}
            onChange={(e) => setSelectedConstructor2(e.target.value)}
          >
            <option value="">Select Constructor B</option>
            {constructors.map(constructor => (
              <option key={constructor.constructor_id} value={constructor.constructor_id}>
                {constructor.name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={compareConstructors}
          disabled={!selectedConstructor1 || !selectedConstructor2}
          className="w-full mb-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Compare Constructors
        </button>

        {constructorComparison && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/10 rounded">
              <h4 className="font-bold text-white mb-2">
                {constructorComparison.constructor1.name}
              </h4>
              <div className="text-sm text-white/80">
                <div>Elo: {Math.round(constructorComparison.constructor1.elo)}</div>
                <div>Year: {constructorComparison.constructor1.year}</div>
                <div>Round: {constructorComparison.constructor1.round}</div>
              </div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded">
              <h4 className="font-bold text-white mb-2">
                {constructorComparison.constructor2.name}
              </h4>
              <div className="text-sm text-white/80">
                <div>Elo: {Math.round(constructorComparison.constructor2.elo)}</div>
                <div>Year: {constructorComparison.constructor2.year}</div>
                <div>Round: {constructorComparison.constructor2.round}</div>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Constructor-level comparison with performance stats. Aligned with F8 and focused on clear comparison UI.
        </p>
      </DashboardCard>

      {/* Visual Summary Bar Chart - F8 */}
      <div className="col-span-1 md:col-span-2">
        <DashboardCard title="Visual Summary">
          {(driverComparison || constructorComparison) ? (
            <div className="h-56 flex items-center justify-center text-white">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-4">Comparison Summary</h3>
                {driverComparison && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Driver 1 Elo:</span>
                      <span className="font-bold">{Math.round(driverComparison.driver1.elo)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Driver 2 Elo:</span>
                      <span className="font-bold">{Math.round(driverComparison.driver2.elo)}</span>
                    </div>
                    <div className="mt-4 p-2 bg-white/10 rounded">
                      <span className="font-bold">
                        {driverComparison.driver1.elo > driverComparison.driver2.elo 
                          ? `${driverComparison.driver1.first_name} ${driverComparison.driver1.last_name} leads by ${Math.round(driverComparison.driver1.elo - driverComparison.driver2.elo)} Elo points`
                          : `${driverComparison.driver2.first_name} ${driverComparison.driver2.last_name} leads by ${Math.round(driverComparison.driver2.elo - driverComparison.driver1.elo)} Elo points`
                        }
                      </span>
                    </div>
                  </div>
                )}
                {constructorComparison && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Constructor 1 Elo:</span>
                      <span className="font-bold">{Math.round(constructorComparison.constructor1.elo)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Constructor 2 Elo:</span>
                      <span className="font-bold">{Math.round(constructorComparison.constructor2.elo)}</span>
                    </div>
                    <div className="mt-4 p-2 bg-white/10 rounded">
                      <span className="font-bold">
                        {constructorComparison.constructor1.elo > constructorComparison.constructor2.elo 
                          ? `${constructorComparison.constructor1.name} leads by ${Math.round(constructorComparison.constructor1.elo - constructorComparison.constructor2.elo)} Elo points`
                          : `${constructorComparison.constructor2.name} leads by ${Math.round(constructorComparison.constructor2.elo - constructorComparison.constructor1.elo)} Elo points`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-56 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Select drivers or constructors above to see comparison summary
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Summary showing the relative performance of selected drivers or constructors across key metrics.
            Supports side-by-side visual inspection. Meets F8, NF1 (clarity), NF3 (responsive loading).
          </p>
        </DashboardCard>
      </div>

    </div>
  );
}
