'use client';

import { useEffect, useState } from 'react';

interface PWAStatus {
  isInstalled: boolean;
  isStandalone: boolean;
  isFullscreen: boolean;
  hasServiceWorker: boolean;
  serviceWorkerState: string;
  canInstall: boolean;
  displayMode: string;
}

export default function PWADebug() {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isStandalone: false,
    isFullscreen: false,
    hasServiceWorker: false,
    serviceWorkerState: 'unknown',
    canInstall: false,
    displayMode: 'browser'
  });
  const [showDebug, setShowDebug] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    checkPWAStatus();
    
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for app installed
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', checkPWAStatus);
    };
  }, []);

  const checkPWAStatus = async () => {
    const status: PWAStatus = {
      isInstalled: false,
      isStandalone: false,
      isFullscreen: false,
      hasServiceWorker: false,
      serviceWorkerState: 'unknown',
      canInstall: false,
      displayMode: 'browser'
    };

    // Check if running through ngrok
    const isNgrok = window.location.hostname.includes('ngrok') || 
                    window.location.hostname.includes('ngrok.io') ||
                    window.location.hostname.includes('ngrok-free.app');
    
    console.log('🔍 PWA Status Check - ngrok:', isNgrok);

    // Check display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      status.displayMode = 'standalone';
      status.isStandalone = true;
      status.isInstalled = true;
    } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
      status.displayMode = 'fullscreen';
      status.isFullscreen = true;
      status.isInstalled = true;
    } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      status.displayMode = 'minimal-ui';
      status.isInstalled = true;
    } else {
      status.displayMode = 'browser';
    }

    // Check iOS standalone
    if ((window.navigator as any).standalone === true) {
      status.isStandalone = true;
      status.isInstalled = true;
    }

    // Check service worker
    if ('serviceWorker' in navigator) {
      status.hasServiceWorker = true;
      
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          if (registration.active) {
            status.serviceWorkerState = 'active';
          } else if (registration.installing) {
            status.serviceWorkerState = 'installing';
          } else if (registration.waiting) {
            status.serviceWorkerState = 'waiting';
          }
        } else {
          status.serviceWorkerState = 'not registered';
        }
      } catch (error) {
        status.serviceWorkerState = 'error';
      }
    }

    // Check if can install
    status.canInstall = !!deferredPrompt;

    setPwaStatus(status);
  };

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
    checkPWAStatus();
  };

  const handleAppInstalled = () => {
    setDeferredPrompt(null);
    checkPWAStatus();
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('ไม่สามารถติดตั้ง PWA ได้ในขณะนี้');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
      
      setDeferredPrompt(null);
      checkPWAStatus();
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const handleUnregisterSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.unregister();
          alert('Service Worker unregistered successfully');
          checkPWAStatus();
        }
      } catch (error) {
        console.error('Failed to unregister SW:', error);
      }
    }
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        alert('Cache cleared successfully');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  };

  const handleTestOffline = () => {
    // Simulate offline mode
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);
    
    // Show offline page
    window.location.href = '/offline.html';
  };

  const handleTestNotification = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('ShrimpSense Test', {
          body: 'นี่คือการทดสอบการแจ้งเตือน',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png'
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          handleTestNotification();
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'installing': return 'text-yellow-600';
      case 'waiting': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDisplayModeIcon = (mode: string) => {
    switch (mode) {
      case 'standalone': return '📱';
      case 'fullscreen': return '🖥️';
      case 'minimal-ui': return '📱';
      default: return '🌐';
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 z-50"
      >
        🔧 PWA Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔧 PWA Debug Panel</h2>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* PWA Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">สถานะ PWA</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Display Mode</div>
                <div className="font-medium">
                  {getDisplayModeIcon(pwaStatus.displayMode)} {pwaStatus.displayMode}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">ติดตั้งแล้ว</div>
                <div className="font-medium">
                  {pwaStatus.isInstalled ? '✅ ใช่' : '❌ ไม่'}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Standalone</div>
                <div className="font-medium">
                  {pwaStatus.isStandalone ? '✅ ใช่' : '❌ ไม่'}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Fullscreen</div>
                <div className="font-medium">
                  {pwaStatus.isFullscreen ? '✅ ใช่' : '❌ ไม่'}
                </div>
              </div>
            </div>
          </div>

          {/* Service Worker Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Service Worker</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">สถานะ</div>
              <div className={`font-medium ${getStatusColor(pwaStatus.serviceWorkerState)}`}>
                {pwaStatus.hasServiceWorker ? pwaStatus.serviceWorkerState : 'ไม่รองรับ'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">การดำเนินการ</h3>
            <div className="grid grid-cols-2 gap-3">
              {pwaStatus.canInstall && (
                <button
                  onClick={handleInstallPWA}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  📱 ติดตั้ง PWA
                </button>
              )}
              <button
                onClick={handleUnregisterSW}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                🗑️ ลบ Service Worker
              </button>
              <button
                onClick={handleClearCache}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
              >
                🧹 ล้าง Cache
              </button>
              <button
                onClick={handleTestOffline}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                📡 ทดสอบออฟไลน์
              </button>
              <button
                onClick={handleTestNotification}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                🔔 ทดสอบการแจ้งเตือน
              </button>
              <button
                onClick={checkPWAStatus}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                🔄 รีเฟรชสถานะ
              </button>
            </div>
          </div>

                           {/* Debug Info */}
                 <div className="mb-6">
                   <h3 className="text-lg font-semibold mb-3 text-gray-800">ข้อมูล Debug</h3>
                   <div className="bg-gray-50 p-3 rounded-lg text-sm">
                     <div className="mb-2">
                       <strong>Hostname:</strong> {window.location.hostname}
                     </div>
                     <div className="mb-2">
                       <strong>Protocol:</strong> {window.location.protocol}
                     </div>
                     <div className="mb-2">
                       <strong>ngrok:</strong> {window.location.hostname.includes('ngrok') ? '✅ ใช่' : '❌ ไม่'}
                     </div>
                     <div className="mb-2">
                       <strong>User Agent:</strong> {navigator.userAgent}
                     </div>
                     <div className="mb-2">
                       <strong>Platform:</strong> {navigator.platform}
                     </div>
                     <div className="mb-2">
                       <strong>Language:</strong> {navigator.language}
                     </div>
                     <div className="mb-2">
                       <strong>Online:</strong> {navigator.onLine ? '✅ ใช่' : '❌ ไม่'}
                     </div>
                     <div>
                       <strong>Viewport:</strong> {window.innerWidth} × {window.innerHeight}
                     </div>
                   </div>
                 </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={() => setShowDebug(false)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
