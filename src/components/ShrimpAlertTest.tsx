'use client';

import { useState } from 'react';
import { useSendShrimpAlert } from '@/hooks/use-shrimp-alert';

export default function ShrimpAlertTest() {
  const [imageUrl, setImageUrl] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIM0syGxE_4zEiuWSroBXGlfRIcdIXR97v2Q&s');
  const [targetUrl, setTargetUrl] = useState('/ponds/1');
  const [userId, setUserId] = useState(1);
  const [customBody, setCustomBody] = useState('ตรวจพบกุ้งลอยบนผิวน้ำ ควรตรวจสอบทันที');
  
  const sendShrimpAlert = useSendShrimpAlert();

  const handleSendAlert = () => {
    sendShrimpAlert.mutate({
      user_id: userId,
      body: customBody,
      image: imageUrl,
      url: targetUrl,
      data: {
        pond_id: "1",
        timestamp: new Date().toISOString(),
        alert_type: "shrimp_floating"
      }
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">ทดสอบ Shrimp Alert</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID:
          </label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            รูปภาพ (Image URL):
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL ที่จะเปิดเมื่อคลิก:
          </label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/ponds/1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ข้อความ (Body):
          </label>
          <textarea
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <button
          onClick={handleSendAlert}
          disabled={sendShrimpAlert.isPending}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          {sendShrimpAlert.isPending ? 'กำลังส่ง...' : 'ส่งการแจ้งเตือนกุ้งลอย'}
        </button>

        {sendShrimpAlert.isSuccess && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ ส่งการแจ้งเตือนสำเร็จ!
          </div>
        )}

        {sendShrimpAlert.isError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            ❌ เกิดข้อผิดพลาด: {sendShrimpAlert.error?.message}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-semibold mb-2">ข้อมูลที่จะส่ง:</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify({
            user_id: userId,
            body: customBody,
            image: imageUrl,
            url: targetUrl,
            tag: "shrimp-alert",
            data: {
              pond_id: "1",
              timestamp: new Date().toISOString(),
              alert_type: "shrimp_floating"
            }
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
