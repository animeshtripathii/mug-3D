'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { FaTimes, FaMobileAlt } from 'react-icons/fa';

export default function ARQRModal({ isOpen, onClose, arURL }) {
  const [qrCodeURL, setQRCodeURL] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async (url) => {
    try {
      setIsGenerating(true);
      setError('');

      // Log the URL we're trying to encode
      console.log('Generating QR code for URL:', url);

      // Simple QR code options
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 4,
        errorCorrectionLevel: 'M'
      });

      console.log('QR code generated successfully');
      setQRCodeURL(qrDataUrl);
    } catch (err) {
      console.error('QR Code generation error:', err);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen && arURL) {
      generateQRCode(arURL);
    } else {
      setQRCodeURL('');
      setError('');
      setIsGenerating(false);
    }
  }, [isOpen, arURL]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaMobileAlt className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">View in AR</h3>
          <p className="text-gray-600 mb-6">
            Scan this QR code with your mobile device to view your mug design in augmented reality
          </p>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl shadow-lg inline-block mb-6">
            <div className="w-64 h-64 flex items-center justify-center">
              {error ? (
                <div className="bg-red-50 rounded-lg flex items-center justify-center p-4 w-full h-full">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              ) : isGenerating ? (
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent" />
              ) : qrCodeURL ? (
                <img
                  src={qrCodeURL}
                  alt="AR QR Code"
                  className="w-full h-full object-contain"
                  onError={() => {
                    setError('Failed to load QR code image');
                  }}
                />
              ) : (
                <p className="text-gray-500 text-sm">Preparing QR code...</p>
              )}
            </div>
          </div>

          {/* Instructions or Retry */}
          {error ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                There was an error generating the QR code. Please try again.
              </p>
              <button
                onClick={() => generateQRCode(arURL)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500 space-y-2">
              <p>1. Open your camera app on your mobile device</p>
              <p>2. Point it at the QR code</p>
              <p>3. Tap the link that appears</p>
              <p>4. Allow camera access to view in AR</p>
              {arURL && (
                <p className="mt-4 text-xs text-gray-400">
                  Direct link:{' '}
                  <a
                    href={arURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline break-all"
                  >
                    {arURL}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 