import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaTrash, FaCheck } from 'react-icons/fa';

const TextEditorModal = ({ isOpen, initialText, onClose, onSave }) => {
  const [textContent, setTextContent] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(24);
  const [textFont, setTextFont] = useState('Inter');
  const inputRef = useRef(null);

  // Populate state when initialText prop changes (modal is opened for editing)
  useEffect(() => {
    if (initialText) {
      setTextContent(initialText.text);
      setTextColor(initialText.fill);
      setTextSize(initialText.fontSize);
      setTextFont(initialText.fontFamily);
    } else {
      // Reset state when modal is opened for adding new text
      setTextContent('');
      setTextColor('#000000');
      setTextSize(24);
      setTextFont('Inter');
    }
  }, [initialText]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!textContent.trim()) return;
    
    onSave({
      ...initialText, // Include existing id if editing, or will be added in parent
      text: textContent,
      fill: textColor,
      fontSize: textSize,
      fontFamily: textFont,
    });
  };

  if (!isOpen) return null;

  const fonts = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 
    'Georgia', 'Courier New', 'Verdana', 'Palatino'
  ];

  const presetColors = [
    '#000000', '#FFFFFF', '#E53E3E', '#38A169', 
    '#3182CE', '#D69E2E', '#805AD5', '#DD6B20'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {initialText ? 'Edit Text' : 'Add Text'}
            </h3>
            <button
              onClick={onClose}
              className="btn btn-icon btn-ghost"
              aria-label="Close"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <input
              ref={inputRef}
              type="text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="input w-full text-lg"
              placeholder="Enter your text..."
              style={{ 
                color: textColor,
                fontFamily: textFont,
              }}
            />
          </div>

          {/* Font Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={textFont}
              onChange={(e) => setTextFont(e.target.value)}
              className="input w-full"
              style={{ fontFamily: textFont }}
            >
              {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Size and Color Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={textSize}
                  onChange={(e) => setTextSize(parseInt(e.target.value) || 12)}
                  className="input flex-1"
                  min="8"
                  max="120"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {presetColors.slice(0, 4).map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        textColor === color ? 'border-purple-500' : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setTextColor(color)}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="panel p-4 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Preview
            </p>
            <div className="text-center py-4">
              <span
                style={{
                  color: textColor,
                  fontSize: Math.min(textSize, 48) + 'px',
                  fontFamily: textFont,
                }}
              >
                {textContent || 'Your text will appear here'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              {initialText && (
                <button
                  onClick={() => {
                    onSave({ ...initialText, deleted: true });
                  }}
                  className="btn text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <FaTrash className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={!textContent.trim()}
              >
                <FaCheck className="w-4 h-4" />
                {initialText ? 'Update' : 'Add Text'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditorModal; 