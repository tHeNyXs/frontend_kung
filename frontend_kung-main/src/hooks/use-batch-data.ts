import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useBatchData(pondId: string) {
  return useQuery({
    queryKey: ['batch-data', pondId],
    queryFn: async () => {
      const response = await apiClient.getBatchData(pondId)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    enabled: !!pondId,
    // Fetch every 5 seconds for real-time updates
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 3000, // Consider data stale after 3 seconds
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })
}
