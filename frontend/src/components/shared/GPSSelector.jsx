import React from 'react';
import { FaFlagCheckered } from 'react-icons/fa';

export default function GPSSelector({ 
  selectedGP, 
  setSelectedGP, 
  availableGPs, 
  loading 
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FaFlagCheckered className="text-white/60" />
          <span className="text-sm font-medium text-white/80">Select Grand Prix:</span>
        </div>
        
        {/* GP Pills */}
        <div className="flex flex-wrap gap-2">
          {availableGPs.map((gp) => (
            <button
              key={gp}
              onClick={() => setSelectedGP(gp)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedGP === gp
                  ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-400'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
              }`}
              disabled={loading}
            >
              {gp} GP
            </button>
          ))}
        </div>
        
        {/* Current Selection Display */}
        {selectedGP && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <FaFlagCheckered className="text-blue-400" />
            <span>Showing predictions for <span className="text-white font-medium">{selectedGP} GP</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
