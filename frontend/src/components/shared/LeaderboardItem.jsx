import React from 'react';

/**
 * Shared LeaderboardItem component for displaying rankings/standings
 * with podium highlighting and consistent styling
 */
export default function LeaderboardItem({ 
  position,
  isPodium = false,
  name,
  subtitle,
  score,
  scoreLabel = 'pts',
  extraInfo,
  children
}) {
  const getPositionStyle = (position) => {
    switch (position) {
      case 1: 
        return {
          bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          text: 'text-black',
          icon: '🥇',
          shadow: 'shadow-lg shadow-yellow-500/30'
        };
      case 2: 
        return {
          bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
          text: 'text-black',
          icon: '🥈',
          shadow: 'shadow-lg shadow-gray-400/30'
        };
      case 3: 
        return {
          bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
          text: 'text-white',
          icon: '🥉',
          shadow: 'shadow-lg shadow-amber-600/30'
        };
      default: 
        return {
          bg: 'bg-white/10',
          text: 'text-white',
          icon: null,
          shadow: ''
        };
    }
  };

  const style = getPositionStyle(position);
  const cardClass = isPodium 
    ? 'flex items-center justify-between p-3 rounded-xl bg-white/10 border-2 border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:border-white/30'
    : 'flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors';

  return (
    <div className={cardClass}>
      <div className="flex items-center space-x-3">
        {/* Position Badge */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${style.bg} ${style.text} ${style.shadow}`}>
          {style.icon || position}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className={`font-semibold text-white ${isPodium ? 'text-base' : 'text-sm'}`}>
            {name}
          </div>
          {subtitle && (
            <div className="text-xs text-white/60 mt-0.5">
              {subtitle}
            </div>
          )}
          {extraInfo && (
            <div className="mt-1">
              {extraInfo}
            </div>
          )}
        </div>
      </div>
      
      {/* Score/Points */}
      <div className="text-right">
        <div className={`font-bold text-white ${isPodium ? 'text-xl' : 'text-base'}`}>
          {score}
        </div>
        <div className="text-xs text-white/60 uppercase tracking-wider">{scoreLabel}</div>
      </div>

      {/* Optional custom children */}
      {children}
    </div>
  );
}

