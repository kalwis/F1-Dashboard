import React from 'react';

export default function SearchableSelector({
  label,
  placeholder,
  searchValue,
  onSearchChange,
  items,
  selectedValue,
  onSelect,
  selectedColor = 'blue',
  showCode = false,
  emptyMessage = "No items found"
}) {
  const getSelectedColorClasses = (isSelected) => {
    if (!isSelected) return 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600';
    
    const colorMap = {
      blue: 'bg-blue-600 text-white border-2 border-blue-400',
      red: 'bg-red-600 text-white border-2 border-red-400',
      green: 'bg-green-600 text-white border-2 border-green-400',
      purple: 'bg-purple-600 text-white border-2 border-purple-400'
    };
    
    return colorMap[selectedColor] || colorMap.blue;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">
        {label}
      </label>
      <div className="space-y-3">
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        <div className="max-h-48 overflow-y-auto space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full p-3 rounded-lg text-left transition-all ${getSelectedColorClasses(selectedValue === item.id)}`}
            >
              <div className="font-medium">{item.name}</div>
              {showCode && item.code && (
                <div className="text-sm text-gray-400">({item.code})</div>
              )}
            </button>
          ))}
          {items.length === 0 && searchValue && (
            <div className="text-center text-gray-400 py-4">{emptyMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
