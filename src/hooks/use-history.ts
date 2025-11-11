import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/providers/auth-provider'

interface Event {
  id: string
  timestamp: string
  type: string
  description?: string   
  value?: string | number
}


interface HistoryResponse {
  data: Event[]
}

interface Pagination {
  page: number
  limit: number
}

export function useHistory(pondId: string, pagination?: Pagination) {
  const { accessToken } = useAuth()
  
  return useQuery({
    queryKey: ['history', pondId, pagination],
    queryFn: async (): Promise<Event[]> => {
      if (!accessToken) {
        throw new Error('No access token available')
      }
      
      const response = await apiClient.getHistory(
        pondId,
        accessToken,
        {
          from: pagination ? String(pagination.page) : "",
          to: pagination?.limit ? String(pagination.limit) : ""
        }
      )
      
      // Ensure we return Event[] by properly typing the response
      const typedResponse = response as HistoryResponse
      return typedResponse.data || []
    },
    enabled: !!accessToken && !!pondId,
  })
}