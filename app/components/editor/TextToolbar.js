import React, { useState, useRef, useEffect } from 'react';
import { FaUndo, FaRedo, FaFont, FaMinus, FaPlus, FaPalette, FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl, FaTextWidth, FaEllipsisH, FaArrowsAltH, FaRedoAlt, FaClone, FaTrash, FaLock, FaCopy, FaTextHeight, FaHighlighter, FaLayerGroup } from 'react-icons/fa';
import { HiChevronDown, HiOutlineColorSwatch } from 'react-icons/hi';

const TextToolbar = ({
  undo,
  redo,
  currentStep,
  history = [],
  handleDeleteText,
  selectedText,
  currentTextProps,
  handleFontFamilyChange,
  handleFontSizeChange,
  handleIncreaseFontSize,
  handleDecreaseFontSize,
  handleTextColorChange,
  handleTextStyleToggle,
  handleTextAlignChange,
  handleTextList,
  handleTextSpacing,
  handleTextOpacityChange,
  handleTextRotate,
  handleTextFlip,
  handleTextDuplicate,
  handleTextLock,
  handleTextCopyStyle,
  handleCaseChange,
  handleCurveChange,
}) => {
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showTextColorDropdown, setShowTextColorDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showOpacityDropdown, setShowOpacityDropdown] = useState(false);
  const [showMoreToolsDropdown, setShowMoreToolsDropdown] = useState(false);
  const [opacitySliderValue, setOpacitySliderValue] = useState(1);
  const [customColor, setCustomColor] = useState('#000000');

  const fontDropdownRef = useRef(null);
  const fontSizeDropdownRef = useRef(null);
  const textColorDropdownRef = useRef(null);
  const formatDropdownRef = useRef(null);
  const moreToolsDropdownRef = useRef(null);
  const opacityDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) {
        setShowFontDropdown(false);
      }
      if (fontSizeDropdownRef.current && !fontSizeDropdownRef.current.contains(event.target)) {
        setShowFontSizeDropdown(false);
      }
      if (textColorDropdownRef.current && !textColorDropdownRef.current.contains(event.target)) {
        setShowTextColorDropdown(false);
      }
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target)) {
        setShowFormatDropdown(false);
      }
      if (moreToolsDropdownRef.current && !moreToolsDropdownRef.current.contains(event.target)) {
        setShowMoreToolsDropdown(false);
      }
      if (opacityDropdownRef.current && !opacityDropdownRef.current.contains(event.target)) {
        setShowOpacityDropdown(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedText && typeof currentTextProps.opacity === 'number') {
      setOpacitySliderValue(currentTextProps.opacity);
    } else {
      setOpacitySliderValue(1);
    }
  }, [selectedText, currentTextProps.opacity]);

  const closeAllDropdowns = () => {
    setShowFontDropdown(false);
    setShowFontSizeDropdown(false);
    setShowTextColorDropdown(false);
    setShowFormatDropdown(false);
    setShowOpacityDropdown(false);
    setShowMoreToolsDropdown(false);
  };

  const toggleDropdown = (setter, currentState, event) => {
    event.stopPropagation();
    closeAllDropdowns();
    setter(!currentState);
  };

  const fontFamilies = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Palatino', value: 'Palatino' },
  ];
  
  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96];
  const presetColors = [
    '#000000', '#FFFFFF', '#E53E3E', '#38A169', '#3182CE', '#D69E2E', 
    '#805AD5', '#DD6B20', '#E53E3E', '#38A169', '#3182CE', '#D69E2E',
    '#718096', '#1A202C', '#2D3748', '#4A5568', '#A0AEC0', '#F7FAFC'
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center px-6 py-3">
        {/* Left Section - Font Controls */}
        <div className="flex items-center gap-2">
          {/* Font Family Dropdown */}
          <div className="relative" ref={fontDropdownRef}>
            <button
              className="btn btn-secondary flex items-center gap-2 min-w-[140px] justify-between"
              onClick={(e) => toggleDropdown(setShowFontDropdown, showFontDropdown, e)}
              disabled={!selectedText}
            >
              <span className="truncate" style={{ fontFamily: currentTextProps.fontFamily }}>
                {selectedText ? currentTextProps.fontFamily : 'Font'}
              </span>
              <HiChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>
            {showFontDropdown && (
              <div className="absolute top-full left-0 mt-1 panel w-full min-w-[200px] max-h-[300px] overflow-y-auto z-20 animate-in">
                {fontFamilies.map((font) => (
                  <button
                    key={font.value}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                    onClick={() => {
                      handleFontFamilyChange(font.value);
                      setShowFontDropdown(false);
                    }}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button 
              className="btn btn-icon btn-ghost h-8 w-8" 
              onClick={handleDecreaseFontSize} 
              disabled={!selectedText}
              title="Decrease size"
            >
              <FaMinus className="w-3 h-3" />
            </button>
            
            <div className="relative" ref={fontSizeDropdownRef}>
              <button
                className="px-3 py-1 hover:bg-white rounded text-sm font-medium min-w-[50px] transition-colors"
                onClick={(e) => toggleDropdown(setShowFontSizeDropdown, showFontSizeDropdown, e)}
                disabled={!selectedText}
              >
                {selectedText ? currentTextProps.fontSize : 'Size'}
              </button>
              {showFontSizeDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 panel w-[100px] max-h-[300px] overflow-y-auto z-20 animate-in">
                  <input
                    type="number"
                    className="input mb-2"
                    placeholder="Custom"
                    value={selectedText ? currentTextProps.fontSize : ''}
                    onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 12)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="space-y-1">
                    {fontSizes.map((size) => (
                      <button
                        key={size}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-sm rounded transition-colors"
                        onClick={() => {
                          handleFontSizeChange(size);
                          setShowFontSizeDropdown(false);
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="btn btn-icon btn-ghost h-8 w-8" 
              onClick={handleIncreaseFontSize} 
              disabled={!selectedText}
              title="Increase size"
            >
              <FaPlus className="w-3 h-3" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 mx-2" />

          {/* Text Color */}
          <div className="relative" ref={textColorDropdownRef}>
            <button
              className="btn btn-icon relative"
              onClick={(e) => toggleDropdown(setShowTextColorDropdown, showTextColorDropdown, e)}
              disabled={!selectedText}
              title="Text color"
            >
              <HiOutlineColorSwatch className="w-4 h-4" />
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full"
                style={{ backgroundColor: currentTextProps.fill || '#000000' }}
              />
            </button>
            {showTextColorDropdown && (
              <div className="absolute top-full left-0 mt-1 panel p-3 z-20 animate-in">
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleTextColorChange(color);
                        setShowTextColorDropdown(false);
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      handleTextColorChange(e.target.value);
                    }}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      handleTextColorChange(e.target.value);
                    }}
                    className="input flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Style Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`btn btn-icon btn-ghost h-8 w-8 ${selectedText && currentTextProps.fontStyle?.includes('bold') ? 'bg-white shadow-sm' : ''}`}
              onClick={() => handleTextStyleToggle('bold')}
              disabled={!selectedText}
              title="Bold"
            >
              <FaBold className="w-3.5 h-3.5" />
            </button>
            <button
              className={`btn btn-icon btn-ghost h-8 w-8 ${selectedText && currentTextProps.fontStyle?.includes('italic') ? 'bg-white shadow-sm' : ''}`}
              onClick={() => handleTextStyleToggle('italic')}
              disabled={!selectedText}
              title="Italic"
            >
              <FaItalic className="w-3.5 h-3.5" />
            </button>
            <button
              className={`btn btn-icon btn-ghost h-8 w-8 ${selectedText && currentTextProps.fontStyle?.includes('underline') ? 'bg-white shadow-sm' : ''}`}
              onClick={() => handleTextStyleToggle('underline')}
              disabled={!selectedText}
              title="Underline"
            >
              <FaUnderline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 mx-2" />

          {/* Alignment */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`btn btn-icon btn-ghost h-8 w-8 ${selectedText && currentTextProps.align === 'left' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => handleTextAlignChange('left')}
              disabled={!selectedText}
              title="Align left"
            >
              <FaAlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              className={`btn btn-icon btn-ghost h-8 w-8 ${selectedText && currentTextProps.align === 'center' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => handleTextAlignChange('center')}
              disabled={!selectedText}
              title="Align center"
            >
              <FaAlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              className={`btn btn-icon btn-ghost h-8 w-8 ${selectedText && currentTextProps.align === 'right' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => handleTextAlignChange('right')}
              disabled={!selectedText}
              title="Align right"
            >
              <FaAlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Advanced Format Options */}
          <div className="relative" ref={formatDropdownRef}>
            <button
              className="btn btn-secondary"
              onClick={(e) => toggleDropdown(setShowFormatDropdown, showFormatDropdown, e)}
              disabled={!selectedText}
            >
              <FaTextHeight className="w-4 h-4" />
              <span>Format</span>
              <HiChevronDown className="w-4 h-4" />
            </button>
            {showFormatDropdown && (
              <div className="absolute top-full left-0 mt-1 panel w-[200px] z-20 animate-in">
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">Text Case</p>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm rounded transition-colors" onClick={() => { handleCaseChange('mixedcase'); setShowFormatDropdown(false); }}>Mixed Case</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm rounded transition-colors" onClick={() => { handleCaseChange('lowercase'); setShowFormatDropdown(false); }}>lowercase</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm rounded transition-colors" onClick={() => { handleCaseChange('uppercase'); setShowFormatDropdown(false); }}>UPPERCASE</button>
                  
                  <div className="border-t border-gray-200 my-2" />
                  
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">Text Curve</p>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm rounded transition-colors" onClick={() => { handleCurveChange('fullCurveUp'); setShowFormatDropdown(false); }}>⌒ Full Curve Up</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm rounded transition-colors" onClick={() => { handleCurveChange('slightCurveUp'); setShowFormatDropdown(false); }}>⌒ Slight Curve Up</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm rounded transition-colors" onClick={() => { handleCurveChange('straight'); setShowFormatDropdown(false); }}>— Straight</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm rounded transition-colors" onClick={() => { handleCurveChange('slightCurveDown'); setShowFormatDropdown(false); }}>⌄ Slight Curve Down</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm rounded transition-colors" onClick={() => { handleCurveChange('fullCurveDown'); setShowFormatDropdown(false); }}>⌄ Full Curve Down</button>
                </div>
              </div>
            )}
          </div>

          {/* Opacity */}
          <div className="relative" ref={opacityDropdownRef}>
            <button
              className="btn btn-icon"
              onClick={(e) => toggleDropdown(setShowOpacityDropdown, showOpacityDropdown, e)}
              disabled={!selectedText}
              title="Opacity"
            >
              <FaLayerGroup className="w-4 h-4" />
            </button>
            {showOpacityDropdown && (
              <div className="absolute top-full left-0 mt-1 panel p-4 w-[200px] z-20 animate-in">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Opacity</label>
                  <span className="text-xs text-gray-500 font-mono">
                    {Math.round(opacitySliderValue * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={opacitySliderValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setOpacitySliderValue(val);
                    handleTextOpacityChange(val);
                  }}
                  className="w-full mb-3"
                />
                <div className="grid grid-cols-4 gap-1">
                  {[100, 75, 50, 25].map((val) => (
                    <button
                      key={val}
                      className="py-1 text-xs hover:bg-gray-50 rounded transition-colors"
                      onClick={() => {
                        const opacity = val / 100;
                        setOpacitySliderValue(opacity);
                        handleTextOpacityChange(opacity);
                      }}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="ml-auto flex items-center gap-2">
          {/* More Options */}
          <div className="relative" ref={moreToolsDropdownRef}>
            <button
              className="btn btn-icon btn-ghost"
              onClick={(e) => toggleDropdown(setShowMoreToolsDropdown, showMoreToolsDropdown, e)}
              disabled={!selectedText}
              title="More options"
            >
              <FaEllipsisH className="w-4 h-4" />
            </button>
            {showMoreToolsDropdown && (
              <div className="absolute top-full right-0 mt-1 panel w-[180px] z-20 animate-in">
                <button 
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors flex items-center gap-3" 
                  onClick={() => { handleTextDuplicate(); setShowMoreToolsDropdown(false); }}
                >
                  <FaClone className="w-4 h-4 text-gray-500" />
                  Duplicate
                </button>
                <button 
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors flex items-center gap-3" 
                  onClick={() => { handleTextLock(); setShowMoreToolsDropdown(false); }}
                >
                  <FaLock className="w-4 h-4 text-gray-500" />
                  Lock
                </button>
                <button 
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors flex items-center gap-3" 
                  onClick={() => { handleTextCopyStyle(); setShowMoreToolsDropdown(false); }}
                >
                  <FaCopy className="w-4 h-4 text-gray-500" />
                  Copy Style
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button 
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors flex items-center gap-3" 
                  onClick={() => { handleDeleteText(selectedText); setShowMoreToolsDropdown(false); }}
                >
                  <FaTrash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>

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

export default TextToolbar;