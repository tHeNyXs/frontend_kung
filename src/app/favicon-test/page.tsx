'use client';

import { useState, useEffect } from 'react';

export default function FaviconTestPage() {
  const [faviconStatus, setFaviconStatus] = useState<Record<string, boolean>>({});

  const faviconFiles = [
    { name: 'favicon.ico', url: '/favicon.ico' },
    { name: 'favicon-16x16.png', url: '/favicon-16x16.png' },
    { name: 'favicon-32x32.png', url: '/favicon-32x32.png' },
    { name: 'apple-touch-icon.png', url: '/apple-touch-icon.png' },
  ];

  const checkFavicons = async () => {
    const results: Record<string, boolean> = {};

    for (const favicon of faviconFiles) {
      try {
        const response = await fetch(favicon.url, {
          method: 'HEAD',
          cache: 'no-cache'
        });
        results[favicon.name] = response.ok;
      } catch (error) {
        results[favicon.name] = false;
      }
    }

    setFaviconStatus(results);
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        alert('Cache cleared! Reload page to see changes.');
      }
    } catch (error) {
      alert('Error clearing cache: ' + (error as Error).message);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const goToApp = () => {
    window.location.href = '/';
  };

  useEffect(() => {
    checkFavicons();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">🔍 Test Favicon</h1>
          <p className="text-gray-600 mb-8 text-center">
            ตรวจสอบ favicon และไอคอนต่างๆ ที่ใช้ใน tab และ PWA
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {faviconFiles.map((favicon) => (
              <div key={favicon.name} className="text-center p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">{favicon.name}</h3>
                <div className="relative">
                  <img
                    src={favicon.url}
                    alt={favicon.name}
                    className="w-16 h-16 mx-auto rounded"
                    onLoad={() => setFaviconStatus(prev => ({ ...prev, [favicon.name]: true }))}
                    onError={() => setFaviconStatus(prev => ({ ...prev, [favicon.name]: false }))}
                  />
                  {faviconStatus[favicon.name] === true && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                  {faviconStatus[favicon.name] === false && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      ✗
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">{favicon.url}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">วิธีตรวจสอบ Favicon:</h3>
            <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
              <li>ดูที่ tab ของเบราว์เซอร์ (ควรเป็นโลโก้กุ้งสีทอง)</li>
              <li>ดูที่ bookmark (ถ้ามี)</li>
              <li>ดูที่ PWA icon (ถ้าติดตั้งแล้ว)</li>
              <li>ดูที่ mobile home screen (ถ้าติดตั้ง PWA)</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={checkFavicons}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              🔍 Check Favicons
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
