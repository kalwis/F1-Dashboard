import React from 'react';
import DashboardCard from '../layout/DashboardCard';

export default function SeasonSelector({ selectedYear, setSelectedYear }) {
  // Generate years from 2025 down to 1950 (F1 started in 1950)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  return (
    <DashboardCard title="📅 Select Season">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {years.slice(0, 8).map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              selectedYear === year
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
      <div className="text-center">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
        >
          <option value="" className="bg-gray-800 text-white">Select a year...</option>
          {years.map(year => (
            <option key={year} value={year} className="bg-gray-800 text-white">
              {year}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-white/70 text-center mt-3">
        Choose a season to filter data. Availability varies by year.
      </p>
    </DashboardCard>
  );
}
