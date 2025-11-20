import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { MultiSensorGraphResponse } from '@/lib/types'
import { TimeframeOption } from '@/components/TimeframeSelector'

interface UseGraphDataOptions {
  pondId: number
  timeframe?: TimeframeOption
  hours?: number
  sensorTypes?: string[]
  enabled?: boolean
}

// Helper function to convert timeframe to hours
const timeframeToHours = (timeframe: TimeframeOption): number => {
  switch (timeframe) {
    case '1D': return 24
    case '7D': return 168
    case '30D': return 720
    default: return 24
  }
}

export const useGraphData = ({ 
  pondId, 
  timeframe = '1D',
  hours, 
  sensorTypes, 
  enabled = true 
}: UseGraphDataOptions) => {
  // Use timeframe to determine hours if not explicitly provided
  const actualHours = hours || timeframeToHours(timeframe)
  
  return useQuery({
    queryKey: ['graph-data', pondId, actualHours, sensorTypes, timeframe],
    queryFn: async (): Promise<MultiSensorGraphResponse> => {
      const params = new URLSearchParams({
        hours: actualHours.toString(),
      })
      
      if (sensorTypes && sensorTypes.length > 0) {
        params.append('sensor_types', sensorTypes.join(','))
      }
      
      // ใช้ request method และเพิ่ม /api/v1 prefix
      const response = await (apiClient as any).request(`/api/v1/sensors/graph-simple/${pondId}?${params}`, {
        method: 'GET',
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Transform backend response to match expected format
      const backendData = response.data
      
      if (backendData.success) {
        const transformedData = {
          pond_id: backendData.pond_id,
          sensors: backendData.sensors,
          time_range: {
            start_time: new Date(Date.now() - actualHours * 60 * 60 * 1000).toISOString(),
            end_time: new Date().toISOString()
          },
          total_points: backendData.total_points || actualHours
        }
        return transformedData
      } else {
        throw new Error('API returned success: false')
      }
    },
    enabled: enabled && !!pondId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 3000, // Consider data stale after 3 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  })
}

export const useSensorGraphData = (pondId: number, sensorType: string, hours = 24) => {
  return useQuery({
    queryKey: ['sensor-graph-data', pondId, sensorType, hours],
    queryFn: async () => {
      const response = await (apiClient as any).request(`/api/v1/sensors/graph-simple/${pondId}?sensor_types=${sensorType}&hours=${hours}`, {
        method: 'GET',
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Transform backend response to match expected format
      const backendData = response.data
      if (backendData.success) {
        const transformedData = {
          pond_id: backendData.pond_id,
          sensors: backendData.sensors,
          time_range: {
            start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date().toISOString()
          },
          total_points: backendData.tnts || 24
        }
        return transformedData.sensors[sensorType] || null
      } else {
        throw new Error('API returned success: false')
      }
    },
    enabled: !!pondId && !!sensorType,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 3000, // Consider data stale after 3 seconds
  })
}
