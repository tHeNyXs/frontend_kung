export interface User {
  id: string
  email: string
  role: 'owner' | 'operator' | 'viewer'
  created_at: string
  updated_at: string
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

// Graph data types
export interface GraphDataPoint {
  timestamp: string
  value: number
  status?: string
}

export interface GraphDataResponse {
  sensor_type: string
  data_points: GraphDataPoint[]
  unit?: string
  min_value?: number
  max_value?: number
  average_value?: number
  trend?: string
}

export interface MultiSensorGraphResponse {
  pond_id: number
  sensors: Record<string, GraphDataResponse>
  time_range: {
    start_time: string
    end_time: string
  }
  total_points: number
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

// Batch sensor data types
export interface BatchSensorData {
  pondId: string
  timestamp: string
  DO?: number
  PH?: number
  Temp?: number
  Size?: number
  Mineral?: number
  SizePic?: string
  PicFood?: string
  PicColorWater?: string
}

export interface SensorValue {
  value: number | string
  type: 'numeric' | 'url' | 'string'
  status: 'green' | 'yellow' | 'red' | 'info'
  timestamp?: string
}

export interface BatchSensorResponse {
  success: boolean
  message: string
  data: {
    batchId: string
    pondId: string
    timestamp: string
    sensors: Record<string, SensorValue>
  }
}

export interface LatestSensorData {
  success: boolean
  data: Record<string, SensorValue>
  pondId: number
  source: 'batch' | 'individual'
  timestamp: string
}

export interface SensorBatch {
  id: string
  pond_id: number
  timestamp: string
  sensors: Record<string, SensorValue>
  created_at: string
  source: string
}

export interface BatchHistoryResponse {
  success: boolean
  data: {
    pondId: number
    batches: SensorBatch[]
    count: number
  }
  timestamp: string
}