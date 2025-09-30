import React from 'react';

export default function ToggleSwitch({ 
  isOn, 
  onToggle, 
  label, 
  description, 
  className = "" 
}) {
  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border border-gray-600 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-medium">{label}</div>
          {description && (
            <div className="text-sm text-gray-400">{description}</div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isOn ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isOn ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
