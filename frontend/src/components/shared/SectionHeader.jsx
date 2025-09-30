import React from 'react';

export default function SectionHeader({ 
  icon, 
  title, 
  subtitle, 
  className = "" 
}) {
  return (
    <h3 className={`text-lg font-semibold text-white mb-4 flex items-center gap-2 ${className}`}>
      {icon && <span>{icon}</span>}
      {title}
      {subtitle && (
        <span className="text-sm text-gray-400 font-normal">
          {subtitle}
        </span>
      )}
    </h3>
  );
}

