import React, { useState } from 'react';
import { FaCalendarAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function YearSelector({ 
  label, 
  value, 
  onChange, 
  years, 
  className = ""
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleYearSelect = (year) => {
    onChange(year);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
        <FaCalendarAlt className="text-blue-400" />
        {label}
      </label>
      
      {/* Main Year Display */}
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-gray-600 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex items-center justify-between group"
        >
          <span className="font-medium">{value}</span>
          {isDropdownOpen ? (
            <FaChevronUp className="text-blue-400 transition-transform duration-200" />
          ) : (
            <FaChevronDown className="text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
          )}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    value === year
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
