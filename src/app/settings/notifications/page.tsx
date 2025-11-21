'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { apiClient, PushNotificationSettings } from '@/lib/api-client'
import PushNotificationPermission from '@/components/PushNotificationPermission'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function NotificationSettingsPage() {
  const { accessToken, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch current settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['push-settings'],
    queryFn: async () => {
      if (!accessToken) throw new Error('Not authenticated')
      const response = await apiClient.getPushSettings(accessToken)
      if (response.error) throw new Error(response.error)
      return response.data
    },
    enabled: !!accessToken && isAuthenticated,
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<PushNotificationSettings>) => {
      if (!accessToken) throw new Error('Not authenticated')
      const response = await apiClient.updatePushSettings(newSettings, accessToken)
      if (response.error) throw new Error(response.error)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-settings'] })
      setSuccess('Settings saved successfully.')
      setError(null)
      setTimeout(() => setSuccess(null), 3000)
    },
    onError: (error: Error) => {
      setError(error.message)
      setSuccess(null)
    }
  })

  const handleSettingChange = (key: keyof PushNotificationSettings, value: boolean) => {
    if (!settings) return
    
    const newSettings = {
      ...settings,
      [key]: value
    }
    
    updateSettingsMutation.mutate(newSettings)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please login</h1>
          <p className="text-gray-600">Please log in to view your notification settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification settings</h1>
          <p className="mt-2 text-gray-600">
            Manage notifications and preferences.
          </p>
        </div>

        {/* Push Notification Permission */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Push Notification</h2>
          <PushNotificationPermission 
            showSettings={true}
            onPermissionGranted={() => {
              setSuccess('Notifications enabled.')
              setTimeout(() => setSuccess(null), 3000)
            }}
            onPermissionDenied={() => {
              setError('Notification denied.')
              setTimeout(() => setError(null), 3000)
            }}
          />
        </div>

        {/* Notification Settings */}
        {settings && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Notification settings</h2>
              <p className="mt-1 text-sm text-gray-600">
                Choose your notification types.
              </p>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Sensor Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Sensor notification</h3>
                  <p className="text-sm text-gray-600">
                   Get alerts when sensors detect abnormal values (e.g., high temperature or low pH).
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('sensor_alerts', !settings.sensor_alerts)}
                  disabled={updateSettingsMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    settings.sensor_alerts ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sensor_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Pond Updates */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Update Pond</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications when shrimp pond data is updated, such as when a new pond is added or existing information is edited.
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('pond_updates', !settings.pond_updates)}
                  disabled={updateSettingsMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    settings.pond_updates ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.pond_updates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* System Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">System notification</h3>
                  <p className="text-sm text-gray-600">
                    รับการแจ้งเตือนเกี่ยวกับระบบ เช่น การอัปเดตแอปพลิเคชันหรือการบำรุงรักษา
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('system_notifications', !settings.system_notifications)}
                  disabled={updateSettingsMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    settings.system_notifications ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.system_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Maintenance Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Maintenance reminder</h3>
                  <p className="text-sm text-gray-600">
                    รับการแจ้งเตือนเมื่อถึงเวลาบำรุงรักษาอุปกรณ์หรือระบบ
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('maintenance_alerts', !settings.maintenance_alerts)}
                  disabled={updateSettingsMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    settings.maintenance_alerts ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.maintenance_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {settingsLoading && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
