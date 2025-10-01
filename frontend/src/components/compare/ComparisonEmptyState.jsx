import React from 'react';

export default function ComparisonEmptyState() {
  return (
    <div className="text-center text-white/60 p-12 py-16 bg-gradient-to-r from-black/20 to-black/10 rounded-xl border border-white/10 backdrop-blur-sm min-h-[400px] flex flex-col justify-center">
      <div className="text-2xl mb-4 font-medium text-white/80">
        Configure your comparison to analyze performance differences
      </div>
      <div className="text-base max-w-2xl mx-auto mb-8 leading-relaxed">
        Select two drivers or constructors to compare their Elo ratings, performance metrics, and career statistics. 
        You can compare competitors from the same season or across different years to see how they stack up.
      </div>

      <div className="flex justify-center gap-6 text-white/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span>Driver Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          <span>Constructor Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>Cross-Era Support</span>
        </div>
      </div>
    </div>
  );
}

