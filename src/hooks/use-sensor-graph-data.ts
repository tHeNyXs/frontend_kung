import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
// import { SensorGraphData } from '@/lib/types'
import { TimeframeOption } from '@/components/TimeframeSelector'

interface UseSensorGraphDataOptions {
  pondId: number
  sensorType: string
  timeframe?: TimeframeOption
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

interface SensorGraphResponse {
  success: boolean
  pond_id: number
  sensor_data: any
  time_range: {
    start_time: string
    end_time: string
  }
  total_points: number
  timeframe: TimeframeOption
  hours: number
}

export const useSensorGraphData = ({ 
  pondId, 
  sensorType,
  timeframe = '1D', 
  enabled = true 
}: UseSensorGraphDataOptions) => {
  const actualHours = timeframeToHours(timeframe)

  return useQuery({
    queryKey: ['sensor-graph-data', pondId, sensorType, timeframe],
    queryFn: async (): Promise<SensorGraphResponse> => {
      const params = new URLSearchParams({
        hours: actualHours.toString(),
        timeframe: timeframe,
        sensor_types: sensorType
      })
      
      const response = await (apiClient as any).request(`/api/v1/sensors/graph-simple/${pondId}?${params}`, {
        method: 'GET',
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      const backendData = response.data
      
      if (backendData.success && backendData.sensors && backendData.sensors[sensorType]) {
        return {
          success: true,
          pond_id: backendData.pond_id,
          sensor_data: backendData.sensors[sensorType],
          time_range: backendData.time_range || {
            start_time: new Date(Date.now() - actualHours * 60 * 60 * 1000).toISOString(),
            end_time: new Date().toISOString()
          },
          total_points: backendData.total_points || 0,
          timeframe: backendData.timeframe || timeframe,
          hours: backendData.hours || actualHours
        }
      } else {
        throw new Error(`No data found for sensor type: ${sensorType}`)
      }
    },
    enabled: enabled && !!pondId && !!sensorType,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 3000, // Consider data stale after 3 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  })
}
