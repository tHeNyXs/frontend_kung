/**
 * Alert Management Hook
 * Custom hook for managing alert states and API calls
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../providers/auth-provider';

interface AlertData {
  id: string;
  alert_type: string;
  pond_id: number;
  user_id: number;
  title: string;
  body: string;
  status: 'unread' | 'read' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  image_url?: string;
  target_url?: string;
  data?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  read_at?: string;
}

interface AlertResponse {
  success: boolean;
  message: string;
  data?: AlertData;
  alerts?: AlertData[];
  total_count?: number;
  unread_count?: number;
}

interface AlertStats {
  total_alerts: number;
  unread_alerts: number;
  alerts_by_type: Record<string, number>;
  alerts_by_pond: Record<number, number>;
  alerts_by_severity: Record<string, number>;
}

interface BadgeCountResponse {
  success: boolean;
  pond_id: number;
  unread_count: number;
  has_alerts: boolean;
}

export const useAlerts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  // Get user alerts
  const getUserAlerts = useCallback(async (userId: number): Promise<AlertResponse> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getUserAlerts(userId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch user alerts';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Get pond alerts
  const getPondAlerts = useCallback(async (pondId: number): Promise<AlertResponse> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPondAlerts(pondId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch pond alerts';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Get user unread alerts
  const getUserUnreadAlerts = useCallback(async (userId: number): Promise<AlertResponse> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getUserUnreadAlerts(userId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch user unread alerts';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Get pond unread alerts
  const getPondUnreadAlerts = useCallback(async (pondId: number): Promise<AlertResponse> => {
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token available',
        alerts: [],
        total_count: 0,
        unread_count: 0
      };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPondUnreadAlerts(pondId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch pond unread alerts';
      setError(errorMessage);
      // Return default response instead of throwing
      return {
        success: false,
        message: errorMessage,
        alerts: [],
        total_count: 0,
        unread_count: 0
      };
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Mark alert as read
  const markAlertAsRead = useCallback(async (alertId: string): Promise<AlertResponse> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.markAlertAsRead(alertId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to mark alert as read';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Mark alert as unread
  const markAlertAsUnread = useCallback(async (alertId: string): Promise<AlertResponse> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.markAlertAsUnread(alertId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to mark alert as unread';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Get user alert stats
  const getUserAlertStats = useCallback(async (userId: number): Promise<AlertStats> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getUserAlertStats(userId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch alert stats';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Get pond badge count
  const getPondBadgeCount = useCallback(async (pondId: number): Promise<BadgeCountResponse> => {
    if (!accessToken) {
      return {
        success: false,
        pond_id: pondId,
        unread_count: 0,
        has_alerts: false
      };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getPondBadgeCount(pondId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch badge count';
      setError(errorMessage);
      // Return default response instead of throwing
      return {
        success: false,
        pond_id: pondId,
        unread_count: 0,
        has_alerts: false
      };
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Create alert
  const createAlert = useCallback(async (alertData: {
    alert_type: string;
    pond_id: number;
    user_id: number;
    title: string;
    body: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    image_url?: string;
    target_url?: string;
    data?: Record<string, any>;
  }): Promise<AlertResponse> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createAlert(alertData, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create alert';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Delete alert
  const deleteAlert = useCallback(async (alertId: string): Promise<AlertResponse> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.deleteAlert(alertId, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete alert';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Send alert notification
  const sendAlertNotification = useCallback(async (alertData: {
    alert_type: string;
    pond_id: number;
    user_id: number;
    title: string;
    body: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    image_url?: string;
    target_url?: string;
    data?: Record<string, any>;
  }): Promise<any> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.sendAlertNotification(alertData, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to send alert notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Send pond alert notification
  const sendPondAlertNotification = useCallback(async (alertData: {
    alert_type: string;
    pond_id: number;
    user_id: number;
    title: string;
    body: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    image_url?: string;
    target_url?: string;
    data?: Record<string, any>;
  }): Promise<any> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.sendPondAlertNotification(alertData, accessToken);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to send pond alert notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return {
    isLoading,
    error,
    getUserAlerts,
    getPondAlerts,
    getUserUnreadAlerts,
    getPondUnreadAlerts,
    markAlertAsRead,
    markAlertAsUnread,
    getUserAlertStats,
    getPondBadgeCount,
    createAlert,
    deleteAlert,
    sendAlertNotification,
    sendPondAlertNotification
  };
};
