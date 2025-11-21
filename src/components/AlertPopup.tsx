/**
 * Alert Popup Component
 * Popup สำหรับจัดการ alert actions (อ่านแล้ว, ยังไม่อ่าน)
 */

import React, { useState, useEffect } from 'react';
import { useAlerts } from '@/hooks/use-alerts';

interface AlertPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pondId: number;
  userId: number;
  alertId?: string;
  onMarkAsRead?: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({
  isOpen,
  onClose,
  pondId,
  userId,
  alertId,
  onMarkAsRead
}) => {
  const { 
    getPondUnreadAlerts, 
    markAlertAsRead,
    isLoading 
  } = useAlerts();
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(alertId || null);

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen, pondId]);

  const fetchAlerts = async () => {
    try {
      const result = await getPondUnreadAlerts(pondId);
      if (result && result.success) {
        setAlerts(result.alerts || []);
        if (result.alerts && result.alerts.length > 0 && !selectedAlertId) {
          setSelectedAlertId(result.alerts[0].id);
        }
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    }
  };

  const handleMarkAsRead = async () => {
    if (!selectedAlertId) return;
    
    console.log('🔄 AlertPopup: handleMarkAsRead called for alertId:', selectedAlertId);
    
    try {
      const result = await markAlertAsRead(selectedAlertId);
      console.log('🔄 AlertPopup: markAlertAsRead result:', result);
      if (result.success) {
        // Remove from local state
        setAlerts(prev => prev.filter(alert => alert.id !== selectedAlertId));
        setSelectedAlertId(null);
        
        console.log('🔄 AlertPopup: Calling onMarkAsRead callback');
        // Call parent callback
        onMarkAsRead?.();
        
        // Close if no more alerts
        if (alerts.length <= 1) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (alerts.length === 0) return;
    
    console.log('🔄 AlertPopup: handleMarkAllAsRead called for', alerts.length, 'alerts');
    
    try {
      // ใช้ Promise.allSettled() - จะไม่ fail ทั้งหมดถ้าบางตัว fail
      const results = await Promise.allSettled(
        alerts.map(alert => markAlertAsRead(alert.id))
      );
      
      // ตรวจสอบผลลัพธ์
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      console.log(`🔄 AlertPopup: ${successful} alerts marked as read, ${failed} failed`);
      
      // Clear all alerts from local state
      setAlerts([]);
      setSelectedAlertId(null);
      
      onMarkAsRead?.();
      onClose();
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };


  const handleClose = () => {
    setSelectedAlertId(null);
    onClose();
  };

  if (!isOpen) return null;

  const selectedAlert = alerts.find(alert => alert.id === selectedAlertId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-[#fcfaf7] to-yellow-50 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#f2c245] to-[#e6b63d] p-6 text-center relative">
          <div className="absolute top-2 right-2">
            <button
              onClick={handleClose}
              className="text-[#1c170d] hover:text-white transition-colors p-2 rounded-full hover:bg-black hover:bg-opacity-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <div className="text-3xl">🚨</div>
            <h3 className="text-2xl font-bold text-[#1c170d]">
              แจ้งเตือนบ่อที่ {pondId}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <p className="text-xl text-[#1c170d] font-medium">No unread notifications</p>
              <p className="text-sm text-gray-600 mt-2">Everything is fine!</p>
            </div>
          ) : (
            <>
              {/* Alert List */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="text-xl">📋</div>
                  <h4 className="text-lg font-bold text-[#1c170d]">
                    No unread notifications
                  </h4>
                  <div className="bg-[#f2c245] text-[#1c170d] px-3 py-1 rounded-full text-sm font-bold">
                    {alerts.length}
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`
                        p-2 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[0.98]
                        ${selectedAlertId === alert.id 
                          ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-md scale-[0.98]' 
                          : 'border-gray-200 hover:border-red-500 hover:bg-red-50 hover:shadow-sm'
                        }
                      `}
                      onClick={() => setSelectedAlertId(alert.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#1c170d] mb-1">
                            {alert.title}
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed mb-1">
                            {alert.body}
                          </p>
                          {/* Timestamp */}
                          <div className="text-xs text-gray-500 bg-gray-100 border border-black px-2 py-1 rounded-md inline-block">
                            {(() => {
                              const date = new Date(alert.created_at);
                              // เพิ่ม 7 ชั่วโมงเพื่อแก้ไขเวลาที่หายไป
                              date.setHours(date.getHours() + 7);
                              return date.toLocaleString('th-TH', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                                timeZone: 'Asia/Bangkok'
                              });
                            })()}
                          </div>
                        </div>
                        <div className="ml-2 flex items-center">
                          {selectedAlertId === alert.id && (
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                              <div className="relative w-35 h-35 bg-red-500 rounded-full shadow-md"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {alerts.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-yellow-50 p-6 flex-shrink-0">
            <div className="flex justify-center items-center relative">
              {/* Main Read Button - Center */}
              <button
                onClick={handleMarkAsRead}
                disabled={isLoading || !selectedAlertId}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Already read</span>
                  </>
                )}
              </button>
              
              {/* Clear All Button - Bottom Right */}
              {alerts.length > 1 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                  className="absolute right-0 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white w-16 h-8 rounded-full text-xs font-medium transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                  title="ล้างทั้งหมด"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      <span className="text-xs">Cleaning...</span>
                    </>
                  ) : (
                    'clean🗑️'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPopup;
