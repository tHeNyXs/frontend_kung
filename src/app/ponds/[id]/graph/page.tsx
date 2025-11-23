'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSensorGraphData } from '@/hooks/use-sensor-graph-data'
import { useShrimpSizeGraphData } from '@/hooks/use-shrimp-size-graph-data'
import SensorGraph from '@/components/SensorGraph'
import TimeframeSelector, { TimeframeOption } from '@/components/TimeframeSelector'

export default function GraphPage() {
  const router = useRouter()
  const params = useParams()
  const pondId = parseInt(params.id as string)
  
  // State for timeframe selection - separate for each sensor type
  const [timeframes, setTimeframes] = useState<Record<string, TimeframeOption>>({
    'DO': '1D',
    'pH': '1D', 
    'temperature': '1D',
    'shrimpSize': '1D'
  })

  const goBack = () => router.push('/ponds')

  // Function to update timeframe for specific sensor
  const updateTimeframe = (sensorType: string, timeframe: TimeframeOption) => {
    setTimeframes(prev => ({
      ...prev,
      [sensorType]: timeframe
    }))
  }

  // Fetch data for each sensor individually with proper timeframe sync
  const { data: doData, isLoading: isDOLoading, error: doError } = useSensorGraphData({
    pondId,
    sensorType: 'DO',
    timeframe: timeframes.DO,
    enabled: !!pondId
  })

  const { data: phData, isLoading: isPHLoading, error: phError } = useSensorGraphData({
    pondId,
    sensorType: 'pH',
    timeframe: timeframes.pH,
    enabled: !!pondId
  })

  const { data: tempData, isLoading: isTempLoading, error: tempError } = useSensorGraphData({
    pondId,
    sensorType: 'temperature',
    timeframe: timeframes.temperature,
    enabled: !!pondId
  })

  // Fetch shrimp size data with its specific timeframe
  const { 
    data: shrimpSizeData, 
    isLoading: isShrimpSizeLoading, 
    error: shrimpSizeError 
  } = useShrimpSizeGraphData({ 
    pondId,
    timeframe: timeframes.shrimpSize,
    enabled: !!pondId
  })

  // Define sensor colors
  const sensorColors = {
    'DO': '#10B981',      // Green
    'pH': '#F59E0B',      // Yellow
    'temperature': '#EF4444', // Red
    'shrimpSize': '#8B5CF6' // Purple
  }

  // Define sensor display names
  const sensorDisplayNames = {
    'DO': 'DO',
    'pH': 'pH',
    'temperature': 'Temperature',
    'shrimpSize': 'Shrimp Size (CM)'
  }

  // Create sensor data array for rendering
  const sensorDataArray: Array<{
    type: string
    data: any
    isLoading: boolean
    error: any
    color: string
  }> = [
    {
      type: 'DO',
      data: doData,
      isLoading: isDOLoading,
      error: doError,
      color: sensorColors.DO
    },
    {
      type: 'pH',
      data: phData,
      isLoading: isPHLoading,
      error: phError,
      color: sensorColors.pH
    },
    {
      type: 'temperature',
      data: tempData,
      isLoading: isTempLoading,
      error: tempError,
      color: sensorColors.temperature
    }
  ]


  return (
    <div className="w-full flex flex-col h-full bg-[#fcfaf7]">
      {/* Header */}
      <div className="bg-[#fcfaf7] w-full flex-shrink-0">
        <div className="flex items-center px-4 py-2 w-full">
          <div className="w-12 h-12 flex items-center justify-start cursor-pointer flex-shrink-0" onClick={goBack}>
            <div className="w-6 h-6 flex items-center justify-center">
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M18 8C18 8.41421 17.6642 8.75 17.25 8.75H2.56031L8.03063 14.2194C8.32368 14.5124 8.32368 14.9876 8.03063 15.2806C7.73757 15.5737 7.26243 15.5737 6.96937 15.2806L0.219375 8.53063C0.0785421 8.38995 -0.000590086 8.19906 -0.000590086 8C-0.000590086 7.80094 0.0785421 7.61005 0.219375 7.46937L6.96937 0.719375C7.26243 0.426319 7.73757 0.426319 8.03063 0.719375C8.32368 1.01243 8.32368 1.48757 8.03063 1.78062L2.56031 7.25H17.25C17.6642 7.25 18 7.58579 18 8V8Z" fill="#1C170D"/>
              </svg>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center pr-12">
            <h1 className="font-bold text-lg leading-6 text-[#1c170d] text-center m-0">บ่อที่ {pondId}</h1>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 flex flex-col gap-6">
        {/* Title Section */}
        <div className="text-center">
          <h2 className="font-bold text-xl text-[#1c170d] m-0">Sensor Data</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time Data (updates every 5 seconds)</p>
        </div>


        {/* Regular Sensor Cards (DO, pH, Temperature) */}
        <div className="flex flex-col gap-5">
          {sensorDataArray.map((sensor) => (
            <div key={sensor.type} className="bg-white rounded-lg p-4 shadow-sm border relative">
              {/* Header with Title and Timeframe Selector */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800 capitalize">
                  {sensorDisplayNames[sensor.type as keyof typeof sensorDisplayNames] || sensor.type}
                </h3>
                <TimeframeSelector
                  selectedTimeframe={timeframes[sensor.type] || '1D'}
                  onTimeframeChange={(timeframe) => updateTimeframe(sensor.type, timeframe)}
                  disabled={sensor.isLoading}
                />
              </div>
              
              {/* Sensor Graph */}
              {sensor.isLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Downloading Data {sensor.type}...</p>
                  </div>
                </div>
              ) : sensor.error ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-4xl mb-2">⚠️</div>
                  <p className="text-red-600 mb-2">Error Downloading Data {sensor.type}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Try again
                  </button>
                </div>
              ) : sensor.data && sensor.data.sensor_data ? (
                <SensorGraph
                  data={{
                    ...sensor.data.sensor_data,
                    sensor_type: sensorDisplayNames[sensor.type as keyof typeof sensorDisplayNames] || sensor.type,
                    timeframe: sensor.data.timeframe
                  }}
                  color={sensor.color}
                  height={200}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No information {sensor.type}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Shrimp Size Card */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border relative">
          {/* Header with Title and Timeframe Selector */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-800">
              Shrimp size (CM)
            </h3>
            <TimeframeSelector
              selectedTimeframe={timeframes.shrimpSize}
              onTimeframeChange={(timeframe) => updateTimeframe('shrimpSize', timeframe)}
              disabled={isShrimpSizeLoading}
            />
          </div>
          
          {/* ShrimpSize Graph */}
          {isShrimpSizeLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Downloading shrimp size...</p>
              </div>
            </div>
          ) : shrimpSizeError ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <p className="text-red-600 mb-2">Error Downloading shrimp szie</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try again
              </button>
            </div>
          ) : shrimpSizeData && (shrimpSizeData as any).sensor_data ? (
            <SensorGraph
              data={{
                ...(shrimpSizeData as any).sensor_data,
                timeframe: (shrimpSizeData as any).timeframe
              }}
              color="#8B5CF6"
              height={200}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No size shrimp data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
