'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePonds } from '@/hooks/use-ponds'
import { useLatestSensorData } from '@/hooks/use-readings'
import { useBatchData } from '@/hooks/use-batch-data'
import { useAuth } from '@/providers/auth-provider'
import { apiClient } from '@/lib/api-client'
import AlertBadge from '@/components/AlertBadge'
import AlertPopup from '@/components/AlertPopup'

export default function PondDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pondId = params.id as string
  const { data: ponds } = usePonds()
  const { accessToken, user } = useAuth()
  
  // Alert state
  const [showAlertPopup, setShowAlertPopup] = useState(false)
  const [alertRefreshTrigger, setAlertRefreshTrigger] = useState(0)
  
  // Find the current pond
  const pond = ponds?.find(p => p.id === pondId)
  
  // Debug logging
  console.log('🔍 Debug - pondId:', pondId)
  console.log('🔍 Debug - ponds:', ponds)
  console.log('🔍 Debug - found pond:', pond)

  // Use the new batch sensor data hook
  const { data: latestData, isLoading: isLoadingLatest, error } = useLatestSensorData(pondId)
  
  // Use batch data hook with 5-second refresh
  const { data: batchData, isLoading: isLoadingBatch, error: batchError } = useBatchData(pondId)

  // State for sensor data with fallback
  const [sensorData, setSensorData] = useState<{
    [key: string]: { value: any; status: string; timestamp: string | null; imageUrl?: string }
  }>({
    // Group 1: น้ำ
    DO: { value: 0.0, status: 'green', timestamp: null },
    pH: { value: 0.0, status: 'green', timestamp: null },
    temperature: { value: 0.0, status: 'green', timestamp: null },
    waterColor: { value: 'สีเขียว', status: 'green', timestamp: null },
    
    // Group 2: กุ้ง
    shrimpSize: { value: 0.0, status: 'green', timestamp: null },
    shrimpWeight: { value: 0.0, status: 'green', timestamp: null },
    
    // Group 3: สารแร่ธาตุ
    mineral1: { value: 0.0, status: 'green', timestamp: null },
    mineral2: { value: 0.0, status: 'green', timestamp: null },
    mineral3: { value: 0.0, status: 'green', timestamp: null },
    mineral4: { value: 0.0, status: 'green', timestamp: null },
    
    // Legacy data (for backward compatibility)
    minerals: { value: 0.0, status: 'red', timestamp: null }
  })

  const goBack = () => router.push('/ponds')

  const viewImage = (type: string) => {
    // Get the image URL from sensor data
    let imageUrl = ''
    
    switch (type) {
      case 'shrimp':
        imageUrl = sensorData.shrimpSize?.imageUrl || 'https://batch-example.com/size.ngrok'
        break
      case 'food':
        imageUrl = sensorData.food?.imageUrl || 'https://batch-example.com/food.ngrok'
        break
      case 'water':
        imageUrl = sensorData.waterColor?.imageUrl || 'https://batch-example.com/water.ngrok'
        break
      case 'shrimp_surface':
        imageUrl = sensorData.shrimpSurface?.imageUrl || 'https://batch-example.com/shrimp-surface.ngrok'
        break
      case 'shrimp_video':
        imageUrl = sensorData.shrimpVideo?.imageUrl || 'https://batch-example.com/shrimp-video.ngrok'
        break
      default:
        imageUrl = 'https://batch-example.com/default.ngrok'
    }
    
    // Open image/video in new tab
    if (imageUrl) {
      window.open(imageUrl, '_blank')
    } else {
      alert('ไม่พบลิงก์รูปภาพ/วิดีโอ')
    }
  }

  // Batch data is now handled by useBatchData hook with 5-second refresh

  // Update sensor data when latestData or batchData changes
  useEffect(() => {
      const newSensorData: { [key: string]: { value: any; status: string; timestamp: string | null; imageUrl?: string } } = { ...sensorData }
      
      // Debug logging
      console.log('🔍 Debug - latestData:', latestData)
      console.log('🔍 Debug - batchData:', batchData)
      
    // Process latest data (DO, pH, Temp, Water Color, Minerals)
    if (latestData?.data?.sensors) {
      
      // Map backend sensor names to frontend display names for latest data
      const latestSensorMapping: { [key: string]: string } = {
        // Group 1: น้ำ
        'DO': 'DO',
        'pH': 'pH',
        'temperature': 'temperature',
        'waterColor': 'waterColor',
        
        // Group 3: สารแร่ธาตุ
        'minerals_1': 'mineral1',
        'minerals_2': 'mineral2',
        'minerals_3': 'mineral3',
        'minerals_4': 'mineral4',
        'mineral1': 'mineral1',
        'mineral2': 'mineral2',
        'mineral3': 'mineral3',
        'mineral4': 'mineral4',
        
        // Image URLs from latest data
        'waterColorPicture': 'waterColorPicture',
        'sizePicture': 'sizePicture',
        'foodPicture': 'foodPicture',
        'kungOnWaterPicture': 'kungOnWaterPicture',
        'PicColorwater': 'PicColorwater',
        'PicKungOnWater': 'PicKungOnWater',
        
        // Legacy
        'minerals': 'minerals'
      }
      
      Object.keys(latestData.data.sensors).forEach((backendKey: string) => {
        const frontendKey = latestSensorMapping[backendKey] || backendKey
        const data = (latestData.data.sensors as any)[backendKey]
        
        if (data && typeof data === 'object') {
          if (backendKey === 'waterColorPicture') {
            // Store image URL for water color
            if (newSensorData.waterColor) {
              newSensorData.waterColor.imageUrl = data.value
            }
          } else if (backendKey === 'PicColorwater') {
            // Store image URL for water color (alternative name)
            if (newSensorData.waterColor) {
              newSensorData.waterColor.imageUrl = data.value
            }
          } else if (backendKey === 'kungOnWaterPicture') {
            // Store image URL for shrimp on water surface - หลัก
            if (!newSensorData.shrimpSurface) {
              newSensorData.shrimpSurface = { value: 'Shrimp Floating on Water', status: 'info', timestamp: data.timestamp || null }
            }
            newSensorData.shrimpSurface.imageUrl = String(data.value)
            newSensorData.shrimpSurface.timestamp = data.timestamp || null
          } else if (backendKey === 'PicKungOnWater') {
            // Store image URL for shrimp on water surface (alternative name)
            if (!newSensorData.shrimpSurface) {
              newSensorData.shrimpSurface = { value: 'Shrimp Floating on Water', status: 'info', timestamp: data.timestamp || null }
            }
            newSensorData.shrimpSurface.imageUrl = String(data.value)
            newSensorData.shrimpSurface.timestamp = data.timestamp || null
          } else {
            // Store regular sensor data
            newSensorData[frontendKey] = {
              value: data.value,
              status: data.status || 'green',
              timestamp: data.timestamp || latestData.data.timestamp || null,
              imageUrl: undefined
            }
          }
        }
      })
    }
    
    // Process batch data (Shrimp data)
    if (batchData?.success && batchData.data) {
      console.log('🔍 Debug - Processing batch data:', batchData)
      
      // Get the latest batch from the batches array
      const batches = batchData.data.batches || []
      const latestBatch = batches.length > 0 ? batches[batches.length - 1] : null
      
      console.log('🔍 Debug - Batches count:', batches.length)
      console.log('🔍 Debug - Latest batch:', latestBatch)
      
      if (latestBatch && latestBatch.sensors) {
        const sensors = latestBatch.sensors
        console.log('🔍 Debug - Sensors data:', sensors)
        
        // Process shrimp data from batch
        const batchMapping: { [key: string]: string } = {
          'size_cm': 'shrimpSize',
          'size_gram': 'shrimpWeight',
          'sizePicture': 'sizePicture',
          'foodPicture': 'foodPicture',
          'kungDinPicture': 'kungDinPicture'
        }
        
        Object.keys(batchMapping).forEach((batchKey: string) => {
          const frontendKey = batchMapping[batchKey]
          const data = sensors[batchKey]
          
          console.log(`🔍 Debug - Processing ${batchKey} -> ${frontendKey}:`, data)
          
          if (data !== undefined && data !== null) {
            if (batchKey === 'sizePicture') {
              // Store image URL for shrimp size
              if (newSensorData.shrimpSize) {
                newSensorData.shrimpSize.imageUrl = data.value || data
              }
            } else if (batchKey === 'foodPicture') {
              // Store image URL for food
              if (!newSensorData.food) {
                newSensorData.food = { value: 'Feed on Lift Net', status: 'info', timestamp: data.timestamp || latestBatch.timestamp || null }
              }
              newSensorData.food.imageUrl = String(data.value || data)
              newSensorData.food.timestamp = data.timestamp || latestBatch.timestamp || null
            } else if (batchKey === 'kungDinPicture') {
              // Store video URL for shrimp movement
              if (!newSensorData.shrimpVideo) {
                newSensorData.shrimpVideo = { value: 'Shrimp Movement Video', status: 'info', timestamp: data.timestamp || latestBatch.timestamp || null }
              }
              newSensorData.shrimpVideo.imageUrl = String(data.value || data)
              newSensorData.shrimpVideo.timestamp = data.timestamp || latestBatch.timestamp || null
            } else {
              // Store regular sensor data
              const value = data.value !== undefined ? data.value : data
              const status = data.status || 'green'
              
              newSensorData[frontendKey] = {
                value: value,
                status: status,
                timestamp: data.timestamp || latestBatch.timestamp || null,
                imageUrl: undefined
              }
              
              console.log(`🔍 Debug - Set ${frontendKey}:`, newSensorData[frontendKey])
            }
          }
        })
      } else {
        console.log('🔍 Debug - No latest batch or sensors found')
      }
    } else {
      console.log('🔍 Debug - No batch data or success=false, batchData:', batchData)
    }
    
    console.log('🔍 Debug - Final sensor data:', newSensorData)
    setSensorData(newSensorData)
  }, [latestData, batchData, isLoadingLatest, error, batchError])

  // Function to get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'border-[#01940D]'
      case 'yellow':
        return 'border-[#FFB600]'
      case 'red':
        return 'border-[#FF0004]'
      default:
        return 'border-gray-500'
    }
  }

  // Function to get background color with transparency
  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-[#C0FFC0]'
      case 'yellow':
        return 'bg-[#FFF585]'
      case 'red':
        return 'bg-[#FFA2A2]'
      default:
        return 'bg-gray-50'
    }
  }

  // Function to format value with unit
  const formatValue = (sensorType: string, value: any) => {
    // Helper function to round float values to 2 decimal places
    const roundFloat = (val: any) => {
      if (typeof val === 'number') {
        return Math.round(val * 100) / 100
      }
      return val
    }

    switch (sensorType) {
      case 'DO':
        return `${roundFloat(value)} mg/L`
      case 'pH':
        return roundFloat(value).toString()
      case 'temperature':
        return `${roundFloat(value)} °C`
      case 'shrimpSize':
        return `${roundFloat(value)} cm`
      case 'waterColor':
        return value
      case 'minerals':
        return `${roundFloat(value)} Kilogram`
      case 'mineral1':
      case 'mineral2':
        // สำหรับ Mineral 1-2: แสดงน้ำหนักเป็นกรัม
        return `${roundFloat(value)} Kilogram`
      case 'mineral3':
      case 'mineral4':
        // สำหรับ Mineral 3-4: แสดงน้ำหนักเป็นกรัม
        return `${roundFloat(value)} Liter`
      default:
        return value.toString()
    }
  }

  if (isLoadingLatest || isLoadingBatch) {
    return (
      <div className="w-full flex flex-col h-full bg-[#fcfaf7] items-center justify-center">
        <div className="text-lg text-[#1c170d]">Loading Data...</div>
        {isLoadingLatest && <div className="text-sm text-gray-500 mt-2">Loading Sensor Data...</div>}
        {isLoadingBatch && <div className="text-sm text-gray-500 mt-2">Loading Shrimp Data...</div>}
      </div>
    )
  }

  if (error || batchError) {
    const [countdown, setCountdown] = useState(10)

    const handleRefresh = () => {
      // Refresh the page
      window.location.reload()
    }

    // Auto refresh countdown
    useEffect(() => {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            console.log('🔄 Auto-refreshing page due to error...')
            window.location.reload()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }, [])

    return (
      <div className="w-full flex flex-col h-full bg-[#fcfaf7] items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-lg text-red-600 font-bold mb-2">An error occurred.:</div>
          {error && <div className="text-sm text-red-500 mt-1 mb-1">Sensor: {error.message}</div>}
          {batchError && <div className="text-sm text-red-500 mt-1 mb-1">Shrimp: {batchError.message}</div>}
          <div className="text-sm text-gray-500 mt-2 mb-6">Using backup data.</div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="bg-[#f2c245] hover:bg-[#e6b63d] text-[#1c170d] font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refesh page</span>
          </button>
          
          {/* Auto refresh countdown */}
          <div className="text-xs text-gray-400 mt-4">
            Auto-refreshing in… <span className="font-bold text-[#f2c245]">{countdown}</span> second...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col h-full bg-[#fcfaf7]">
      <style jsx global>{`
        .glasp-extension-toaster {
          display: none !important;
        }
      `}</style>
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
              <h1 className="font-bold text-lg leading-6 text-[#1c170d] text-center m-0">
                {pond?.name || `Pond ${pondId}`}
              </h1>
              {/* Alert Badge - อยู่ข้างๆ h1 */}
              {user && (
                <div className="ml-3">
                  <AlertBadge
                    key={`alert-badge-${alertRefreshTrigger}`}
                    pondId={parseInt(pondId)}
                    userId={Number(user.id)}
                    onClick={() => setShowAlertPopup(true)}
                    size="md"
                    showCount={true}
                    refreshTrigger={alertRefreshTrigger}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar Section */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-[#1c170d] m-0">วันนี้</h2>
            <div className="flex gap-2">
            {latestData?.source && (
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                latestData.source === 'batch' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {latestData.source === 'batch' ? '🚀 Batch Storage' : '📊 Individual'}
              </div>
            )}
          </div>
        </div>

          

          {/* Status Bar */}
          <div className="bg-[#fcfaf7] rounded-lg p-4">
            <div className="flex items-center justify-center space-x-8">
              {/* สถานะดีเยี่ยม */}
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 mb-2">Excellent status</div>
                <div className="w-20 h-3 bg-green-500 rounded-full shadow-sm"></div>
              </div>
              
              {/* กำลังปรับปรุง */}
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 mb-2">Currently improving</div>
                <div className="w-20 h-3 rounded-full shadow-sm" style={{backgroundColor: '#FFB600'}}></div>
              </div>
              
              {/* ซวยแล้ว!! */}
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 mb-2">An unexpected issue occurred!!</div>
                <div className="w-20 h-3 bg-red-500 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Cards - Grouped */}
        <div className="px-4 pb-8 flex flex-col gap-6">
          
          {/* Group 1: น้ำ */}
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-xl text-[#1c170d] mb-2">Category 1: Water</h2>
            
          {/* DO Card */}
           <div className={`${getBackgroundColor(sensorData.DO.status)} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.DO.status)} shadow-lg`}>
            <div>
              <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">DO (Oxygen)</h3>
              <div className="font-bold text-2xl text-[#1c170d] mb-3">{formatValue('DO', sensorData.DO.value)}</div>
              {sensorData.DO.timestamp && (
                <div className="text-xs text-gray-500">
                  Latest Update: {new Date(sensorData.DO.timestamp).toLocaleString('th-TH')}
                </div>
              )}
            </div>
          </div>

          {/* pH Card */}
           <div className={`${getBackgroundColor(sensorData.pH.status)} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.pH.status)} shadow-lg`}>
            <div>
              <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">pH</h3>
              <div className="font-bold text-2xl text-[#1c170d] mb-3">{formatValue('pH', sensorData.pH.value)}</div>
              {sensorData.pH.timestamp && (
                <div className="text-xs text-gray-500">
                  Latest Update: {new Date(sensorData.pH.timestamp).toLocaleString('th-TH')}
                </div>
              )}
            </div>
          </div>

          {/* Temperature Card */}
           <div className={`${getBackgroundColor(sensorData.temperature.status)} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.temperature.status)} shadow-lg`}>
            <div>
              <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">Temperature</h3>
              <div className="font-bold text-2xl text-[#1c170d] mb-3">{formatValue('temperature', sensorData.temperature.value)}</div>
              {sensorData.temperature.timestamp && (
                <div className="text-xs text-gray-500">
                  Latest Update: {new Date(sensorData.temperature.timestamp).toLocaleString('th-TH')}
                </div>
              )}
            </div>
          </div>

             {/* Water Color Card */}
             <div className={`${getBackgroundColor(sensorData.waterColor.status)} rounded-2xl p-6 border-2 ${getStatusColor(sensorData.waterColor.status)} shadow-lg`}>
              <div>
                <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">Water Color</h3>
                 <div className="flex items-center justify-between mb-3">
                   <div className="font-bold text-2xl text-[#1c170d]">{formatValue('waterColor', sensorData.waterColor.value)}</div>
                   <button className="bg-[#f2c245] border-none rounded-2xl px-4 py-2 font-semibold text-sm text-[#1c170d] cursor-pointer transition-colors hover:bg-[#e6b63d] flex-shrink-0 ml-3 w-32 text-center" onClick={() => viewImage('water')}>กดเพื่อดูรูป</button>
                 </div>
                {sensorData.waterColor.timestamp && (
                  <div className="text-xs text-gray-500">
                    อัปเดตล่าสุด: {new Date(sensorData.waterColor.timestamp).toLocaleString('th-TH')}
                  </div>
                )}
              </div>
            </div>

             {/* Shrimp on Water Surface - Image Only */}
             <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-[#f2c245] shadow-lg">
              <div>
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="font-semibold text-lg text-[#1c170d] m-0">Shrimp Floating on Water</h3>
                   <button className="bg-[#f2c245] border-none rounded-2xl px-4 py-2 font-semibold text-sm text-[#1c170d] cursor-pointer transition-colors hover:bg-[#e6b63d] flex-shrink-0 ml-3 w-32 text-center" onClick={() => viewImage('shrimp_surface')}>กดเพื่อดูรูป</button>
                 </div>
                 {sensorData.shrimpSurface?.timestamp && (
                   <div className="text-xs text-gray-500">
                     Latest Update: {new Date(sensorData.shrimpSurface.timestamp).toLocaleString('th-TH')}
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Group 2: กุ้ง */}
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-xl text-[#1c170d] mb-2">กลุ่ม 2: กุ้ง</h2>
            
             {/* Shrimp Size (cm) Card */}
             <div className={`${getBackgroundColor(sensorData.shrimpSize.status)} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.shrimpSize.status)} shadow-lg`}>
            <div>
                <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">Shrimp size (Cm)</h3>
              <div className="font-bold text-2xl text-[#1c170d] mb-3">{formatValue('shrimpSize', sensorData.shrimpSize.value)}</div>
              {sensorData.shrimpSize.timestamp && (
                  <div className="text-xs text-gray-500">
                  Latest Update: {new Date(sensorData.shrimpSize.timestamp).toLocaleString('th-TH')}
                </div>
              )}
            </div>
          </div>

             {/* Shrimp Size (grams) Card */}
             <div className={`${getBackgroundColor(sensorData.shrimpWeight?.status || 'green')} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.shrimpWeight?.status || 'green')} shadow-lg`}>
              <div>
                <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">Shrimp size (gram)</h3>
                <div className="font-bold text-2xl text-[#1c170d] mb-3">{sensorData.shrimpWeight?.value || '0.0'} กรัม</div>
                {sensorData.shrimpWeight?.timestamp && (
                  <div className="text-xs text-gray-500">
                    Latest Update: {new Date(sensorData.shrimpWeight.timestamp).toLocaleString('th-TH')}
                  </div>
                )}
              </div>
            </div>

             {/* Shrimp Size Image Card */}
             <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-[#f2c245] shadow-lg">
              <div>
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="font-semibold text-lg text-[#1c170d] m-0">Shrimp size</h3>
                   <button className="bg-[#f2c245] border-none rounded-2xl px-4 py-2 font-semibold text-sm text-[#1c170d] cursor-pointer transition-colors hover:bg-[#e6b63d] flex-shrink-0 ml-3 w-32 text-center" onClick={() => viewImage('shrimp')}>Tap to view image</button>
                 </div>
                 {sensorData.shrimpSize?.timestamp && (
                   <div className="text-xs text-gray-500">
                     Latest Update: {new Date(sensorData.shrimpSize.timestamp).toLocaleString('th-TH')}
                   </div>
                 )}
              </div>
            </div>

             {/* Food on Raft Image Card */}
             <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-[#f2c245] shadow-lg">
              <div>
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="font-semibold text-lg text-[#1c170d] m-0">Feed on Lift Net</h3>
                   <button className="bg-[#f2c245] border-none rounded-2xl px-4 py-2 font-semibold text-sm text-[#1c170d] cursor-pointer transition-colors hover:bg-[#e6b63d] flex-shrink-0 ml-3 w-32 text-center" onClick={() => viewImage('food')}>Tap to view image</button>
                 </div>
                 {sensorData.food?.timestamp && (
                   <div className="text-xs text-gray-500">
                     Latest Update: {new Date(sensorData.food.timestamp).toLocaleString('th-TH')}
                   </div>
                 )}
              </div>
            </div>

             {/* Shrimp Movement Video Card */}
             <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-[#f2c245] shadow-lg">
            <div>
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="font-semibold text-lg text-[#1c170d] m-0">วิดีโอกุ้งดิ้น</h3>
                   <button className="bg-[#f2c245] border-none rounded-2xl px-4 py-2 font-semibold text-sm text-[#1c170d] cursor-pointer transition-colors hover:bg-[#e6b63d] flex-shrink-0 ml-3 w-32 text-center" onClick={() => viewImage('shrimp_video')}>กดเพื่อดูวิดีโอ</button>
                 </div>
                 {sensorData.shrimpVideo?.timestamp && (
                   <div className="text-xs text-gray-500">
                     Latest Update: {new Date(sensorData.shrimpVideo.timestamp).toLocaleString('th-TH')}
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Group 3: สารแร่ธาตุ */}
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-xl text-[#1c170d] mb-2">กลุ่ม 3: สารแร่ธาตุ</h2>
            
             {/* Mineral 1 Card */}
             <div className={`${getBackgroundColor(sensorData.mineral1?.status || 'green')} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.mineral1?.status || 'green')} shadow-lg`}>
              <div>
                <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">น้ำหนักสาร 1 (กิโลกรัม)</h3>
                <div className="font-bold text-2xl text-[#1c170d] mb-3">{formatValue('mineral1', sensorData.mineral1?.value || '0.0')}</div>
                {sensorData.mineral1?.timestamp && (
                  <div className="text-xs text-gray-500">
                    Latest Update: {new Date(sensorData.mineral1.timestamp).toLocaleString('th-TH')}
                  </div>
                )}
              </div>
            </div>

             {/* Mineral 2 Card */}
             <div className={`${getBackgroundColor(sensorData.mineral2?.status || 'green')} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.mineral2?.status || 'green')} shadow-lg`}>
            <div>
                <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">น้ำหนักสาร 2 (กิโลกรัม)</h3>
                <div className="font-bold text-2xl text-[#1c170d] mb-3">{formatValue('mineral2', sensorData.mineral2?.value || '0.0')}</div>
                {sensorData.mineral2?.timestamp && (
                  <div className="text-xs text-gray-500">
                    Latest Update: {new Date(sensorData.mineral2.timestamp).toLocaleString('th-TH')}
                  </div>
                )}
            </div>
          </div>

             {/* Mineral 3 Card */}
             <div className={`${getBackgroundColor(sensorData.mineral3?.status || 'green')} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.mineral3?.status || 'green')} shadow-lg`}>
            <div>
                <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">สถานะสาร 3</h3>
                <div className="font-bold text-2xl text-[#1c170d] mb-3">{formatValue('mineral3', sensorData.mineral3?.value || 'false')}</div>
                {sensorData.mineral3?.timestamp && (
                  <div className="text-xs text-gray-500">
                    Latest Update: {new Date(sensorData.mineral3.timestamp).toLocaleString('th-TH')}
                </div>
              )}
            </div>
          </div>

             {/* Mineral 4 Card */}
             <div className={`${getBackgroundColor(sensorData.mineral4?.status || 'green')} rounded-2xl p-5 border-2 ${getStatusColor(sensorData.mineral4?.status || 'green')} shadow-lg`}>
            <div>
                <h3 className="font-semibold text-lg text-[#1c170d] mb-3 m-0">สถานะสาร 4</h3>
                <div className="font-bold text-2xl text-[#1c170d] mb-3">{formatValue('mineral4', sensorData.mineral4?.value || 'false')}</div>
                {sensorData.mineral4?.timestamp && (
                <div className="text-xs text-gray-500">
                    Latest Update: {new Date(sensorData.mineral4.timestamp).toLocaleString('th-TH')}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Alert Popup */}
        {user && (
          <AlertPopup
            isOpen={showAlertPopup}
            onClose={() => setShowAlertPopup(false)}
            pondId={parseInt(pondId)}
            userId={Number(user.id)}
            onMarkAsRead={() => {
              // Trigger refresh of alert badge
              console.log('🔄 Page: onMarkAsRead called, updating refreshTrigger');
              setAlertRefreshTrigger(prev => {
                const newValue = prev + 1;
                console.log('🔄 Page: refreshTrigger updated from', prev, 'to', newValue);
                return newValue;
              });
            }}
          />
        )}
    </div>
  )
}
