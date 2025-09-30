import React from 'react';
import DashboardCard from '../layout/DashboardCard';

export default function ComparisonTypeSelector({ comparisonType, setComparisonType }) {
  return (
    <DashboardCard title="🔍 Comparison Type">
      <div className="flex flex-col gap-3 mb-4">
        <button
          onClick={() => setComparisonType('driver-vs-driver')}
          className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
            comparisonType === 'driver-vs-driver'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
          }`}
        >
          🏎️ Driver vs Driver
        </button>
        <button
          onClick={() => setComparisonType('constructor-vs-constructor')}
          className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
            comparisonType === 'constructor-vs-constructor'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20'
          }`}
        >
          🏁 Constructor vs Constructor
        </button>
      </div>
      <p className="text-xs text-white/70 text-center">
        Choose comparison type. Each provides different insights and metrics.
      </p>
    </DashboardCard>
  );
}
