import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/providers/auth-provider'

interface ControlCommand {
  pondId: string
  control_type: string
  value: string | number
}

interface ControlResponse {
  data: {
    success: boolean
    message: string
  }
}

export function useSendControl() {
  const { accessToken } = useAuth()
  
  return useMutation({
    mutationFn: async (command: ControlCommand): Promise<{ success: boolean; message: string }> => {
      if (!accessToken) {
        throw new Error('No access token available')
      }
      
      const response = await apiClient.sendControl(
        command.pondId, 
        command.control_type, 
        command.value, 
        accessToken
      )
      
      // Ensure we return the correct type by properly typing the response
      const typedResponse = response as unknown as ControlResponse
      return typedResponse.data
    },
  })
}