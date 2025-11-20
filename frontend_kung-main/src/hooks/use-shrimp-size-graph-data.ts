import { useQuery } from '@tanstack/react-query'
import { TimeframeOption } from '@/components/TimeframeSelector'
import { apiClient } from '@/lib/api-client'


interface ShrimpSizeGraphData {
  sensor_type: string
  data_points: Array<{
    timestamp: string
    value: number
    status: string
  }>
  unit: string
  min_value: number
  max_value: number
  average_value: number
  trend: string
}

interface ShrimpSizeGraphResponse {
  success: boolean
  pond_id: number
  sensor_data: ShrimpSizeGraphData
  time_range: {
    start_time: string
    end_time: string
  }
  total_points: number
  timeframe: string
  hours: number
}

interface UseShrimpSizeGraphDataOptions {
  pondId: number
  timeframe?: TimeframeOption
  hours?: number
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

export const useShrimpSizeGraphData = ({ 
  pondId, 
  timeframe = '1D',
  hours, 
  enabled = true 
}: UseShrimpSizeGraphDataOptions) => {
  // Use timeframe to determine hours if not explicitly provided
  const actualHours = hours || timeframeToHours(timeframe)
  
  return useQuery({
    queryKey: ['shrimp-size-graph-data', pondId, actualHours, timeframe],
    queryFn: async (): Promise<ShrimpSizeGraphResponse> => {
      try {
        // Use the same endpoint pattern as other sensors
        const params = new URLSearchParams({
          hours: actualHours.toString(),
          timeframe: timeframe,
          sensor_types: 'shrimpSize'  // Use shrimpSize as sensor type
        })
        
        const response = await (apiClient as any).request(`/api/v1/sensors/graph-simple/${pondId}?${params}`, {
          method: 'GET',
        })
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        const backendData = response.data
        
        // Extract shrimp size data from the sensors object like other cards
        if (backendData.success && backendData.sensors && backendData.sensors['shrimpSize']) {
          return {
            success: true,
            pond_id: backendData.pond_id,
            sensor_data: backendData.sensors['shrimpSize'],
            time_range: backendData.time_range || {
              start_time: new Date(Date.now() - actualHours * 60 * 60 * 1000).toISOString(),
              end_time: new Date().toISOString()
            },
            total_points: backendData.total_points || 0,
            timeframe: backendData.timeframe || timeframe,
            hours: backendData.hours || actualHours
          }
        } else {
          // Return empty data structure instead of throwing error
          return {
            success: true,
            pond_id: backendData.pond_id || pondId,
            sensor_data: {
              sensor_type: 'Shrimp Size (CM)',
              data_points: [],
              unit: 'cm',
              min_value: 0,
              max_value: 0,
              average_value: 0,
              trend: 'stable'
            },
            time_range: backendData.time_range || {
              start_time: new Date(Date.now() - actualHours * 60 * 60 * 1000).toISOString(),
              end_time: new Date().toISOString()
            },
            total_points: 0,
            timeframe: backendData.timeframe || timeframe,
            hours: backendData.hours || actualHours
          }
        }
      } catch (error) {
        console.error('Error fetching shrimp size data:', error)
        throw error
      }
    },
    enabled: enabled && !!pondId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    gcTime: 600000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  })
}
