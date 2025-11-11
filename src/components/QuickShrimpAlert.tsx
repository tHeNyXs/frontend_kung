'use client';

import { useSendShrimpAlert } from '@/hooks/use-shrimp-alert';

interface QuickShrimpAlertProps {
  pondId?: string;
  userId?: number;
  imageUrl?: string;
  targetUrl?: string;
}

export default function QuickShrimpAlert({ 
  pondId = "1", 
  userId = 1, 
  imageUrl = "https://example.com/shrimp-floating.jpg",
  targetUrl = "https://yourapp.com/pond-details/1"
}: QuickShrimpAlertProps) {
  const sendShrimpAlert = useSendShrimpAlert();

  const handleQuickAlert = () => {
    sendShrimpAlert.mutate({
      user_id: userId,
      body: "ตรวจพบกุ้งลอยบนผิวน้ำ ควรตรวจสอบทันที",
      image: imageUrl,
      url: targetUrl,
      data: {
        pond_id: pondId,
        timestamp: new Date().toISOString(),
        alert_type: "shrimp_floating"
      }
    });
  };

  return (
    <button
      onClick={handleQuickAlert}
      disabled={sendShrimpAlert.isPending}
      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition-colors"
    >
      {sendShrimpAlert.isPending ? 'กำลังส่ง...' : '🚨 ส่งการแจ้งเตือนกุ้งลอย'}
    </button>
  );
}
