'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Dot } from 'recharts'
import { GraphDataResponse } from '@/lib/types'

interface SensorGraphProps {
  data: GraphDataResponse
  color?: string
  height?: number
}

const SensorGraph: React.FC<SensorGraphProps> = ({ 
  data, 
  color = '#10B981', 
  height = 200 
}) => {
  // Transform data for recharts
  const chartData = data.data_points.map((point, index) => {
    // Parse timestamp directly without timezone conversion
    const date = new Date(point.timestamp)
    const isShrimpSize = data.sensor_type?.includes('Shrimp Size')
    
    // Determine if we should show date or time based on timeframe
    const showDateOnly = isShrimpSize || (data as any).timeframe === '7D' || (data as any).timeframe === '30D'
    
    // For date display, only show date for the first point of each day
    let timeLabel = ''
    if (showDateOnly) {
      // Check if this is the first point of a new day
      const prevDate = index > 0 ? new Date(data.data_points[index - 1].timestamp) : null
      const isFirstPointOfDay = index === 0 || 
        (prevDate && (
          prevDate.getFullYear() !== date.getFullYear() ||
          prevDate.getMonth() !== date.getMonth() ||
          prevDate.getDate() !== date.getDate()
        ))
      
      // Only show date if it's the first point of the day
      timeLabel = isFirstPointOfDay 
        ? `${date.getDate()} ${date.toLocaleDateString('th-TH', { month: 'short' })}`
        : '' // Empty string for subsequent points of the same day
    } else {
      // For 1D timeframe, show time with 3-hour intervals
      const hour = date.getHours()
      const minute = date.getMinutes()
      
      // Only show time labels at 3-hour intervals (0, 3, 6, 9, 12, 15, 18, 21)
      if (hour % 3 === 0 && minute === 0) {
        timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      } else {
        timeLabel = '' // Empty string for other times
      }
    }
    
    return {
      time: timeLabel,
      value: parseFloat(point.value.toFixed(2)), // Round to 2 decimal places
      fullTime: `${date.getDate()} ${date.toLocaleDateString('th-TH', { month: 'long' })} ${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
      status: point.status
    }
  })

  // Calculate trend indicator
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↗️'
      case 'decreasing':
        return '↘️'
      default:
        return '→'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-500'
      case 'decreasing':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.fullTime}</p>
          <p className="text-sm text-gray-600">
            {parseFloat(data.value.toFixed(2))} {data.unit || ''}
          </p>
          <p className="text-xs text-gray-500">
            Status: <span className={`font-medium ${
              data.status === 'green' ? 'text-green-600' : 
              data.status === 'yellow' ? 'text-yellow-600' : 
              data.status === 'red' ? 'text-red-600' : 
              data.status === 'gray' ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {data.status === 'gray' ? 'Wait Data' : data.status}
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-800">
            {data.sensor_type}
          </h3>
          <span className={`text-sm font-medium ${getTrendColor(data.trend || 'stable')}`}>
            {getTrendIcon(data.trend || 'stable')} {data.trend || 'stable'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="font-bold text-2xl text-gray-800">
            {parseFloat((data.average_value || 0).toFixed(2))}
            {data.unit && <span className="text-sm font-normal text-gray-500 ml-1">{data.unit}</span>}
          </div>
          <div className="text-sm text-gray-500">
            {data.sensor_type?.includes('Shrimp Size') ? 'Last 30D' : 
             (data as any).timeframe === '1D' ? 'Today' :
             (data as any).timeframe === '7D' ? '7 days ago' :
             (data as any).timeframe === '30D' ? '30 days ago' : 'Last 24h'}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Min: {parseFloat((data.min_value || 0).toFixed(2))}</span>
          <span>Max: {parseFloat((data.max_value || 0).toFixed(2))}</span>
          <span>Avg: {parseFloat((data.average_value || 0).toFixed(2))}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${data.sensor_type.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              interval={0}
              tickFormatter={(value) => {
                // Only show tick if there's a value (not empty string)
                return value || ''
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => parseFloat(value.toFixed(2)).toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${data.sensor_type.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase()})`}
              dot={(props: any) => {
                const { cx, cy, payload, index } = props
                const isWaitingData = payload?.value === 0.0 && payload?.status === 'gray'
                return (
                  <Dot
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={isWaitingData ? 2 : 4}
                    fill={isWaitingData ? '#9CA3AF' : color}
                    strokeWidth={isWaitingData ? 1 : 2}
                    stroke={isWaitingData ? '#6B7280' : color}
                    opacity={isWaitingData ? 0.6 : 1}
                  />
                )
              }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
      </div>
    </div>
  )
}

export default SensorGraph
