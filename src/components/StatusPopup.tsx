/**
 * Status Popup Component - Enhanced Version
 * Modern, animated popup สำหรับแสดง status ของการยกยอ
 */

import React, { useState, useEffect } from 'react';

interface StatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pondId: number;
  currentStatus: number;
  onStatusComplete?: () => void;
}

const StatusPopup: React.FC<StatusPopupProps> = ({
  isOpen,
  onClose,
  pondId,
  currentStatus,
  onStatusComplete
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Status messages mapping (ปรับลำดับให้ตรงกับที่ต้องการ)
  const statusMessages = {
    1: 'Camera is being prepared....',
    2: 'Beginning to raise the lift net....',
    3: 'Successfully captured....',
    4: 'Please wait while the data is being prepared....',
    5: 'กำAI processing in progress. Please wait 1 minute!!....'
  };

  // Enhanced status icons with animations
  const statusIcons = {
    1: '🚀',
    2: '📸',
    3: '✨',
    4: '⚡',
    5: '🎊'
  };

  // Modern gradient colors
  const statusGradients = {
    1: 'from-indigo-500 via-purple-500 to-pink-500',
    2: 'from-blue-500 via-cyan-500 to-teal-500',
    3: 'from-emerald-500 via-green-500 to-lime-500',
    4: 'from-amber-500 via-orange-500 to-red-500',
    5: 'from-green-400 via-emerald-500 to-teal-600'
  };

  // Status descriptions (ปรับให้สอดคล้องกับข้อความด้านบน)
  const statusDescriptions = {
    1: 'Camera is being prepared.',
    2: 'Beginning to raise the lift net.',
    3: 'Successfully captured.',
    4: 'Please wait while the data is being prepared.',
    5: 'AI processing in progress. Please wait 1 minute!!'
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
    setStatus(currentStatus);
    
    // Check if status is completed
    if (currentStatus === 5) {
      setIsCompleted(true);
      // Auto close after 4 seconds when completed
      setTimeout(() => {
        onStatusComplete?.();
        onClose();
      }, 4000);
    }
  }, [currentStatus, onClose, onStatusComplete, isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Enhanced backdrop with blur and gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/30 to-black/70 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Main popup container with enhanced animations and responsive sizing */}
      <div className={`relative transform transition-all duration-500 ${
        isVisible ? 'scale-100 rotate-0' : 'scale-95 rotate-3'
      }`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-[90vw] max-w-lg mx-4 border border-white/20 overflow-hidden max-h-[90vh] flex flex-col">
          {/* Close button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 transition-all duration-200 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enhanced content area with scrollable content */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
            <div className="text-center">
              {/* Status message with animation */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="inline-block">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 animate-pulse">
                    {statusMessages[status as keyof typeof statusMessages]}
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping delay-100" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping delay-200" />
                  </div>
                </div>
              </div>

              {/* Enhanced progress bar */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                    <div 
                      className={`h-3 sm:h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                        status === 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                        status === 2 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        status === 3 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                        status === 4 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        'bg-gradient-to-r from-green-400 to-emerald-500'
                      }`}
                      style={{ width: `${(status / 5) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2 sm:mt-3">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        step <= status 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step <= status ? '✓' : step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced status steps */}
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 transform ${
                      step <= status 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg scale-105' 
                        : 'bg-gray-50 border border-gray-200'
                    } ${step === status ? 'animate-pulse' : ''}`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                      step <= status 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step <= status ? '✓' : step}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`text-xs sm:text-sm font-medium transition-all duration-300 ${
                        step <= status ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {statusMessages[step as keyof typeof statusMessages]}
                      </span>
                      <div className={`text-xs mt-1 transition-all duration-300 ${
                        step <= status ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {statusDescriptions[step as keyof typeof statusDescriptions]}
                      </div>
                    </div>
                    {step === status && (
                      <div className="text-green-500 animate-spin">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced footer */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
            <div className="text-center">
              {isCompleted ? (
                <div className="space-y-2">
                  <div className="text-xl sm:text-2xl animate-bounce">🎉</div>
                  <div className="text-green-600 font-bold text-base sm:text-lg">
                    The lift-net process is complete!
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Closing Please wait....
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse delay-200" />
                  <span className="text-gray-600 font-medium ml-2 text-sm sm:text-base">
                    Closing the window Please wait....
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPopup;
