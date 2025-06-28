import React, { useState, useRef } from 'react';
import { 
  FaAlignCenter, FaLayerGroup, FaClone, FaTrash, FaLock, 
  FaEllipsisH, FaBorderStyle, FaArrowsAlt, FaUndo
} from 'react-icons/fa';

const GraphicsToolbar = ({
  selectedGraphic,
  onDuplicate,
  onDelete,
  onLock,
  onOpacityChange,
  onBorderWidthChange,
  onCenter,
  onMiddle,
  onArrangeLayer,
  opacity = 100,
  borderWidth = 0,
}) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showArrangeMenu, setShowArrangeMenu] = useState(false);
  const [showOpacityMenu, setShowOpacityMenu] = useState(false);
  const [showBorderMenu, setShowBorderMenu] = useState(false);
  const moreOptionsRef = useRef(null);
  const arrangeMenuRef = useRef(null);
  const opacityMenuRef = useRef(null);
  const borderMenuRef = useRef(null);

  if (!selectedGraphic) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center px-4 py-2">
        {/* Color Controls */}
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 rounded-lg border-2 border-white hover:border-gray-200 transition-colors"
            style={{ backgroundColor: '#FFFFFF' }}
          />
          <button
            className="w-8 h-8 rounded-lg border-2 border-white hover:border-gray-200 transition-colors"
            style={{ backgroundColor: '#4A4AFF' }}
          />
          <div className="relative">
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
              onClick={() => setShowBorderMenu(!showBorderMenu)}
            >
              <span className="text-sm font-medium">{borderWidth}</span>
            </button>
            {showBorderMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] z-20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Border width</span>
                  <input
                    type="number"
                    value={borderWidth}
                    onChange={(e) => onBorderWidthChange(parseInt(e.target.value) || 0)}
                    className="w-16 text-right border rounded px-1"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={borderWidth}
                  onChange={(e) => onBorderWidthChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {[0, 1, 2, 4, 8].map((width) => (
                    <button
                      key={width}
                      className="py-1 px-2 text-xs hover:bg-gray-50 rounded"
                      onClick={() => {
                        onBorderWidthChange(width);
                        setShowBorderMenu(false);
                      }}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-2" />

        {/* Opacity Control */}
        <div className="relative" ref={opacityMenuRef}>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowOpacityMenu(!showOpacityMenu)}
          >
            <FaLayerGroup className="w-4 h-4" />
            <span className="text-sm">Opacity</span>
          </button>
          {showOpacityMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[240px] z-20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Opacity</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onOpacityChange(100)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaUndo className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={opacity}
                    onChange={(e) => onOpacityChange(parseInt(e.target.value) || 0)}
                    className="w-16 text-right border rounded px-1"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => onOpacityChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Arrange Button */}
        <div className="relative" ref={arrangeMenuRef}>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowArrangeMenu(!showArrangeMenu)}
          >
            <FaArrowsAlt className="w-4 h-4" />
            <span className="text-sm">Arrange</span>
          </button>
          {showArrangeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-20">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                onClick={() => { onArrangeLayer('front'); setShowArrangeMenu(false); }}
              >
                Bring to Front
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                onClick={() => { onArrangeLayer('forward'); setShowArrangeMenu(false); }}
              >
                Bring Forward
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                onClick={() => { onArrangeLayer('backward'); setShowArrangeMenu(false); }}
              >
                Send Backward
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                onClick={() => { onArrangeLayer('back'); setShowArrangeMenu(false); }}
              >
                Send to Back
              </button>
            </div>
          )}
        </div>

        {/* More Options */}
        <div className="relative ml-auto" ref={moreOptionsRef}>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
          >
            <FaEllipsisH className="w-4 h-4" />
          </button>
          {showMoreOptions && (
            <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-20">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-3"
                onClick={() => { onDuplicate(); setShowMoreOptions(false); }}
              >
                <FaClone className="w-4 h-4 text-gray-500" />
                Duplicate
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-3"
                onClick={() => { onLock(); setShowMoreOptions(false); }}
              >
                <FaLock className="w-4 h-4 text-gray-500" />
                Lock
              </button>
              <div className="border-t border-gray-200 my-1" />
              <button
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-3"
                onClick={() => { onDelete(); setShowMoreOptions(false); }}
              >
                <FaTrash className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphicsToolbar; 