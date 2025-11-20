import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/providers/auth-provider'
import type { Pond, CreatePondRequest } from '@/lib/types'

interface PondsResponse {
  data: Pond[]
}

interface PondResponse {
  data: Pond
}

export function usePonds() {
  const { user, accessToken } = useAuth()
  
  console.log('🔍 usePonds - accessToken:', !!accessToken)
  console.log('🔍 usePonds - user:', user)
  
  return useQuery({
    queryKey: ['ponds'],
    queryFn: async (): Promise<Pond[]> => {
      if (!accessToken) {
        console.error('❌ usePonds - No access token available')
        throw new Error('No access token')
      }
      console.log('🔍 Fetching ponds with access token:', accessToken)
      
      try {
        const response = await apiClient.getPonds(accessToken)
        console.log('📡 Ponds response:', response)
        
        // Check for API error
        if (response.error) {
          console.error('API Error:', response.error)
          throw new Error(`API Error: ${response.error}`)
        }
        
        // Handle the actual API response structure
        if (response.data && Array.isArray(response.data)) {
          // Direct array response
          console.log('📊 Direct array response:', response.data.length, 'ponds')
          return response.data
        } else if (response.data && typeof response.data === 'object' && 'ponds' in response.data && Array.isArray((response.data as any).ponds)) {
          // Paginated response with ponds array
          console.log('📊 Paginated response:', (response.data as any).ponds.length, 'ponds')
          return (response.data as any).ponds
        } else {
          console.warn('Unexpected response structure:', response)
          return []
        }
      } catch (error) {
        console.error('Error in usePonds:', error)
        throw error
      }
    },
    enabled: !!accessToken,
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })
}

export function usePond(pondId: string) {
  const { accessToken } = useAuth()
  
  return useQuery({
    queryKey: ['pond', pondId],
    queryFn: async (): Promise<Pond> => {
      if (!accessToken) throw new Error('No access token')
      const response = await apiClient.getPond(pondId, accessToken)
      
      // Check for API error
      if (response.error) {
        console.error('API Error:', response.error)
        throw new Error(response.error)
      }
      
      // Ensure we return Pond by properly typing the response
      const typedResponse = response as PondResponse
      return typedResponse.data
    },
    enabled: !!pondId && !!accessToken,
  })
}

export function useCreatePond() {
  const queryClient = useQueryClient()
  const { accessToken, user, isAuthenticated } = useAuth()
  
  return useMutation({
    mutationFn: async (data: CreatePondRequest): Promise<Pond> => {
      console.log('🔍 useCreatePond - accessToken:', !!accessToken)
      console.log('🔍 useCreatePond - user:', user)
      console.log('🔍 useCreatePond - isAuthenticated:', isAuthenticated)
      
      if (!accessToken) {
        console.error('❌ No access token available')
        console.error('❌ User state:', { user, isAuthenticated })
        throw new Error('กรุณาเข้าสู่ระบบก่อนสร้างบ่อ')
      }
      
      try {
        console.log('🔍 Creating pond with data:', data)
        console.log('🔑 Using access token:', accessToken)
        console.log('🔍 Data types:', {
          name: typeof data.name,
          size: typeof data.size,
          depth: typeof data.depth,
          shrimp_count: typeof data.shrimp_count
        })
        
        const response = await apiClient.createPond(data, accessToken)
        console.log('📡 Create pond response:', response)
        
        // Check for API error
        if (response.error) {
          console.error('❌ API Error:', response.error)
          throw new Error(`ไม่สามารถสร้างบ่อได้: ${response.error}`)
        }
        
        // Handle the actual API response structure
        if (response.data) {
          console.log('✅ Pond created successfully:', response.data)
          return response.data
        } else {
          console.error('❌ No data in response:', response)
          throw new Error('ไม่ได้รับข้อมูลบ่อจากเซิร์ฟเวอร์')
        }
      } catch (error) {
        console.error('💥 Error creating pond:', error)
        if (error instanceof Error) {
          // If it's already our custom error, re-throw it
          if (error.message.includes('ไม่สามารถสร้างบ่อได้') || error.message.includes('กรุณาเข้าสู่ระบบ')) {
            throw error
          }
          // Otherwise, wrap it
          throw new Error(`ไม่สามารถสร้างบ่อได้: ${error.message}`)
        } else {
          throw new Error('ไม่สามารถสร้างบ่อได้: เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
        }
      }
    },
    onSuccess: (newPond) => {
      console.log('✅ Pond created successfully:', newPond)
      queryClient.invalidateQueries({ queryKey: ['ponds'] })
    },
  })
}

export function useDeletePond() {
  const queryClient = useQueryClient()
  const { accessToken } = useAuth()
  
  return useMutation({
    mutationFn: async (pondId: string): Promise<void> => {
      if (!accessToken) throw new Error('No access token')
      try {
        console.log('🗑️ Deleting pond with ID:', pondId)
        console.log('🔑 Using access token:', accessToken)
        const response = await apiClient.deletePond(pondId, accessToken)
        console.log('📡 Delete pond response:', response)
        
        // Check for API error
        if (response.error) {
          console.error('API Error:', response.error)
          throw new Error(`API Error: ${response.error}`)
        }
      } catch (error) {
        console.error('Error deleting pond:', error)
        throw error
      }
    },
    onSuccess: () => {
      console.log('✅ Pond deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['ponds'] })
    },
  })
}
