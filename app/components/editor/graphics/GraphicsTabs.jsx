import React from 'react';
import { FaShapes, FaIcons, FaImage } from 'react-icons/fa';

const tabList = [
  { key: 'shapes', label: 'Shapes', icon: FaShapes },
  { key: 'icons', label: 'Icons', icon: FaIcons },
  { key: 'clipart', label: 'Clipart', icon: FaImage },
];

const GraphicsTabs = ({ currentTab, onTabChange, children }) => (
  <div className="flex flex-col h-full">
    <div className="flex gap-1 p-3 bg-gray-50 border-b border-gray-200">
      {tabList.map(tab => (
        <button
          key={tab.key}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all text-sm font-medium
            ${currentTab === tab.key 
              ? 'bg-white text-purple-700 shadow-sm border border-gray-200' 
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
            }
          `}
          onClick={() => onTabChange(tab.key)}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </div>
);

export default GraphicsTabs; 