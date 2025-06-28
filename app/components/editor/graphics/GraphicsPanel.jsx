import React from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';

const GraphicsPanel = ({ visible, onClose, searchValue, onSearchChange, children }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-white border-b border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Graphics Library</h2>
              <p className="text-xs text-gray-500 mt-1">Add shapes and icons to your design</p>
            </div>
            <button
              className="btn btn-icon btn-ghost"
              onClick={onClose}
              aria-label="Close"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search graphics..."
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className="input pl-10 w-full"
              autoFocus
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GraphicsPanel; 