'use client'

import React, { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { useAuth } from '@/providers/auth-provider'

interface PushNotificationPermissionProps {
  onPermissionGranted?: () => void
  onPermissionDenied?: () => void
  showSettings?: boolean
  className?: string
}

export default function PushNotificationPermission({
  onPermissionGranted,
  onPermissionDenied,
  showSettings = false,
  className = ''
}: PushNotificationPermissionProps) {
  const { isAuthenticated } = useAuth()
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications()

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)

  // Show permission prompt after login
  useEffect(() => {
    if (isAuthenticated && isSupported && permission === 'default' && !showPermissionPrompt) {
      setShowPermissionPrompt(true)
    }
  }, [isAuthenticated, isSupported, permission, showPermissionPrompt])

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      const subscribed = await subscribe()
      if (subscribed) {
        onPermissionGranted?.()
        setShowPermissionPrompt(false)
      }
    } else {
      onPermissionDenied?.()
    }
  }

  const handleSubscribe = async () => {
    const subscribed = await subscribe()
    if (subscribed) {
      onPermissionGranted?.()
    }
  }

  const handleUnsubscribe = async () => {
    const unsubscribed = await unsubscribe()
    if (unsubscribed) {
      setShowSettingsPanel(false)
    }
  }

  const handleTestNotification = async () => {
    await sendTestNotification()
  }

  const handleClose = () => {
    setShowPermissionPrompt(false)
    setShowSettingsPanel(false)
  }

  // Don't render if not supported
  if (!isSupported) {
    return null
  }

  // Permission prompt modal
  if (showPermissionPrompt && permission === 'default') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  เปิดใช้งานการแจ้งเตือน
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  รับการแจ้งเตือนเมื่อมีเหตุการณ์สำคัญในระบบ เช่น เซ็นเซอร์ผิดปกติ หรือการอัปเดตบ่อกุ้ง
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleRequestPermission}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'กำลังตั้งค่า...' : 'อนุญาต'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ไม่ตอนนี้
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Permission denied modal
  if (permission === 'denied') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  การแจ้งเตือนถูกปฏิเสธ
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  กรุณาเปิดใช้งานการแจ้งเตือนในเบราว์เซอร์เพื่อรับการแจ้งเตือนจากระบบ
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not subscribed but permission granted modal
  if (permission === 'granted' && !isSubscribed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  การแจ้งเตือน
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  โปรดคลิกปุ่ม "อนุญาต" เพื่อรับการแจ้งเตือนจากระบบ
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'กำลังอนุญาติ...' : 'อนุญาต'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ไม่ตอนนี้
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state modal
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  เกิดข้อผิดพลาด
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {error}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Settings panel (inline for settings page)
  if (showSettings && isSubscribed) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                การแจ้งเตือนเปิดใช้งานแล้ว
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleTestNotification}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
            >
              ทดสอบ
            </button>
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'กำลังยกเลิก...' : 'ยกเลิก'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}