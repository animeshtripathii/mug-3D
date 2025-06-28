import React from 'react';
import { FaShapes } from 'react-icons/fa';

const GraphicsButton = ({ active, onClick }) => (
  <button
    className={`
      w-full text-left font-medium py-3 px-4 rounded-lg flex items-center gap-3 transition-all
      ${active 
        ? 'bg-purple-100 text-purple-700' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }
    `}
    onClick={onClick}
    type="button"
  >
    <FaShapes className="w-4 h-4" />
    <span>Graphics</span>
  </button>
);

export default GraphicsButton; 