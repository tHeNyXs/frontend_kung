import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface SystemStatus {
  enabled: boolean
  last_check: string | null
  status: string
}

interface SystemToggleRequest {
  action: 'on' | 'off'
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Query key for system status
const SYSTEM_STATUS_QUERY_KEY = ['system', 'status']

// Hook for system control
export function useSystemControl() {
  const queryClient = useQueryClient()

  // Query for system status
  const { 
    data: systemStatus, 
    isLoading: isStatusLoading,
    error: statusError 
  } = useQuery<SystemStatus>({
    queryKey: SYSTEM_STATUS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/system/status`)
      if (!response.ok) {
        throw new Error('Failed to fetch system status')
      }
      return response.json()
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 3
  })

  // Mutation for toggling system
  const toggleMutation = useMutation({
    mutationFn: async (action: 'on' | 'off') => {
      const response = await fetch(`${API_BASE_URL}/api/v1/system/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to ${action} system`)
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Update the cache with new status
      queryClient.setQueryData(SYSTEM_STATUS_QUERY_KEY, data)
      
      // Show success message
      console.log(`System ${data.status} successfully`)
    },
    onError: (error) => {
      console.error('Failed to toggle system:', error)
    }
  })

  // Function to turn system on
  const turnOn = () => {
    toggleMutation.mutate('on')
  }

  // Function to turn system off
  const turnOff = () => {
    toggleMutation.mutate('off')
  }

  // Function to toggle system
  const toggle = () => {
    if (systemStatus?.enabled) {
      turnOff()
    } else {
      turnOn()
    }
  }

  return {
    // Status
    systemStatus,
    isEnabled: systemStatus?.enabled || false,
    isStatusLoading,
    statusError,
    
    // Actions
    turnOn,
    turnOff,
    toggle,
    
    // Mutation state
    isToggling: toggleMutation.isPending,
    toggleError: toggleMutation.error
  }
}

// Hook for routine settings (for system status display)
export function useSystemRoutineSettings() {
  const { 
    data: routineSettings, 
    isLoading: isRoutineLoading,
    error: routineError 
  } = useQuery({
    queryKey: ['system', 'routine-settings'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/system/routine-settings`)
      if (!response.ok) {
        throw new Error('Failed to fetch routine settings')
      }
      return response.json()
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: 3
  })

  return {
    routineSettings: routineSettings?.data,
    isRoutineLoading,
    routineError
  }
}
