import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

interface RoutineSchedule {
  id: string
  action: 'lift_up' | 'lift_down'
  time: string
  days: string[]
}

interface RoutineSettings {
  enabled: boolean
  schedules: RoutineSchedule[]
}

interface UseRoutineSettingsOptions {
  pondId: number
  enabled?: boolean
}

export const useRoutineSettings = ({ pondId, enabled = true }: UseRoutineSettingsOptions) => {
  const queryClient = useQueryClient()

  // Get routine settings
  const { data, isLoading, error } = useQuery({
    queryKey: ['routine-settings', pondId],
    queryFn: async (): Promise<RoutineSettings> => {
      const response = await (apiClient as any).request(`/api/v1/sensors/routine-settings/${pondId}`, {
        method: 'GET',
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data.routines
    },
    enabled: enabled && !!pondId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  })

  // Save routine settings
  const saveRoutineSettings = useMutation({
    mutationFn: async (settings: RoutineSettings) => {
      const response = await (apiClient as any).request(`/api/v1/sensors/routine-settings/${pondId}`, {
        method: 'POST',
        body: JSON.stringify(settings),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-settings', pondId] })
    },
  })

  // Add schedule
  const addSchedule = useMutation({
    mutationFn: async (schedule: Omit<RoutineSchedule, 'id'>) => {
      const response = await (apiClient as any).request(`/api/v1/sensors/routine-settings/${pondId}/schedule`, {
        method: 'POST',
        body: JSON.stringify(schedule),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-settings', pondId] })
    },
  })

  // Remove schedule
  const removeSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      const response = await (apiClient as any).request(`/api/v1/sensors/routine-settings/${pondId}/schedule/${scheduleId}`, {
        method: 'DELETE',
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-settings', pondId] })
    },
  })

  // Toggle enabled
  const toggleEnabled = useMutation({
    mutationFn: async (enabled: boolean) => {
      // Send to system toggle endpoint
      const systemResponse = await (apiClient as any).request('/api/v1/system/toggle', {
        method: 'POST',
        body: JSON.stringify({ action: enabled ? 'on' : 'off' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (systemResponse.error) {
        throw new Error(systemResponse.error)
      }
      
      // Also update routine settings locally
      const response = await (apiClient as any).request(`/api/v1/sensors/routine-settings/${pondId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ enabled }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-settings', pondId] })
    },
  })

  return {
    data,
    isLoading,
    error,
    saveRoutineSettings,
    addSchedule,
    removeSchedule,
    toggleEnabled,
  }
}

// Hook for getting all enabled schedules (for timer service)
export const useAllEnabledSchedules = () => {
  return useQuery({
    queryKey: ['all-enabled-schedules'],
    queryFn: async () => {
      const response = await (apiClient as any).request('/api/v1/sensors/routine-settings/all/enabled', {
        method: 'GET',
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data.schedules
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  })
}
