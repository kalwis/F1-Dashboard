import React from 'react';
import DashboardCard from '../layout/DashboardCard';

export default function FilterSummary({ 
  selectedYear, 
  comparisonType, 
  onOpenFilters,
  hasSelections,
  selectedDriver1,
  selectedDriver2,
  selectedConstructor1,
  selectedConstructor2,
  drivers,
  constructors
}) {
  const getComparisonTypeLabel = (type) => {
    return type === 'driver-vs-driver' ? 'Driver vs Driver' : 'Constructor vs Constructor';
  };

  const getSelectedDriverName = (driverId) => {
    const driver = drivers.find(d => d.driver_id === parseInt(driverId));
    return driver ? `${driver.first_name} ${driver.last_name}` : null;
  };

  const getSelectedConstructorName = (constructorId) => {
    const constructor = constructors.find(c => c.constructor_id === parseInt(constructorId));
    return constructor ? constructor.name : null;
  };

  return (
    <DashboardCard>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <span className="text-blue-400 text-xl">📅</span>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Season</div>
              <div className="font-bold text-xl">{selectedYear}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <span className="text-green-400 text-xl">👥</span>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Comparison Type</div>
              <div className="font-bold text-xl flex items-center gap-3">
                {getComparisonTypeLabel(comparisonType)}

                {hasSelections && (
                  <div className="flex items-center gap-2 ml-4">
                    <div className="p-1.5 bg-green-500/20 rounded-lg">
                      <span className="text-green-400 text-sm">✓</span>
                    </div>
                    <span className="text-base text-white/90 font-medium px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 rounded-lg border border-white/20 shadow-sm">
                      {comparisonType === 'driver-vs-driver' ? (
                        <>
                          {selectedDriver1 && selectedDriver2 ? (
                            <span className="flex items-center gap-3">
                              <span className="text-blue-400 font-semibold">{getSelectedDriverName(selectedDriver1)}</span>
                              <span className="text-white/60 font-medium">vs</span>
                              <span className="text-red-400 font-semibold">{getSelectedDriverName(selectedDriver2)}</span>
                            </span>
                          ) : selectedDriver1 ? (
                            <span className="text-blue-400">
                              {getSelectedDriverName(selectedDriver1)} <span className="text-white/60">(select second driver)</span>
                            </span>
                          ) : selectedDriver2 ? (
                            <span className="text-red-400">
                              {getSelectedDriverName(selectedDriver2)} <span className="text-white/60">(select first driver)</span>
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <>
                          {selectedConstructor1 && selectedConstructor2 ? (
                            <span className="flex items-center gap-3">
                              <span className="text-blue-400 font-semibold">{getSelectedConstructorName(selectedConstructor1)}</span>
                              <span className="text-white/60 font-medium">vs</span>
                              <span className="text-red-400 font-semibold">{getSelectedConstructorName(selectedConstructor2)}</span>
                            </span>
                          ) : selectedConstructor1 ? (
                            <span className="text-blue-400">
                              {getSelectedConstructorName(selectedConstructor1)} <span className="text-white/60">(select second constructor)</span>
                            </span>
                          ) : selectedConstructor2 ? (
                            <span className="text-red-400">
                              {getSelectedConstructorName(selectedConstructor2)} <span className="text-white/60">(select first constructor)</span>
                            </span>
                          ) : null}
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenFilters}
          className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <span className="text-lg">⚙️</span>
          </div>
          <div className="text-left">
            <div className="font-semibold">Configure</div>
            <div className="text-xs text-blue-100">Settings & Filters</div>
          </div>
          <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white transition-colors"></div>
        </button>
      </div>
    </DashboardCard>
  );
}
