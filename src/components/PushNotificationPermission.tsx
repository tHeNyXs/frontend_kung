'use client'

import React, { useState } from 'react'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { useAuth } from '@/providers/auth-provider'

interface PushNotificationPermissionProps {
  onPermissionGranted?: () => void
  onPermissionDenied?: () => void
  showSettings?: boolean
  className?: string
  autoOpenPrompt?: boolean
}

export default function PushNotificationPermission({
  onPermissionGranted,
  onPermissionDenied,
  showSettings = false,
  className = '',
  autoOpenPrompt = false
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

  // Allow the popup to open only when the user manually triggers it
  const openPermissionPopup = () => {
    setShowPermissionPrompt(true)
  }

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

  // Not supported
  if (!isSupported) return null

  // Permission request modal
  if (showPermissionPrompt && permission === 'default') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enable Notifications
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Receive alerts for important events such as abnormal sensor readings or pond updates.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleRequestPermission}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Setting up...' : 'Allow'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Not now
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
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Notification Permission Denied
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please enable notifications in your browser settings to receive alerts.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Permission granted but not subscribed modal
  if (permission === 'granted' && !isSubscribed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Notification Setup
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please click "Allow" to complete notification setup.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Processing...' : 'Allow'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error modal
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {error}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleClose}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Settings panel
  if (showSettings && isSubscribed) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-green-800">
              Notifications are enabled
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleTestNotification}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700"
            >
              Test
            </button>

            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Unsubscribe'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
