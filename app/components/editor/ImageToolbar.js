import React from 'react';
import { FaCrop, FaMagic, FaSync, FaSlidersH, FaImage, FaUndo, FaRedo, FaTrash, FaCheck, FaTimes, FaExpand } from 'react-icons/fa';
import { HiAdjustments, HiColorSwatch } from 'react-icons/hi';

const ImageToolbar = ({
  selectedTool,
  handleToolSelect,
  handleReplace,
  handleRemoveBG,
  removeBgLoading,
  showAdjustDropdown,
  setShowAdjustDropdown,
  adjustDropdownRef,
  isAdjusting,
  tempAdjustments,
  brightness,
  contrast,
  saturation,
  hue,
  setBrightness,
  setContrast,
  setSaturation,
  setHue,
  handleSliderChange,
  handleSliderRelease,
  image,
  undo,
  redo,
  currentStep,
  history,
  applyCrop,
  handleDeleteText,
  selectedText,
}) => {
  // Reset all adjustments
  const handleResetAdjustments = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setHue(0);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Tools */}
        <div className="flex items-center gap-2">
          {/* Tool Group 1: Selection & Edit */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
            <button 
              className={`btn btn-icon ${selectedTool === 'select' ? 'bg-purple-100 text-purple-700' : 'btn-ghost'}`} 
              title="Select" 
              onClick={() => handleToolSelect('select')}
            >
              <FaExpand className="w-4 h-4" />
            </button>
            <button 
              className={`btn btn-icon ${selectedTool === 'replace' ? 'bg-purple-100 text-purple-700' : 'btn-ghost'}`} 
              title="Replace Image" 
              onClick={handleReplace}
            >
              <FaSync className="w-4 h-4" />
            </button>
          </div>

          {/* Tool Group 2: Image Editing */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
            <button 
              className={`btn btn-icon ${selectedTool === 'crop' ? 'bg-purple-100 text-purple-700' : 'btn-ghost'}`} 
              title="Crop" 
              onClick={() => handleToolSelect('crop')}
            >
              <FaCrop className="w-4 h-4" />
            </button>
            <button 
              className="btn btn-icon btn-ghost relative" 
              title="Remove Background" 
              onClick={handleRemoveBG} 
              disabled={removeBgLoading || !image}
            >
              <FaMagic className="w-4 h-4" />
              {removeBgLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <div className="loading-spinner w-4 h-4"></div>
                </div>
              )}
            </button>
            
            {/* Adjust Dropdown */}
            <div className="relative">
              <button
                className={`btn btn-icon ${showAdjustDropdown ? 'bg-purple-100 text-purple-700' : 'btn-ghost'}`}
                title="Adjust"
                onClick={() => setShowAdjustDropdown(!showAdjustDropdown)}
                disabled={!image}
              >
                <HiAdjustments className="w-4 h-4" />
              </button>
              
              {/* Adjustment Dropdown */}
              {showAdjustDropdown && (
                <div ref={adjustDropdownRef} className="absolute top-full left-0 mt-2 panel p-4 z-20 w-80 animate-in">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Image Adjustments</h3>
                  
                  <div className="space-y-4">
                    {/* Brightness */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Brightness</label>
                        <span className="text-xs text-gray-500 font-mono">
                          {isAdjusting ? tempAdjustments.brightness : brightness}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={isAdjusting ? tempAdjustments.brightness : brightness}
                        onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
                        onMouseUp={handleSliderRelease}
                        onTouchEnd={handleSliderRelease}
                        className="w-full"
                        disabled={!image}
                      />
                    </div>
                    
                    {/* Contrast */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Contrast</label>
                        <span className="text-xs text-gray-500 font-mono">
                          {isAdjusting ? tempAdjustments.contrast : contrast}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={isAdjusting ? tempAdjustments.contrast : contrast}
                        onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
                        onMouseUp={handleSliderRelease}
                        onTouchEnd={handleSliderRelease}
                        className="w-full"
                        disabled={!image}
                      />
                    </div>
                    
                    {/* Saturation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Saturation</label>
                        <span className="text-xs text-gray-500 font-mono">
                          {isAdjusting ? tempAdjustments.saturation : saturation}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={isAdjusting ? tempAdjustments.saturation : saturation}
                        onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value))}
                        onMouseUp={handleSliderRelease}
                        onTouchEnd={handleSliderRelease}
                        className="w-full"
                        disabled={!image}
                      />
                    </div>
                    
                    {/* Hue */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Hue</label>
                        <span className="text-xs text-gray-500 font-mono">
                          {isAdjusting ? tempAdjustments.hue : hue}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={isAdjusting ? tempAdjustments.hue : hue}
                        onChange={(e) => handleSliderChange('hue', parseInt(e.target.value))}
                        onMouseUp={handleSliderRelease}
                        onTouchEnd={handleSliderRelease}
                        className="w-full"
                        disabled={!image}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button 
                      className="btn btn-secondary btn-sm w-full"
                      onClick={handleResetAdjustments}
                      disabled={!image}
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              className={`btn btn-icon ${selectedTool === 'erase' ? 'bg-purple-100 text-purple-700' : 'btn-ghost'}`} 
              title="Erase" 
              onClick={() => handleToolSelect('erase')}
              disabled
            >
              <HiColorSwatch className="w-4 h-4" />
            </button>
          </div>

          {/* Crop Actions (Conditional) */}
          {selectedTool === 'crop' && (
            <div className="flex items-center gap-2 animate-in">
              <button 
                className="btn btn-primary"
                onClick={applyCrop}
              >
                <FaCheck className="w-3.5 h-3.5" />
                Apply Crop
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => handleToolSelect('select')}
              >
                <FaTimes className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Delete Button (for selected text) */}
          {selectedText && (
            <button
              onClick={() => handleDeleteText(selectedText)}
              className="btn btn-icon text-red-600 hover:bg-red-50 hover:text-red-700 animate-in"
              title="Delete selected text"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}

          {/* History Controls */}
          <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
            <button
              onClick={undo}
              disabled={currentStep <= 0}
              className="btn btn-icon btn-ghost"
              title="Undo"
            >
              <FaUndo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={currentStep >= history.length - 1}
              className="btn btn-icon btn-ghost"
              title="Redo"
            >
              <FaRedo className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToolbar; 