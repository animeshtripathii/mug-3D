import React from 'react';

const GraphicsItem = ({ thumbnail, label, onAdd, onDragStart }) => (
  <div
    className="flex flex-col items-center cursor-pointer p-3 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
    draggable
    onClick={onAdd}
    onDragStart={onDragStart}
    title={label}
    tabIndex={0}
    role="button"
    aria-label={label}
  >
    <div className="w-16 h-16 flex items-center justify-center mb-2 bg-white rounded-lg border border-gray-200 group-hover:border-purple-300 group-hover:shadow-md transition-all duration-200">
      <div className="text-gray-600 group-hover:text-purple-600 transition-colors">
        {thumbnail}
      </div>
    </div>
    <span className="text-xs font-medium text-gray-700 text-center truncate w-full px-1 group-hover:text-purple-700 transition-colors">
      {label}
    </span>
  </div>
);

export default GraphicsItem; 