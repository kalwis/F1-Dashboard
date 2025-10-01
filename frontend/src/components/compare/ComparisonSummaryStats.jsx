import React from 'react';

export default function ComparisonSummaryStats({
  comparisonType,
  selectedYear,
  selectedDriver1,
  selectedDriver2,
  selectedConstructor1,
  selectedConstructor2,
  drivers,
  constructors,
  useDifferentYears,
  selectedYear1,
  selectedYear2
}) {
  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.driver_id === parseInt(driverId));
    return driver ? `${driver.first_name} ${driver.last_name}` : 'N/A';
  };

  const getConstructorName = (constructorId) => {
    const constructor = constructors.find(c => c.constructor_id === parseInt(constructorId));
    return constructor?.name || 'N/A';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 p-4 rounded-xl border border-cyan-500/20">
        <div className="text-cyan-300 text-xs font-medium mb-1 flex items-center gap-1">
          <span>📊</span>
          <span>Comparison Type</span>
        </div>
        <div className="text-white text-base font-bold truncate">
          {comparisonType === 'driver-vs-driver' ? 'Driver vs Driver' : 'Constructor vs Constructor'}
        </div>
        <div className="text-cyan-300/60 text-xs mt-1">
          {selectedYear}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/20">
        <div className="text-blue-300 text-xs font-medium mb-1 flex items-center gap-1">
          <span>🏁</span>
          <span>Competitor 1</span>
          {useDifferentYears && <span className="text-blue-400/60">({selectedYear1})</span>}
        </div>
        <div className="text-white text-base font-bold truncate">
          {comparisonType === 'driver-vs-driver' 
            ? getDriverName(selectedDriver1)
            : getConstructorName(selectedConstructor1)}
        </div>
        <div className="text-blue-300/60 text-xs mt-1">
          Elo: ---
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-xl border border-purple-500/20">
        <div className="text-purple-300 text-xs font-medium mb-1 flex items-center gap-1">
          <span>🏁</span>
          <span>Competitor 2</span>
          {useDifferentYears && <span className="text-purple-400/60">({selectedYear2})</span>}
        </div>
        <div className="text-white text-base font-bold truncate">
          {comparisonType === 'driver-vs-driver' 
            ? getDriverName(selectedDriver2)
            : getConstructorName(selectedConstructor2)}
        </div>
        <div className="text-purple-300/60 text-xs mt-1">
          Elo: ---
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 rounded-xl border border-green-500/20">
        <div className="text-green-300 text-xs font-medium mb-1 flex items-center gap-1">
          <span>⚖️</span>
          <span>Elo Difference</span>
        </div>
        <div className="text-white text-2xl font-bold">
          ---
        </div>
        <div className="text-green-300/60 text-xs mt-1">
          To be calculated
        </div>
      </div>
    </div>
  );
}

