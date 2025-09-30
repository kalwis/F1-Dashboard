import React from 'react';
import { FaCalendarAlt, FaTrophy } from 'react-icons/fa';

export default function YearSelector({ 
  selectedYear, 
  setSelectedYear, 
  availableYears, 
  showAllYears, 
  setShowAllYears, 
  loading 
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-white/60" />
          <span className="text-sm font-medium text-white/80">Select Season:</span>
        </div>
        
        {/* Recent Years (Last 10) */}
        <div className="flex flex-wrap gap-2">
          {availableYears.slice(0, 10).map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedYear === year
                  ? 'bg-yellow-500 text-black shadow-lg ring-2 ring-yellow-400'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
              }`}
              disabled={loading}
            >
              {year}
            </button>
          ))}
          
          {/* Show More/Less Toggle */}
          {availableYears.length > 10 && (
            <>
              <button
                onClick={() => setShowAllYears(!showAllYears)}
                className="px-3 py-2 rounded-full text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/20 transition-all duration-200"
              >
                {showAllYears ? 'Show Less' : `+${availableYears.length - 10} More`}
              </button>
              
              {/* Additional Years */}
              {showAllYears && (
                <div className="w-full flex flex-wrap gap-2 mt-2">
                  {availableYears.slice(10).map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        selectedYear === year
                          ? 'bg-yellow-500 text-black shadow-lg ring-2 ring-yellow-400'
                          : 'bg-white/5 text-white/60 hover:bg-white/15 hover:text-white/80 border border-white/10'
                      }`}
                      disabled={loading}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Current Selection Display */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <FaTrophy className="text-yellow-400" />
          <span>Showing rankings for <span className="text-white font-medium">{selectedYear}</span> season</span>
        </div>
      </div>
    </div>
  );
}
