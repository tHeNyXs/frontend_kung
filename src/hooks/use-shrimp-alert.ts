import { useMutation } from '@tanstack/react-query';
import { apiClient, ShrimpAlertRequest } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

export function useSendShrimpAlert() {
  const { accessToken } = useAuth();
  
  return useMutation({
    mutationFn: async (alertData: ShrimpAlertRequest) => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      return await apiClient.sendShrimpAlert(alertData, accessToken);
    },
    onSuccess: (data) => {
      console.log('Shrimp alert sent successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to send shrimp alert:', error);
    }
  });
}
