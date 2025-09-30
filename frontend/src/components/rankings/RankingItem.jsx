import React from 'react';

export default function RankingItem({ 
  position, 
  name, 
  subtitle, 
  score, 
  scoreLabel, 
  key 
}) {
  const getPositionColor = (position) => {
    switch (position) {
      case 1: return 'bg-yellow-500 text-black';
      case 2: return 'bg-gray-400 text-black';
      case 3: return 'bg-amber-600 text-white';
      default: return 'bg-white/10 text-white';
    }
  };

  return (
    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(position)}`}>
          {position}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white">
            {name}
          </div>
          <div className="text-xs text-white/60">
            {subtitle}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-white text-lg">
          {Math.round(score)}
        </div>
        <div className="text-xs text-white/60">{scoreLabel}</div>
      </div>
    </div>
  );
}
