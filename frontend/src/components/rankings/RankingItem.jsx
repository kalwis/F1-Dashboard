import React from 'react';
import LeaderboardItem from '../shared/LeaderboardItem';

export default function RankingItem({ 
  position, 
  name, 
  subtitle, 
  score, 
  scoreLabel, 
  isPodium = false,
  key 
}) {
  return (
    <LeaderboardItem
      key={key}
      position={position}
      isPodium={isPodium}
      name={name}
      subtitle={subtitle}
      score={Math.round(score)}
      scoreLabel={scoreLabel}
    />
  );
}
