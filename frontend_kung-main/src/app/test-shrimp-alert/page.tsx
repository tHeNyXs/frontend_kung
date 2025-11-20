'use client';

import ShrimpAlertTest from '@/components/ShrimpAlertTest';

export default function TestShrimpAlertPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          ทดสอบระบบแจ้งเตือนกุ้งลอย
        </h1>
        
        <ShrimpAlertTest />
        
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">วิธีการใช้งาน:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>กรอก User ID ของผู้ใช้ที่ต้องการส่งการแจ้งเตือน</li>
              <li>ใส่ URL ของรูปภาพที่ต้องการแสดงใน notification</li>
              <li>ใส่ URL ที่จะเปิดเมื่อผู้ใช้คลิก notification</li>
              <li>แก้ไขข้อความได้ตามต้องการ (ถ้าไม่ใส่จะใช้ข้อความเริ่มต้น)</li>
              <li>กดปุ่ม "ส่งการแจ้งเตือนกุ้งลอย"</li>
            </ol>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">หมายเหตุ:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Notification จะแสดงหัวข้อ "พบกุ้งลอยบนผิวน้ำ!!!"</li>
                <li>• รูปภาพจะแสดงใน notification (ถ้า URL ถูกต้อง)</li>
                <li>• เมื่อคลิก notification จะเปิด URL ที่กำหนด</li>
                <li>• ต้องมี push subscription ที่ active อยู่</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
