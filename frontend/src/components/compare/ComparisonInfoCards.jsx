import React from 'react';

export default function ComparisonInfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/20">
        <div className="text-blue-400 text-2xl mb-2">🏎️</div>
        <h3 className="text-white font-semibold mb-1 text-sm">Driver Comparison</h3>
        <p className="text-blue-300/60 text-xs">
          Compare individual driver performances, Elo ratings, and head-to-head statistics
        </p>
      </div>
      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-xl border border-purple-500/20">
        <div className="text-purple-400 text-2xl mb-2">🏁</div>
        <h3 className="text-white font-semibold mb-1 text-sm">Constructor Analysis</h3>
        <p className="text-purple-300/60 text-xs">
          Analyze team performance, constructor Elo ratings, and historical achievements
        </p>
      </div>
      <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 rounded-xl border border-green-500/20">
        <div className="text-green-400 text-2xl mb-2">📊</div>
        <h3 className="text-white font-semibold mb-1 text-sm">Cross-Era Comparison</h3>
        <p className="text-green-300/60 text-xs">
          Enable "Use different years" to compare legends across different F1 eras
        </p>
      </div>
    </div>
  );
}

