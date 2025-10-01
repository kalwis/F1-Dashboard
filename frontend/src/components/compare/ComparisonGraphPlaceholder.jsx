import React from 'react';

export default function ComparisonGraphPlaceholder() {
  return (
    <div className="mb-8">
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">📈 Elo Performance Comparison</h2>
        <div className="h-96 flex items-center justify-center bg-gradient-to-br from-black/40 to-black/20 rounded-lg border border-white/10">
          <div className="text-center text-white/60">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-xl font-semibold mb-2">Comparison Graph</div>
            <div className="text-sm">Visual ELO comparison will be displayed here</div>
          </div>
        </div>
      </div>
    </div>
  );
}

