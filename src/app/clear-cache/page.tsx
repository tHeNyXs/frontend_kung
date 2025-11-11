'use client';

import { useState } from 'react';

export default function ClearCachePage() {
  const [status, setStatus] = useState('');

  const clearAllCaches = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setStatus('✅ All caches cleared successfully!');
      } else {
        setStatus('❌ Cache API not supported');
      }
    } catch (error) {
      setStatus('❌ Error clearing caches: ' + (error as Error).message);
    }
  };

  const unregisterSW = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        setStatus('✅ Service Workers unregistered successfully!');
      } else {
        setStatus('❌ Service Worker not supported');
      }
    } catch (error) {
      setStatus('❌ Error unregistering SW: ' + (error as Error).message);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const goToApp = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">🔄 Clear Cache & Update PWA</h1>
          <p className="text-gray-600 mb-8 text-center">
            ใช้หน้านี้เพื่อลบ cache และอัปเดต PWA ให้แสดงโลโก้ใหม่
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={clearAllCaches}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🗑️ Clear All Caches
            </button>
            <button
              onClick={unregisterSW}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Unregister Service Worker
            </button>
            <button
              onClick={reloadPage}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Reload Page
            </button>
            <button
              onClick={goToApp}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🏠 Go to App
            </button>
          </div>
          
          {status && (
            <div className={`p-4 rounded-lg ${
              status.includes('✅') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {status}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">คำแนะนำ:</h3>
            <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
              <li>กด "Clear All Caches" เพื่อลบ cache ทั้งหมด</li>
              <li>กด "Unregister Service Worker" เพื่อลบ service worker เก่า</li>
              <li>กด "Reload Page" เพื่อโหลดหน้าใหม่</li>
              <li>ไปที่หน้า "Check Logo" เพื่อตรวจสอบโลโก้</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
