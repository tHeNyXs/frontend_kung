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

  // Manual open popup
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

  // Permission Request Modal
  if (showPermissionPrompt && permission === 'default') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16..." />
              </svg>

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable Notifications</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Receive alerts for important events such as abnormal sensor readings or pond updates.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={handleRequestPermission}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    {isLoading ? 'Setting up...' : 'Allow'}
                  </button>

                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"
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

  // ❗ FIX: Show "denied" modal ONLY on settings page
  if (permission === 'denied' && showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8..." />
              </svg>

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Permission Denied</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please enable notifications in your browser settings to receive alerts.
                </p>

                <div className="flex justify-end">
                  <button onClick={handleClose} className="bg-gray-100 px-4 py-2 rounded-lg">
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

  // Permission granted but not subscribed
  if (permission === 'granted' && !isSubscribed && showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" />

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Setup</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please click "Allow" to complete notification setup.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg"
                  >
                    {isLoading ? 'Processing...' : 'Allow'}
                  </button>

                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"
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
  if (error && showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor" />

              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-sm text-gray-600 mb-6">{error}</p>

                <div className="flex justify-end">
                  <button onClick={handleClose} className="bg-gray-100 px-4 py-2 rounded-lg">
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

  // Settings panel (only when in settings page)
  if (showSettings && isSubscribed) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" />
            <p className="ml-3 text-sm font-medium text-green-800">Notifications are enabled</p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleTestNotification}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Test
            </button>

            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
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
