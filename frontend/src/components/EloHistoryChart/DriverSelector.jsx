import React from 'react';

export default function DriverSelector({
  selectedDriver,
  drivers,
  searchTerm,
  setSearchTerm,
  showDriverList,
  setShowDriverList,
  handleDriverChange,
  filteredDrivers
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-white/80 font-medium">Driver Selection:</label>
        <span className="text-xs text-gray-500">
          {selectedDriver === 'all' ? 'Showing all drivers' : `Showing ${drivers.find(d => d.id === selectedDriver)?.name}`}
        </span>
      </div>
      
      <div className="flex gap-2">
        {/* All Drivers Button */}
        <button
          onClick={() => handleDriverChange('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedDriver === 'all'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-black/20 backdrop-blur-md border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <span>All Drivers</span>
          </div>
        </button>

        {/* Driver Search/Select */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowDriverList(!showDriverList)}
            className="w-full px-4 py-2 bg-black/20 backdrop-blur-md border border-white/10 text-gray-300 rounded-lg text-sm font-medium flex items-center justify-between hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border border-white/20" 
                style={{ 
                  backgroundColor: selectedDriver === 'all' 
                    ? '#ffffff' 
                    : drivers.find(d => d.id === selectedDriver)?.color || '#ffffff' 
                }}
              ></div>
              <span>
                {selectedDriver === 'all' 
                  ? 'Select Individual Driver' 
                  : drivers.find(d => d.id === selectedDriver)?.name || 'Select Driver'
                }
              </span>
            </div>
            <svg className={`w-4 h-4 transition-transform duration-200 ${showDriverList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDriverList && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-600">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search drivers or teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-red-500 focus:outline-none"
                    autoFocus
                  />
                  <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Driver List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredDrivers.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">
                    No drivers found
                  </div>
                ) : (
                  filteredDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleDriverChange(driver.id)}
                      className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-800 transition-colors flex items-center justify-between ${
                        selectedDriver === driver.id ? 'bg-red-500 text-white' : 'text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20" 
                          style={{ backgroundColor: driver.color }}
                        ></div>
                        <div className="text-left">
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-xs text-gray-400">{driver.team}</div>
                        </div>
                      </div>
                      {selectedDriver === driver.id && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
