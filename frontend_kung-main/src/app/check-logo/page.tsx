'use client';

import { useState, useEffect } from 'react';

export default function CheckLogoPage() {
  const [status, setStatus] = useState('');
  const [logoStatus, setLogoStatus] = useState<Record<string, boolean>>({});
  const [cacheBuster, setCacheBuster] = useState('');
  const [isClient, setIsClient] = useState(false);

  const iconSizes = [
    { size: '72x72', file: 'icon-72x72.png' },
    { size: '96x96', file: 'icon-96x96.png' },
    { size: '128x128', file: 'icon-128x128.png' },
    { size: '144x144', file: 'icon-144x144.png' },
    { size: '152x152', file: 'icon-152x152.png' },
    { size: '192x192', file: 'icon-192x192.png' },
    { size: '384x384', file: 'icon-384x384.png' },
    { size: '512x512', file: 'icon-512x512.png' },
  ];

  const checkAllLogos = async () => {
    setStatus('🔍 Checking all logos...');
    const results: Record<string, boolean> = {};
    const currentCacheBuster = cacheBuster || '?t=' + Date.now();

    for (const icon of iconSizes) {
      try {
        const response = await fetch(`/icons/${icon.file}${currentCacheBuster}`, {
          method: 'HEAD',
          cache: 'no-cache'
        });
        results[icon.size] = response.ok;
      } catch (error) {
        results[icon.size] = false;
      }
    }

    // Check original logo
    try {
      const response = await fetch(`/logo-app1.jpg${currentCacheBuster}`, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      results['original'] = response.ok;
    } catch (error) {
      results['original'] = false;
    }

    setLogoStatus(results);
    
    const loaded = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    if (loaded === total) {
      setStatus('✅ All logos loaded successfully!');
    } else {
      setStatus(`❌ ${total - loaded} logos failed to load`);
    }
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setStatus('✅ Cache cleared! Reload page to see changes.');
      }
    } catch (error) {
      setStatus('❌ Error clearing cache: ' + (error as Error).message);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const goToApp = () => {
    window.location.href = '/';
  };

  useEffect(() => {
    // Set client flag and cache buster on client side only
    setIsClient(true);
    setCacheBuster('?t=' + Date.now());
    // Auto check on load
    setTimeout(checkAllLogos, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">🔍 Check PWA Logo</h1>
          <p className="text-gray-600 mb-8 text-center">
            ตรวจสอบโลโก้ PWA ในทุกขนาด
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {iconSizes.map((icon) => (
              <div key={icon.size} className="text-center p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">{icon.size}</h3>
                <div className="relative">
                  <img
                    src={`/icons/${icon.file}${isClient ? cacheBuster : ''}`}
                    alt={icon.size}
                    className="w-full h-auto rounded"
                    onLoad={() => setLogoStatus(prev => ({ ...prev, [icon.size]: true }))}
                    onError={() => setLogoStatus(prev => ({ ...prev, [icon.size]: false }))}
                  />
                  {logoStatus[icon.size] === true && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                  {logoStatus[icon.size] === false && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      ✗
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">{icon.file}</p>
              </div>
            ))}
          </div>

          <div className="text-center p-4 border-2 border-gray-200 rounded-lg mb-8">
            <h3 className="font-semibold text-gray-700 mb-2">Original Logo</h3>
            <div className="relative inline-block">
              <img
                src={`/logo-app1.jpg${isClient ? cacheBuster : ''}`}
                alt="Original Logo"
                className="w-32 h-auto rounded"
                onLoad={() => setLogoStatus(prev => ({ ...prev, original: true }))}
                onError={() => setLogoStatus(prev => ({ ...prev, original: false }))}
              />
              {logoStatus.original === true && (
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
              {logoStatus.original === false && (
                <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  ✗
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">logo-app1.jpg</p>
          </div>

          {status && (
            <div className={`p-4 rounded-lg mb-6 ${
              status.includes('✅') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {status}
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={checkAllLogos}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              🔍 Check All Logos
            </button>
            <button
              onClick={clearCache}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              🗑️ Clear Cache
            </button>
            <button
              onClick={reloadPage}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Reload Page
            </button>
            <button
              onClick={goToApp}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              🏠 Go to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
