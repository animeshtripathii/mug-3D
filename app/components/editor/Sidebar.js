import React, { useRef, useState } from 'react';
import GraphicsButton from './graphics/GraphicsButton';
import QRCode from 'qrcode';
import { FaImage, FaFont, FaShapes, FaQrcode, FaTable, FaUpload, FaPlus, FaSearch, FaMagic } from 'react-icons/fa';
import { HiPhotograph, HiSparkles } from 'react-icons/hi';

const Sidebar = ({ onImageUpload, recentImages, onToolSelect }) => {
  const fileInputRef = useRef();
  const [showQRPanel, setShowQRPanel] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [activeTab, setActiveTab] = useState('images');

  const handleUploadClick = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e);
    }
  };

  const handleGenerateQR = async () => {
    if (!qrUrl) return alert('Please enter a valid URL');
    try {
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      onImageUpload({ target: { files: [null], recent: dataUrl } });
      setQrUrl('');
      setShowQRPanel(false);
    } catch (err) {
      console.error('QR Code generation failed:', err);
      alert('Failed to generate QR Code.');
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'qr') {
      setShowQRPanel(true);
      onToolSelect('select');
    } else {
      setShowQRPanel(false);
      onToolSelect(tab === 'images' ? 'select' : tab === 'text' ? 'text' : tab === 'graphics' ? 'graphics' : 'select');
    }
  };

  const acceptedFileTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
    'image/svg+xml', 'image/heic', 'application/pdf', 'image/vnd.adobe.photoshop',
    'application/postscript', 'application/illustrator', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/tiff'
  ].join(',');

  const tabs = [
    { id: 'images', label: 'Images', icon: FaImage },
    { id: 'text', label: 'Text', icon: FaFont },
    { id: 'graphics', label: 'Graphics', icon: FaShapes },
    { id: 'qr', label: 'QR Code', icon: FaQrcode },
    { id: 'tables', label: 'Tables', icon: FaTable, disabled: true },
  ];

  return (
    <aside className="w-80 bg-white h-full shadow-xl flex flex-col border-r border-gray-200">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Design Elements</h2>
        <p className="text-xs text-gray-500">Add elements to your mug design</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex px-3 pt-3 pb-2 gap-1 bg-gray-50 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg transition-all text-xs font-medium
              ${activeTab === tab.id 
                ? 'bg-white text-purple-700 shadow-sm border border-gray-200' 
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            disabled={tab.disabled}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* QR Code Panel */}
        {showQRPanel && activeTab === 'qr' && (
          <div className="p-5 space-y-4 animate-in">
            <div className="panel p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Content
                </label>
                <input
                  type="text"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  className="input"
                  placeholder="https://example.com"
                />
                <p className="mt-1 text-xs text-gray-500">Enter URL, text, or any content</p>
              </div>
              <button
                onClick={handleGenerateQR}
                className="btn btn-primary w-full"
              >
                <FaQrcode className="w-4 h-4" />
                Generate QR Code
              </button>
            </div>
          </div>
        )}

        {/* Images Panel */}
        {activeTab === 'images' && (
          <div className="p-5 space-y-5 animate-in">
            {/* Upload Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload Image</h3>
              <input
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                multiple={false}
                id="sidebar-image-upload"
              />
              <button
                className="w-full btn btn-primary group"
                onClick={handleUploadClick}
                type="button"
              >
                <FaUpload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Upload from Device
              </button>
              <p className="mt-2 text-xs text-gray-500 text-center">
                JPG, PNG, SVG, PDF, and more
              </p>
            </div>

            {/* AI Generation (Placeholder) */}
            <div className="panel p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <HiSparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">AI Image Generation</h3>
              </div>
              <p className="text-xs text-gray-600 mb-3">Create unique images with AI</p>
              <button className="btn btn-secondary w-full" disabled>
                <FaMagic className="w-4 h-4" />
                Coming Soon
              </button>
            </div>

            {/* Recent Images */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Uploads</h3>
              <div className="grid grid-cols-3 gap-2">
                {recentImages && recentImages.length > 0 ? (
                  recentImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                      onClick={() => onImageUpload({ target: { files: [null], recent: img } })}
                    >
                      <img
                        src={img}
                        alt={`recent-${idx}`}
                        className="w-full h-20 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <FaPlus className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-400">
                    <HiPhotograph className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent images</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Images Section (Placeholder) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Stock Images</h3>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search millions of images..."
                  className="input pl-10"
                  disabled
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">Premium feature - Coming soon</p>
            </div>
          </div>
        )}

        {/* Other tab contents */}
        {activeTab === 'text' && (
          <div className="p-5 text-center text-gray-500 animate-in">
            <FaFont className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select text tool from the toolbar</p>
          </div>
        )}

        {activeTab === 'graphics' && (
          <div className="p-5 text-center text-gray-500 animate-in">
            <FaShapes className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Click graphics tool to add shapes</p>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="p-5 text-center text-gray-500 animate-in">
            <FaTable className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Tables Coming Soon</p>
            <p className="text-xs mt-1">Create custom tables for your designs</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
