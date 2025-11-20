import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/providers/auth-provider'
import type { MediaAsset } from '@/lib/types'

interface MediaResponse {
  data: MediaAsset[]
}

export function useMedia(pondId: string, filters?: { type?: string; limit?: number }) {
  const { accessToken } = useAuth()
  
  return useQuery({
    queryKey: ['media', pondId, filters],
    queryFn: async (): Promise<MediaAsset[]> => {
      if (!accessToken) throw new Error('No access token')
      const response = await apiClient.getMedia(
        pondId,
        accessToken,        // token ต้องอยู่ตัวกลาง
        filters || {}       // params อยู่ตัวท้าย
      )
      
      // Ensure we return MediaAsset[] by properly typing the response
      const typedResponse = response as MediaResponse
      return typedResponse.data || []
    },
    enabled: !!pondId && !!accessToken,
  })
}

export function useLatestMedia(pondId: string, limit: number = 10) {
  const { accessToken } = useAuth()
  
  return useQuery({
    queryKey: ['latest-media', pondId, limit],
    queryFn: async (): Promise<MediaAsset[]> => {
      if (!accessToken) throw new Error('No access token')
        const response = await apiClient.getMedia(
          pondId,
          accessToken,   // token ต้องอยู่ตรงกลาง
          { limit }      // params อยู่ตัวสุดท้าย
        )
        
      // Ensure we return MediaAsset[] by properly typing the response
      const typedResponse = response as MediaResponse
      return typedResponse.data || []
    },
    enabled: !!pondId && !!accessToken,
  })
}
