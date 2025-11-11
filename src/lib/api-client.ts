// Use production URLs
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use localhost for local development
    return 'http://localhost:8000'
  }
  // Server-side: use localhost
  return 'http://localhost:8000'
}

// Get API URL with proper fallback
const getApiUrl = () => {
  // If NEXT_PUBLIC_API_URL is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // For production (Vercel), use the production backend URL
  if (process.env.NODE_ENV === 'production') {
    // ใช้ Railway backend URL โดยตรง
    return 'https://web-production-7909d.up.railway.app'
  }
  
  // For development, use localhost
  return getApiBaseUrl()
}

const API_BASE_URL = getApiUrl()
const BACKEND_MIDDLE_URL = process.env.NEXT_PUBLIC_BACKEND_MIDDLE_URL || null
const RSPI_SERVER_YOKYOR = process.env.NEXT_PUBLIC_RSPI_SERVER_YOKYOR || null

interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface LoginCredentials {
  phone_number: string
  password: string
}

export interface User {
  id: string
  email: string
  role: 'owner' | 'operator' | 'viewer'
  created_at: string
  updated_at: string
}

// Push Notification interfaces
export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  user_agent?: string
}

export interface PushMessageData {
  user_id: number
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  url?: string
  tag?: string
  data?: Record<string, any>
  require_interaction?: boolean
  silent?: boolean
  vibrate?: number[]
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface ShrimpAlertRequest {
  user_id: number
  body?: string
  image?: string
  url?: string
  data?: {
    pond_id?: string
    timestamp?: string
    [key: string]: any
  }
}

export interface PushNotificationSettings {
  user_id: number
  sensor_alerts: boolean
  pond_updates: boolean
  system_notifications: boolean
  maintenance_alerts: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface Pond {
  id: string
  name: string
  location?: string
  notes?: string
  date?: string
  size?: number
  dimensions?: string
  depth?: number
  shrimp_count?: number
  owner_user_id: string
  external_id?: string
  created_at: string
  updated_at: string
}

export interface SensorReading {
  id: string
  pond_id: string
  timestamp: string
  metrics: {
    temperature?: number
    ph?: number
    salinity?: number
    dissolved_oxygen?: number
    ammonia?: number
    turbidity?: number
    [key: string]: any
  }
  source: string
  received_at: string
}

export interface MediaAsset {
  id: string
  pond_id: string
  type: 'image' | 'video'
  url: string
  thumbnail_url?: string
  mime_type: string
  captured_at: string
  meta: Record<string, any>
}

export interface Insight {
  id: string
  pond_id: string
  title: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  tags: string[]
  created_at: string
  source: string
}

export interface ControlLog {
  id: string
  pond_id: string
  control_type: string
  value: any
  actor: string
  created_at: string
}

export interface Event {
  id: string
  pond_id: string
  type: 'sensor_reading' | 'control_action' | 'alert' | 'media_capture' | 'maintenance'
  title?: string
  message?: string
  timestamp?: string
  created_at: string
  source?: string
  metrics?: Record<string, any>
}

export interface PondStatus {
  pond_id: string
  status: 'good' | 'warning' | 'critical'
  last_reading: SensorReading
  alerts: Insight[]
}

export interface TimeRange {
  from: string
  to: string
}

export interface PaginationParams {
  cursor?: string
  limit?: number
}

export interface CreatePondRequest {
  name: string
  location?: string
  notes?: string
  date?: string
  size?: number
  dimensions?: string
  depth?: number
  shrimp_count?: number
  external_id?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(path: string, config?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`
    const defaultConfig: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    const finalConfig = { ...defaultConfig, ...config }

    try {
      const response = await fetch(url, finalConfig)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = `HTTP error! status: ${response.status}`
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: any) =>
              `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg || err.message || err}`
            ).join(', ')
          } else {
            errorMessage = errorData.detail
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }

        return {
          data: null as T,
          error: errorMessage,
        }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return {
          data: null as T,
          error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
        }
      }

      if (errorMessage.includes('Unexpected token') || errorMessage.includes('JSON')) {
        return {
          data: null as T,
          error: 'เกิดข้อผิดพลาดในการประมวลผลข้อมูลจากเซิร์ฟเวอร์',
        }
      }

      return {
        data: null as T,
        error: errorMessage,
      }
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const formData = new URLSearchParams()
    formData.append('username', credentials.phone_number)
    formData.append('password', credentials.password)

    return this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
  }

  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    return this.request<User>('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  // Pond endpoints
  async createPond(data: CreatePondRequest, token: string): Promise<ApiResponse<Pond>> {
    
    // Send to main backend
    const mainResponse = await this.request<Pond>('/api/v1/ponds/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    // Also send to RSPI server if configured
    if (RSPI_SERVER_YOKYOR) {
      try {
        const rspiResponse = await fetch(`${RSPI_SERVER_YOKYOR}/example_info_pond`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
      } catch (error) {
        // Don't fail the main request if RSPI fails
      }
    }
    
    // Also send to backend middle if configured
    if (BACKEND_MIDDLE_URL) {
      try {
        const middleResponse = await fetch(`${BACKEND_MIDDLE_URL}/example_info_pond`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
      } catch (error) {
        // Don't fail the main request if middle fails
      }
    }
    
    return mainResponse
  }

  async getPonds(token: string): Promise<ApiResponse<Pond[]>> {
    return this.request<Pond[]>('/api/v1/ponds/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getPond(id: string, token: string): Promise<ApiResponse<Pond>> {
    return this.request<Pond>(`/api/v1/ponds/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async updatePond(id: string, data: Partial<CreatePondRequest>, token: string): Promise<ApiResponse<Pond>> {
    return this.request<Pond>(`/api/v1/ponds/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  async deletePond(id: string, token: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/ponds/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  // Sensor readings endpoints
  async getSensorReadings(pondId: string, token: string, params?: PaginationParams): Promise<ApiResponse<SensorReading[]>> {
    const queryParams = new URLSearchParams()
    if (params?.cursor) queryParams.append('cursor', params.cursor)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const url = `/api/v1/ponds/${pondId}/readings${queryString ? `?${queryString}` : ''}`
    
    return this.request<SensorReading[]>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  // Latest sensor data (optimized batch storage)
  async getLatestSensorData(pondId: string, token?: string): Promise<ApiResponse<any>> {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return this.request<any>(`/api/v1/sensors/latest/${pondId}`, {
      method: 'GET',
      headers,
    })
  }

  // Sensor batch history
  async getSensorBatchHistory(pondId: string, limit?: number): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (limit) queryParams.append('limit', limit.toString())
    
    const queryString = queryParams.toString()
    const url = `/api/v1/sensors/batches/${pondId}${queryString ? `?${queryString}` : ''}`
    
    return this.request<any>(url, {
      method: 'GET',
    })
  }

  // Send batch sensor data
  async sendBatchSensorData(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/sensors/batch-sensor-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  // Media endpoints
  async getMedia(pondId: string, token: string, params?: PaginationParams): Promise<ApiResponse<MediaAsset[]>> {
    const queryParams = new URLSearchParams()
    if (params?.cursor) queryParams.append('cursor', params.cursor)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const url = `/api/v1/ponds/${pondId}/media${queryString ? `?${queryString}` : ''}`
    
    return this.request<MediaAsset[]>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  // Control endpoints
  async sendControl(pondId: string, controlType: string, value: any, token: string): Promise<ApiResponse<ControlLog>> {
    return this.request<ControlLog>(`/api/v1/ponds/${pondId}/control`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ control_type: controlType, value }),
    })
  }

  // Push Notification endpoints
  async getVapidKeys(): Promise<ApiResponse<{ public_key: string; private_key: string; email: string }>> {
    return this.request<{ public_key: string; private_key: string; email: string }>('/api/v1/push/vapid-keys', {
      method: 'GET',
    })
  }

  async subscribeToPush(subscriptionData: PushSubscriptionData, token: string): Promise<ApiResponse<{ id: string; user_id: number; endpoint: string; keys: any; created_at: string; is_active: boolean }>> {
    return this.request<{ id: string; user_id: number; endpoint: string; keys: any; created_at: string; is_active: boolean }>('/api/v1/push/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    })
  }

  async getPushSubscriptions(token: string): Promise<ApiResponse<Array<{ id: string; user_id: number; endpoint: string; keys: any; created_at: string; is_active: boolean }>>> {
    return this.request<Array<{ id: string; user_id: number; endpoint: string; keys: any; created_at: string; is_active: boolean }>>('/api/v1/push/subscriptions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async unsubscribeFromPush(subscriptionId: string, token: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/v1/push/unsubscribe/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async sendPushMessage(messageData: PushMessageData, token: string): Promise<ApiResponse<{ success: boolean; message: string; sent_count: number; failed_count: number; errors?: string[] }>> {
    return this.request<{ success: boolean; message: string; sent_count: number; failed_count: number; errors?: string[] }>('/api/v1/push/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    })
  }

  async sendShrimpAlert(alertData: ShrimpAlertRequest, token: string): Promise<ApiResponse<{ success: boolean; message: string; sent_count: number; failed_count: number; errors?: string[] }>> {
    // สร้าง message data สำหรับ shrimp alert
    const messageData: PushMessageData = {
      user_id: alertData.user_id,
      title: "พบกุ้งลอยบนผิวน้ำ!!!", // หัวข้อจะถูก override ใน backend
      body: alertData.body || "ตรวจพบกุ้งลอยบนผิวน้ำ ควรตรวจสอบทันที",
      image: alertData.image,
      url: alertData.url,
      tag: "shrimp-alert", // ใช้ tag นี้เพื่อให้ backend รู้ว่าเป็น shrimp alert
      data: alertData.data,
      require_interaction: true,
      silent: false,
      vibrate: [200, 100, 200, 100, 200]
    }

    return this.sendPushMessage(messageData, token)
  }

  async getPushSettings(token: string): Promise<ApiResponse<PushNotificationSettings>> {
    return this.request<PushNotificationSettings>('/api/v1/push/settings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async updatePushSettings(settings: Partial<PushNotificationSettings>, token: string): Promise<ApiResponse<PushNotificationSettings>> {
    return this.request<PushNotificationSettings>('/api/v1/push/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })
  }

  // History endpoints
  async getHistory(pondId: string, token: string, timeRange?: TimeRange): Promise<ApiResponse<Event[]>> {
    const queryParams = new URLSearchParams()
    if (timeRange?.from) queryParams.append('from', timeRange.from)
    if (timeRange?.to) queryParams.append('to', timeRange.to)
    
    const queryString = queryParams.toString()
    const url = `/api/v1/ponds/${pondId}/history${queryString ? `?${queryString}` : ''}`
    
    return this.request<Event[]>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getBatchData(pondId: string, token?: string): Promise<ApiResponse<any>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const url = `/api/v1/sensors/yorrkung-batches/${pondId}`
    
    const response = await this.request<any>(url, {
      method: 'GET',
      headers,
    })
    
    return response
  }

  // Shrimp size graph data
  async getShrimpSizeGraphData(pondId: number, timeframe: string = '1D', hours: number = 24): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    queryParams.append('timeframe', timeframe)
    queryParams.append('hours', hours.toString())
    
    const url = `/api/v1/sensors/graph-shrimpsize/${pondId}?${queryParams.toString()}`
    
    return this.request<any>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/api/v1/health', {
      method: 'GET',
    })
  }

  // Alert methods
  async createAlert(alertData: any, token: string): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/alerts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    })
  }

  async getUserAlerts(userId: number, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getPondAlerts(pondId: number, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/pond/${pondId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getUserUnreadAlerts(userId: number, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/user/${userId}/unread`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getPondUnreadAlerts(pondId: number, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/pond/${pondId}/unread`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async markAlertAsRead(alertId: string, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/${alertId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async markAlertAsUnread(alertId: string, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/${alertId}/unread`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getUserAlertStats(userId: number, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/user/${userId}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getPondBadgeCount(pondId: number, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/pond/${pondId}/badge-count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async deleteAlert(alertId: string, token: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/alerts/${alertId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async sendAlertNotification(alertData: any, token: string): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/push/send-alert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    })
  }

  async sendPondAlertNotification(alertData: any, token: string): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/push/send-pond-alert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
