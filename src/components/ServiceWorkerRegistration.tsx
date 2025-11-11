'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerRegistrationProps {
  children: React.ReactNode;
}

interface UpdateAvailableEvent extends Event {
  detail: {
    registration: ServiceWorkerRegistration;
  };
}

export default function ServiceWorkerRegistration({ children }: ServiceWorkerRegistrationProps) {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    
    // Listen for app installed
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for service worker updates
    window.addEventListener('sw-update-available', handleUpdateAvailable as EventListener);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('sw-update-available', handleUpdateAvailable as EventListener);
      }
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Check if we're on client side
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return;
      }

      // Detect if running through ngrok or localhost
      const isNgrok = window.location.hostname.includes('ngrok') || 
                      window.location.hostname.includes('ngrok.io') ||
                      window.location.hostname.includes('ngrok-free.app');
      
      console.log(`🔧 Registering Service Worker (ngrok: ${isNgrok})`);
      
      // Use our minimal service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Force update for ngrok
      });
      console.log('✅ Service Worker registered successfully:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              dispatchUpdateAvailable(registration);
            }
          });
        }
      });

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      });

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  };

  const handleAppInstalled = () => {
    console.log('✅ PWA installed successfully');
    
    // Track installation
    if ('gtag' in window) {
      (window as any).gtag('event', 'pwa_install');
    }
  };

  const handleUpdateAvailable = (event: UpdateAvailableEvent) => {
    console.log('🔄 Service Worker update available');
    setIsUpdateAvailable(true);
  };

  const dispatchUpdateAvailable = (registration: ServiceWorkerRegistration) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sw-update-available', {
        detail: { registration }
      });
      window.dispatchEvent(event);
    }
  };

  const handleUpdate = async () => {
    setIsInstalling(true);
    
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Send message to service worker to skip waiting
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page after a short delay
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Update failed:', error);
      setIsInstalling(false);
    }
  };


  const handleCacheUrls = async (urls: string[]) => {
    if (typeof window === 'undefined') return;
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.success) {
            console.log('✅ URLs cached successfully');
          } else if (event.data && event.data.error) {
            console.error('❌ Failed to cache URLs:', event.data.error);
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CACHE_URLS', urls },
          [messageChannel.port2]
        );
      } catch (error) {
        console.error('❌ Failed to send cache message:', error);
      }
    } else {
      console.log('⚠️ Service Worker not ready for caching');
    }
  };

  // Pre-cache important URLs
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Only cache if service worker is ready
    if ('serviceWorker' in navigator) {
      const importantUrls = [
        '/offline.html',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png'
      ];
      
      // Cache URLs after a short delay
      const timer = setTimeout(() => {
        handleCacheUrls(importantUrls);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {children}
      
      {/* Update Available Notification */}
      {isUpdateAvailable && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">อัปเดตใหม่พร้อมใช้งาน</h4>
              <p className="text-sm opacity-90">มีเวอร์ชันใหม่ของแอป</p>
            </div>
            <button
              onClick={handleUpdate}
              disabled={isInstalling}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              {isInstalling ? 'กำลังอัปเดต...' : 'อัปเดต'}
            </button>
          </div>
        </div>
      )}

    </>
  );
}
