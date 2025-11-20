'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePonds } from '@/hooks/use-ponds'
import { useRoutineSettings } from '@/hooks/use-routine-settings'
import { useRoutineTimer } from '@/hooks/use-routine-timer'
import { useSystemControl } from '@/hooks/use-system-control'
import { usePondStatus } from '@/hooks/use-pond-status'
import StatusPopup from '@/components/StatusPopup'

export default function ControlPage() {
  const router = useRouter()
  const params = useParams()
  const pondId = params.id as string
  const { data: ponds } = usePonds()
  const [isCapturing, setIsCapturing] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    time: '06:00',
    days: [] as string[]
  })
  const [showRoutineSettings, setShowRoutineSettings] = useState(false)

  // Use routine settings hook
  const { 
    data: routineSettings, 
    isLoading: isRoutineLoading,
    addSchedule: addScheduleMutation,
    removeSchedule: removeScheduleMutation,
    toggleEnabled: toggleEnabledMutation
  } = useRoutineSettings({ pondId: parseInt(pondId) })

  // Use system control hook
  const { 
    systemStatus, 
    isEnabled: isSystemEnabled, 
    toggle: toggleSystem, 
    isToggling: isSystemToggling 
  } = useSystemControl()

  // Use routine timer hook
  useRoutineTimer({ enabled: true })

  // Use pond status hook
  const {
    currentStatus,
    isProcessing,
    showPopup,
    error,
    isCompleted,
    startLiftProcess,
    handleStatusUpdate,
    closePopup,
    showCurrentStatus,
    resetStatus,
    getStatusMessage
  } = usePondStatus({
    pondId: parseInt(pondId),
    onStatusUpdate: (status) => {
      console.log('Status updated:', status, getStatusMessage(status));
    },
    onStatusComplete: () => {
      console.log('Lift process completed!');
    }
  });
  
  // Find the current pond
  const pond = ponds?.find(p => p.id === pondId)

  const goBack = () => router.push('/ponds')

  const toggleSwitch = (element: HTMLElement) => {
    element.classList.toggle('active')
    const isActive = element.classList.contains('active')
    console.log('Switch toggled:', isActive)
  }

  // ฟังก์ชันสำหรับจัดการ routine settings
  const addSchedule = () => {
    if (newSchedule.time && newSchedule.days.length > 0) {
      const scheduleData = {
        action: 'lift_up' as 'lift_up', // Auto flow: ยกขึ้น -> ถ่ายรูป -> ยกลง
        time: newSchedule.time,
        days: newSchedule.days
      }
      addScheduleMutation.mutate(scheduleData, {
        onSuccess: () => {
          setNewSchedule({
            time: '06:00',
            days: []
          })
        }
      })
    }
  }

  const removeSchedule = (id: string) => {
    removeScheduleMutation.mutate(id)
  }

  const toggleRoutineEnabled = () => {
    if (routineSettings) {
      const newEnabled = !routineSettings.enabled
      toggleEnabledMutation.mutate(newEnabled)
      
      // Auto show settings when enabling routine
      if (newEnabled) {
        setShowRoutineSettings(true)
      }
    }
  }

  // Handle system toggle (main automation system)
  const handleSystemToggle = () => {
    toggleSystem()
  }

  const handleDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setNewSchedule(prev => ({
        ...prev,
        days: [...prev.days, day]
      }))
    } else {
      setNewSchedule(prev => ({
        ...prev,
        days: prev.days.filter(d => d !== day)
      }))
    }
  }

// ฟังก์ชันสำหรับควบคุมยอ - ส่ง POST ไปยัง backend_middle
const handleLiftUp = async () => {
  if (isProcessing) return // ป้องกันการกดซ้ำ
  
  try {
    const backendMiddleUrl = process.env.NEXT_PUBLIC_RSPI_SERVER_YOKYOR || 'http://localhost:3002'
    
    // แปลง pondId เป็น string และตรวจสอบ
    const pondIdString = Array.isArray(pondId) ? pondId[0] : pondId
    
    // สร้าง request body
    const requestBody = {
      pondId: pondIdString,
      action: 'lift_up',
      timestamp: new Date().toISOString()
    }
    
    console.log('🚀 Sending lift_up command:', requestBody)
    
    const response = await fetch(`${backendMiddleUrl}/api/lift-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ lift_up command sent successfully:', result)
      
      // เริ่มแสดง StatusPopup
      startLiftProcess();
      
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Failed to send lift_up command:', response.status, errorData)
      alert('Command failed. Please try again.')
    }
  } catch (error) {
    console.error('💥 Error calling backend_middle:', error)
    alert('Unable to establish a connection to the control system. Please verify your connection.')
  }
}

// ฟังก์ชันสำหรับถ่ายรูปข้างบ่อ - ส่ง POST ไปยัง cloud app
const handleCamSide = async () => {
  if (isCapturing) return // ป้องกันการกดซ้ำ
  
  setIsCapturing(true)
  
  try {
    const cloudApiUrl = process.env.NEXT_PUBLIC_RSPI_SERVER_YOKYOR || 'http://localhost:3002'
    
    // แปลง pondId เป็น string และตรวจสอบ
    const pondIdString = Array.isArray(pondId) ? pondId[0] : pondId
    
    // สร้าง request body
    const requestBody = {
      pondId: pondIdString,
      action: 'cam_side',
      timestamp: new Date().toISOString()
    }
    
    console.log('📷 Sending cam_side command:', requestBody)
    
    const response = await fetch(`${cloudApiUrl}/api/cam-side`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ cam_side command sent successfully:', result)
      alert('The command to take a pond-side photo was sent successfully!')
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Failed to send cam_side command:', response.status, errorData)
      alert('Command error. Please try again.')
    }
  } catch (error) {
    console.error('💥 Error calling cloud API:', error)
    alert('Unable to establish a connection to the control system. Please verify your connection.')
  } finally {
    setIsCapturing(false)
  }
}

  return (
    <div className="w-full flex flex-col h-full bg-[#fcfaf7]">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="back-button" onClick={goBack}>
              <div className="back-icon">
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18 8C18 8.41421 17.6642 8.75 17.25 8.75H2.56031L8.03063 14.2194C8.32368 14.5124 8.32368 14.9876 8.03063 15.2806C7.73757 15.5737 7.26243 15.5737 6.96937 15.2806L0.219375 8.53063C0.0785421 8.38995 -0.000590086 8.19906 -0.000590086 8C-0.000590086 7.80094 0.0785421 7.61005 0.219375 7.46937L6.96937 0.719375C7.26243 0.426319 7.73757 0.426319 8.03063 0.719375C8.32368 1.01243 8.32368 1.48757 8.03063 1.78062L2.56031 7.25H17.25C17.6642 7.25 18 7.58579 18 8V8Z" fill="#1A170F"/>
                </svg>
              </div>
            </div>
            <div className="title-container">
              <h1>{pond?.name || `Pond number ${pondId}`}</h1>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {/* Equipment Control Section */}
          <div className="equipment-section">
            <div className="section-title">
              <h2>Devices you can control</h2>
            </div>

            {/* Control Item 1 */}
            <div className="control-item">
              <div className="control-content">
                <div className="control-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_5_775)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M21.8438 12.6562C21.3832 10.9359 20.1352 9.53533 18.4791 8.88026C16.8231 8.2252 14.9546 8.39306 13.4419 9.33281L14.9784 3.19781C15.0566 2.88525 14.9264 2.55768 14.655 2.38406C12.9181 1.2873 10.7214 1.22457 8.92477 2.22043C7.12811 3.2163 6.01718 5.11236 6.0268 7.16654C6.03641 9.22072 7.16503 11.1063 8.97094 12.0853L2.88937 13.8225C2.57956 13.9107 2.36069 14.187 2.34562 14.5087C2.22671 17.1469 3.95904 19.5126 6.51 20.1956C6.98758 20.3239 7.47988 20.3891 7.97437 20.3897C9.49675 20.3857 10.9526 19.7654 12.0102 18.6704C13.0678 17.5754 13.637 16.0988 13.5881 14.5772L18.1331 18.9759C18.3649 19.2002 18.7141 19.2512 19.0003 19.1025C21.3431 17.887 22.5257 15.206 21.8438 12.6562V12.6562ZM10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12V12ZM7.5 7.125C7.49952 5.7123 8.22201 4.39761 9.41481 3.64068C10.6076 2.88375 12.1048 2.78987 13.3828 3.39188L11.9784 9C10.884 9.00821 9.8808 9.61183 9.36094 10.575C8.19698 9.81382 7.4968 8.51575 7.5 7.125V7.125ZM10.0312 18.3347C8.8081 19.0414 7.30836 19.0731 6.05646 18.4186C4.80456 17.7642 3.97462 16.5146 3.85687 15.1069L9.41719 13.5188C9.95508 14.435 10.9375 14.9985 12 15H12.0853C12.0086 16.3874 11.2358 17.642 10.0312 18.3347V18.3347ZM19.9847 16.1784C19.6812 16.7048 19.265 17.1575 18.7659 17.5041L14.6109 13.4831C15.1525 12.5318 15.1313 11.3607 14.5556 10.4297C16.1847 9.60729 18.1606 9.95307 19.4136 11.2798C20.6666 12.6066 20.8989 14.599 19.9847 16.1784V16.1784Z" fill="#1A170F"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_5_775">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="control-info">
                  <h3>1. Paddlewheel Aerator</h3>
                  <p>Press to rotate the aerator.</p>
                </div>
              </div>
              <div className="toggle-switch" onClick={(e) => toggleSwitch(e.currentTarget)}>
                <div className="toggle-slider"></div>
              </div>
            </div>

            {/* Control Item 2 */}
            <div className="control-item">
              <div className="control-content">
                <div className="control-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_5_775_2)">
                      <path fillRule="evenodd" clipRule="evenodd" d="M21.8438 12.6562C21.3832 10.9359 20.1352 9.53533 18.4791 8.88026C16.8231 8.2252 14.9546 8.39306 13.4419 9.33281L14.9784 3.19781C15.0566 2.88525 14.9264 2.55768 14.655 2.38406C12.9181 1.2873 10.7214 1.22457 8.92477 2.22043C7.12811 3.2163 6.01718 5.11236 6.0268 7.16654C6.03641 9.22072 7.16503 11.1063 8.97094 12.0853L2.88937 13.8225C2.57956 13.9107 2.36069 14.187 2.34562 14.5087C2.22671 17.1469 3.95904 19.5126 6.51 20.1956C6.98758 20.3239 7.47988 20.3891 7.97437 20.3897C9.49675 20.3857 10.9526 19.7654 12.0102 18.6704C13.0678 17.5754 13.637 16.0988 13.5881 14.5772L18.1331 18.9759C18.3649 19.2002 18.7141 19.2512 19.0003 19.1025C21.3431 17.887 22.5257 15.206 21.8438 12.6562V12.6562ZM10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12V12ZM7.5 7.125C7.49952 5.7123 8.22201 4.39761 9.41481 3.64068C10.6076 2.88375 12.1048 2.78987 13.3828 3.39188L11.9784 9C10.884 9.00821 9.8808 9.61183 9.36094 10.575C8.19698 9.81382 7.4968 8.51575 7.5 7.125V7.125ZM10.0312 18.3347C8.8081 19.0414 7.30836 19.0731 6.05646 18.4186C4.80456 17.7642 3.97462 16.5146 3.85687 15.1069L9.41719 13.5188C9.95508 14.435 10.9375 14.9985 12 15H12.0853C12.0086 16.3874 11.2358 17.642 10.0312 18.3347V18.3347ZM19.9847 16.1784C19.6812 16.7048 19.265 17.1575 18.7659 17.5041L14.6109 13.4831C15.1525 12.5318 15.1313 11.3607 14.5556 10.4297C16.1847 9.60729 18.1606 9.95307 19.4136 11.2798C20.6666 12.6066 20.8989 14.599 19.9847 16.1784V16.1784Z" fill="#1A170F"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_5_775_2">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="control-info">
                  <h3>2. Lift net up / down</h3>
                  <p>
                    {isProcessing 
                      ? 'Processing...' 
                      : 'Press to lift the net → take photo → lower'
                    }
                  </p>
                </div>
              </div>
              <div className="control-actions">
                {/* Show Lift Button when not processing and not completed */}
                {!isProcessing && !isCompleted && (
                  <button 
                    className="lift-button"
                    onClick={handleLiftUp}
                    style={{ 
                      cursor: 'pointer',
                      opacity: 1 
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    ยกยอ
                  </button>
                )}

                {/* When processing and popup is closed -> show View Status button */}
                {isProcessing && !showPopup && (
                  <button 
                    className="status-check-button"
                    onClick={showCurrentStatus}
                    title="View Status Now"
                    style={{ 
                      padding: '8px 12px',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      minWidth: '80px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563EB';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3B82F6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    ดูสถานะ
                  </button>
                )}

                {/* When processing and popup is open -> show disabled processing button */}
                {isProcessing && showPopup && (
                  <button 
                    className="lift-button loading"
                    disabled={true}
                    style={{ 
                      cursor: 'not-allowed',
                      opacity: 0.7 
                    }}
                  >
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                    </div>
                    กำลังประมวลผล...
                  </button>
                )}

                {/* Show Status Check Button when completed */}
                {isCompleted && (
                  <button 
                    className="status-check-button"
                    onClick={showCurrentStatus}
                    title="View Status Now"
                    style={{ 
                      padding: '8px 12px',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      minWidth: '80px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563EB';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3B82F6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    ดูสถานะ
                  </button>
                )}
              </div>
            </div>

            {/* Control Item 3 - ถ่ายรูปข้างบ่อ */}
            <div className="control-item">
              <div className="control-content">
                <div className="control-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1A170F"/>
                  </svg>
                </div>
                <div className="control-info">
                  <h3>3. Capture pond-side photo</h3>
                  <p>
                    {isCapturing 
                      ? 'Sending command...' 
                      : 'Press to capture pond-side photo'
                    }
                  </p>
                </div>
              </div>
              <button 
                className={`lift-button ${isCapturing ? 'loading' : ''}`}
                onClick={handleCamSide}
                disabled={isCapturing}
                style={{ 
                  cursor: isCapturing ? 'not-allowed' : 'pointer',
                  opacity: isCapturing ? 0.7 : 1 
                }}
              >
                {isCapturing ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    ถ่ายรูป
                  </>
                )}
              </button>
            </div>

            {/* Control Item 4 */}
            <div className="control-item">
              <div className="control-content">
                <div className="control-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1A170F"/>
                  </svg>
                </div>
                <div className="control-info">
                  <h3>4. Notification</h3>
                  <p>Auto notifications: On / Off</p>
                </div>
              </div>
              <div className="toggle-switch active" onClick={(e) => toggleSwitch(e.currentTarget)}>
                <div className="toggle-slider"></div>
              </div>
            </div>

            {/* Control Item 5 - System Automation */}
            <div className="control-item">
              <div className="control-content">
                <div className="control-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1A170F"/>
                  </svg>
                </div>
                <div className="control-info">
                  <h3>5. Data Logging System</h3>
                  <p>Enable/Disable automatic data logging</p>
                </div>
              </div>
              <div className="toggle-switch active" onClick={(e) => toggleSwitch(e.currentTarget)}>
                <div className="toggle-slider"></div>
              </div>
            </div>

            {/* Control Item 6 - System Automation */}
            <div className="control-item">
              <div className="control-content">
                <div className="control-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1A170F"/>
                  </svg>
                </div>
                <div className="control-info">
                  <h3>6. Main Automation System</h3>
                  <p>
                    {isSystemToggling 
                      ? 'Changing status...' 
                      : isSystemEnabled 
                        ? 'Automation is ON - Checking schedule' 
                        : 'Automation is OFF - No schedule checking'
                    }
                    {isSystemEnabled && systemStatus?.last_check && (
                      <span style={{ display: 'block', marginTop: '8px', fontSize: '14px', color: '#10B981' }}>
                        ✓ Latest Checking: {new Date(systemStatus.last_check).toLocaleString('th-TH')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div 
                className={`toggle-switch ${isSystemEnabled ? 'active' : ''} ${isSystemToggling ? 'loading' : ''}`}
                onClick={handleSystemToggle}
                style={{ 
                  cursor: isSystemToggling ? 'not-allowed' : 'pointer',
                  opacity: isSystemToggling ? 0.7 : 1 
                }}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>

            {/* Control Item 7 - Routine Settings */}
            <div className="control-item">
              <div className="control-content">
                <div className="control-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1A170F"/>
                  </svg>
                </div>
                <div className="control-info">
                  <h3>7. Lift Net Routine Schedule</h3>
                  <p>Set automatic timing (Lift → Capture → Lower)</p>
                </div>
              </div>
              <div className="control-actions">
                <button 
                  className={`settings-toggle-btn ${showRoutineSettings ? 'active' : ''}`}
                  onClick={() => setShowRoutineSettings(!showRoutineSettings)}
                  title="ตั้งค่า Routine"
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    style={{ transform: showRoutineSettings ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <path d="M12 15l-3-3h6l-3 3z" fill="currentColor"/>
                  </svg>
                </button>
                <div 
                  className={`toggle-switch ${routineSettings?.enabled ? 'active' : ''}`}
                  onClick={toggleRoutineEnabled}
                >
                  <div className="toggle-slider"></div>
                </div>
              </div>
            </div>

            {/* Routine Settings Panel - Dropdown */}
            {showRoutineSettings && (
              <div className="routine-settings-panel">
                <div className="panel-header">
                  <div className="header-left">
                    <div className="header-icon">⚙️</div>
                    <div>
                      <h4>Lift Net Routine Settings</h4>
                      <p className="header-subtitle">Set automatic timing (Lift → Capture → Lower)</p>
                      <div className="system-status">
                        <span className={`status-indicator ${isSystemEnabled ? 'active' : 'inactive'}`}>
                          {isSystemEnabled ? '🟢' : '🔴'}
                        </span>
                        <span className="status-text">
                          Automation: {isSystemEnabled ? 'ON' : 'OFF'}
                          {systemStatus?.last_check && (
                            <span className="last-check">
                              (Latest Checking: {new Date(systemStatus.last_check).toLocaleTimeString('th-TH')})
                            </span>
                          )}
                          {isSystemEnabled && (
                            <span className="system-info">
                              <br />
                              <small style={{ color: '#10B981', fontSize: '12px' }}>
                                ✓ System active – Checks every 30 seconds
                              </small>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="close-panel-btn"
                    onClick={() => setShowRoutineSettings(false)}
                    title="Off Setting"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                
                {/* Add New Schedule */}
                <div className="schedule-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <span className="label-icon">🕐</span>
                        <h5>Add New Schedule</h5>
                      </label>
                      <div className="time-input-wrapper">
                        <input 
                          type="time" 
                          value={newSchedule.time}
                          onChange={(e) => setNewSchedule(prev => ({...prev, time: e.target.value}))}
                          className="time-input"
                        />
                        <div className="input-decoration"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <span className="label-icon">📅</span>
                      Day
                    </label>
                    <div className="days-container">
                      <div className="days-header">
                        <span>Select Day</span>
                        <div className="day-actions">
                          <button 
                            className="select-all-btn"
                            onClick={() => setNewSchedule(prev => ({
                              ...prev,
                              days: ['Monday', 'Tuseday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                            }))}
                          >
                            Select All
                          </button>
                          <button 
                            className="clear-all-btn"
                            onClick={() => setNewSchedule(prev => ({...prev, days: []}))}
                          >
                            Delete All
                          </button>
                        </div>
                      </div>
                      <div className="days-checkboxes">
                        {['Monday', 'Tuseday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                          <label key={day} className={`day-checkbox ${newSchedule.days.includes(day) ? 'checked' : ''}`}>
                            <input 
                              type="checkbox"
                              checked={newSchedule.days.includes(day)}
                              onChange={(e) => handleDayChange(day, e.target.checked)}
                            />
                            <span className="day-text">{day}</span>
                            <div className="checkmark">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="add-schedule-btn"
                      onClick={addSchedule}
                      disabled={!newSchedule.time || newSchedule.days.length === 0 || addScheduleMutation.isPending}
                    >
                      {addScheduleMutation.isPending ? (
                        <>
                          <div className="btn-spinner"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Add a schedule
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Existing Schedules */}
                <div className="schedules-list">
                  <div className="section-header">
                    <h4>set time schedule</h4>
                  </div>
                  {isRoutineLoading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Downloading...</p>
                    </div>
                  ) : routineSettings?.schedules?.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📅</div>
                      <h5>No Schedule</h5>
                      <p>Add a new schedule to start the automation.</p>
                    </div>
                  ) : (
                    <div className="schedules-grid">
                      {routineSettings?.schedules?.map((schedule, index) => (
                        <div key={schedule.id} className="schedule-item">
                          <div className="schedule-number">{index + 1}</div>
                          <div className="schedule-info">
                            <div className="schedule-time">
                              <span className="time-icon">🕐</span>
                              {schedule.time}
                            </div>
                            <div className="schedule-days">
                              <span className="days-icon">📅</span>
                              {schedule.days.join(', ')}
                            </div>
                          </div>
                          <button 
                            className="remove-schedule-btn"
                            onClick={() => removeSchedule(schedule.id)}
                            disabled={removeScheduleMutation.isPending}
                            title="Delete this schedule"
                          >
                            {removeScheduleMutation.isPending ? (
                              <div className="btn-spinner small"></div>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* System Status Section */}
          <div className="sensor-status-section">
            <div className="section-title">
              <h2>System Status</h2>
            </div>
            
            <div className="sensor-grid">
              <div className="sensor-row">
                {/* เครื่องยกยอกุ้ง */}
                <div className="sensor-card green">
                  <div className="sensor-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0D1C0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="sensor-label">Shrimp lift-net system</div>
                </div>

                {/* เครื่องปรับคุณภาพน้ำ */}
                <div className="sensor-card green">
                  <div className="sensor-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2.5C13.5 3.75 19.5 8.75 19.5 14.25C19.5 17.973 16.473 21 12.75 21H12C8.13401 21 5 17.866 5 14C5 9 12 2.5 12 2.5z" stroke="#0D1C0D" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className="sensor-label">Water Quality Controller</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', 'Space Grotesk', 'Noto Sans Thai', sans-serif;
          background-color: #ffffff;
          height: 100vh;
          overflow: auto;
        }

        .control-container {
          background-color: #fcfaf7;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .main-frame {
          background-color: #fcfaf7;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Header Styles */
        .header {
          background-color: #fcfaf7;
          width: 100%;
          flex-shrink: 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          padding: 16px 16px 8px 16px;
          width: 100%;
        }

        .back-button {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
          flex-shrink: 0;
        }

        .back-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .title-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-right: 48px;
        }

        .title-container h1 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 23px;
          color: #1c170d;
          text-align: center;
          margin: 0;
        }

        /* Content Area */
        .content-area {
          flex: 1;
          padding: 16px 16px 32px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Equipment Section */
        .equipment-section {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          margin-bottom: 20px;
        }

        .section-title h2 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 700;
          font-size: 20px;
          line-height: 24px;
          color: #1c170d;
          margin: 0;
        }

        .control-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          min-height: 60px;
        }

        .control-item:last-child {
          border-bottom: none;
        }

        .control-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .settings-toggle-btn {
          width: 40px;
          height: 40px;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #6B7280;
          flex-shrink: 0;
        }

        .settings-toggle-btn:hover {
          border-color: #4F46E5;
          color: #4F46E5;
          background: #F8FAFC;
          transform: translateY(-1px);
        }

        .settings-toggle-btn:active {
          transform: translateY(0);
        }

        .settings-toggle-btn.active {
          border-color: #4F46E5;
          color: #4F46E5;
          background: #EEF2FF;
        }

        .settings-toggle-btn.active:hover {
          background: #E0E7FF;
        }

        .routine-settings-panel {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          padding: 24px;
          margin-top: 12px;
          margin-bottom: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #E2E8F0;
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .routine-settings-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: #f2c245;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #F1F5F9;
          position: relative;
        }

        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .header-icon {
          font-size: 24px;
          margin-top: 2px;
        }

        .panel-header h4 {
          margin: 0 0 8px 0;
          color: #1E293B;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.2;
        }

        .header-subtitle {
          margin: 0;
          color: #64748B;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 8px;
          border: 1px solid #E2E8F0;
        }

        .status-indicator {
          font-size: 12px;
          line-height: 1;
        }

        .status-indicator.active {
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 12px;
          color: #374151;
          font-weight: 500;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .last-check {
          font-size: 11px;
          color: #6B7280;
          font-weight: 400;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .close-panel-btn {
          width: 36px;
          height: 36px;
          border: 2px solid #E2E8F0;
          border-radius: 10px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #64748B;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .close-panel-btn:hover {
          border-color: #EF4444;
          color: #EF4444;
          background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .routine-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #E5E7EB;
        }

        .routine-header h3 {
          margin: 0;
          color: #1F2937;
          font-size: 18px;
        }

        .routine-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .routine-toggle span {
          font-size: 14px;
          color: #6B7280;
        }



        /* Section Headers */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h4 {
          margin: 0;
          color: #1E293B;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }


        .add-schedule-section {
          margin-bottom: 32px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 16px;
          padding: 28px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .schedule-form {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
          flex: 1;
        }

        .form-group label {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .label-icon {
          font-size: 16px;
        }

        .time-input-wrapper {
          position: relative;
          max-width: 200px;
        }

        .input-decoration {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #0EA5E9, #3B82F6);
          border-radius: 1px;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .time-input:focus + .input-decoration {
          transform: scaleX(1);
        }

        .time-input {
          padding: 14px 18px;
          border: 2px solid #E2E8F0;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #1E293B;
          background: #ffffff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 200px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .time-input::-webkit-datetime-edit-text {
          color: #1E293B;
          font-weight: 600;
        }

        .time-input::-webkit-datetime-edit-hour-field,
        .time-input::-webkit-datetime-edit-minute-field {
          color: #1E293B;
          font-weight: 600;
        }

        .time-input::-webkit-datetime-edit-ampm-field {
          color: #64748B;
          font-weight: 500;
        }

        /* Firefox support */
        .time-input::-moz-datetime-edit-text {
          color: #1E293B;
          font-weight: 600;
        }

        .time-input::-moz-datetime-edit-hour-field,
        .time-input::-moz-datetime-edit-minute-field {
          color: #1E293B;
          font-weight: 600;
        }

        /* General input styling for better visibility */
        .time-input input[type="time"] {
          color: #1E293B;
          font-weight: 600;
        }

        .time-input:focus {
          outline: none;
          border-color: #4F46E5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1), 0 4px 12px rgba(79, 70, 229, 0.15);
          transform: translateY(-1px);
          color: #1E293B;
          background: #ffffff;
        }

        .time-input:focus::-webkit-datetime-edit-text,
        .time-input:focus::-webkit-datetime-edit-hour-field,
        .time-input:focus::-webkit-datetime-edit-minute-field {
          color: #1E293B;
          font-weight: 700;
        }

        .time-input:hover {
          border-color: #C7D2FE;
          transform: translateY(-1px);
        }

        .days-container {
          background: white;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .days-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-bottom: 1px solid #E2E8F0;
        }

        .days-header span {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .day-actions {
          display: flex;
          gap: 8px;
        }

        .select-all-btn,
        .clear-all-btn {
          padding: 6px 12px;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          background: white;
          color: #6B7280;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-all-btn:hover {
          border-color: #10B981;
          color: #10B981;
          background: #F0FDF4;
        }

        .clear-all-btn:hover {
          border-color: #EF4444;
          color: #EF4444;
          background: #FEF2F2;
        }

        .days-checkboxes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          padding: 16px;
        }

        .day-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          padding: 12px 16px;
          border-radius: 8px;
          background: white;
          border: 1px solid #F3F4F6;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .day-checkbox::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent);
          transition: left 0.5s;
        }

        .day-checkbox:hover {
          background: #F8FAFC;
          border-color: #C7D2FE;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .day-checkbox:hover::before {
          left: 100%;
        }

        .day-checkbox input[type="checkbox"] {
          margin: 0;
          width: 18px;
          height: 18px;
          accent-color: #0EA5E9;
          cursor: pointer;
        }

        .day-text {
          flex: 1;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0EA5E9;
          border-radius: 50%;
          color: white;
          opacity: 0;
          transform: scale(0);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .day-checkbox.checked {
          background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%);
          border-color: #0EA5E9;
          color: #0EA5E9;
          font-weight: 600;
        }

        .day-checkbox.checked .checkmark {
          opacity: 1;
          transform: scale(1);
        }

        .form-actions {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #E2E8F0;
        }

        .add-schedule-btn {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 200px;
          justify-content: center;
        }

        .add-schedule-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .add-schedule-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .add-schedule-btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .add-schedule-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .add-schedule-btn:disabled {
          background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .btn-spinner.small {
          width: 12px;
          height: 12px;
          border-width: 1.5px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 16px;
          border: 1px solid #E2E8F0;
        }

        .loading-state .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #E2E8F0;
          border-top: 3px solid #0EA5E9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .loading-state p {
          margin: 0;
          color: #64748B;
          font-size: 15px;
          font-weight: 500;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 16px;
          border: 2px dashed #CBD5E1;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-state h5 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 18px;
          font-weight: 600;
        }

        .empty-state p {
          margin: 0;
          color: #64748B;
          font-size: 14px;
          line-height: 1.5;
        }

        .schedules-grid {
          display: grid;
          gap: 16px;
        }

        .schedule-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
        }

        .schedule-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(135deg, #f2c245 0%, #f59e0b 100%);
        }

        .schedule-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: #C7D2FE;
        }

        .schedule-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #f2c245 0%, #f59e0b 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(242, 194, 69, 0.3);
        }

        .schedule-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .schedule-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          color: #1E293B;
          font-weight: 700;
        }

        .time-icon {
          font-size: 16px;
        }

        .schedule-days {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #64748B;
          font-weight: 500;
        }

        .days-icon {
          font-size: 14px;
        }

        .remove-schedule-btn {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .remove-schedule-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .remove-schedule-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }

        .remove-schedule-btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .remove-schedule-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .remove-schedule-btn:disabled {
          background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .control-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          height: 100%;
        }

        .control-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .control-info h3 {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 600;
          font-size: 18px;
          line-height: 22px;
          color: #1c170d;
          margin: 0 0 4px 0;
        }

        .control-info p {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 17px;
          color: #6b7280;
          margin: 0;
        }

        /* Lift Button */
        .lift-button {
          background: linear-gradient(135deg, #f2c245 0%, #f59e0b 100%);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(242, 194, 69, 0.25);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 0.05px;
          min-width: 15px;
          justify-content: center;
          flex-shrink: 0;
          height: 32px;
          box-sizing: border-box;
          align-self: center;
        }

        .lift-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .lift-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(242, 194, 69, 0.4);
        }

        .lift-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .lift-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .lift-button:disabled {
          background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .lift-button.loading {
          background: linear-gradient(135deg, #f2c245 0%, #f59e0b 100%);
        }

        .loading-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .spinner {
          width: 5px;
          height: 5px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Toggle Switch */
        .toggle-switch {
          width: 60px;
          height: 32px;
          background-color: #d1d5db;
          border-radius: 16px;
          position: relative;
          cursor: pointer;
          transition: background-color 0.3s ease;
          flex-shrink: 0;
          align-self: center;
          box-sizing: border-box;
        }

        .toggle-switch.active {
          background-color: #f2c245;
        }

        .toggle-slider {
          width: 28px;
          height: 28px;
          background-color: #ffffff;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .toggle-switch.active .toggle-slider {
          transform: translateX(28px);
        }

        .toggle-switch.loading .toggle-slider {
          background-color: #f2c245;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Sensor Status Section */
        .sensor-status-section {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-top: 16px;
        }


        .sensor-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sensor-row {
          display: flex;
          gap: 16px;
        }

        .sensor-card {
          flex: 1;
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border: 2px solid;
        }

        .sensor-card.green {
          border-color: #10b981;
        }

        .sensor-card.red {
          border-color: #ef4444;
        }

        .sensor-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          border-radius: 12px;
        }

        .sensor-label {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-weight: 600;
          font-size: 16px;
          line-height: 20px;
          color: #1c170d;
          text-align: center;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          
          .days-checkboxes {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            padding: 12px;
          }
          
          .day-checkbox {
            padding: 10px 12px;
            font-size: 13px;
          }
          
          .schedule-item {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          
          .schedule-info {
            margin-left: 0;
          }
          
          .remove-schedule-btn {
            align-self: flex-end;
            width: 40px;
            height: 40px;
          }
          
          .form-row {
            flex-direction: column;
            gap: 16px;
          }
          
          .time-input-wrapper {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .content-area {
            padding: 12px;
            gap: 16px;
          }
          
          .equipment-section,
          .sensor-status-section {
            padding: 20px;
          }
          
          .section-title h2 {
            font-size: 18px;
          }
          
          .control-info h3 {
            font-size: 16px;
          }
          
          .sensor-row {
            flex-direction: column;
            gap: 12px;
          }
          
          .sensor-card {
            padding: 16px;
          }
          
          .routine-settings-panel {
            padding: 20px;
            margin-top: 8px;
          }
          
          .add-schedule-section {
            padding: 20px;
          }
          
          .schedule-form {
            padding: 20px;
          }
          
          .days-checkboxes {
            grid-template-columns: 1fr;
            gap: 6px;
            padding: 12px;
          }
          
          
          .panel-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          
          .header-left {
            gap: 12px;
          }
          
          .panel-header h4 {
            font-size: 20px;
          }
          
          .header-subtitle {
            font-size: 13px;
          }
          
          .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
        }
      `}</style>
      
      {/* Status Popup */}
      <StatusPopup
        isOpen={showPopup}
        onClose={closePopup}
        pondId={parseInt(pondId)}
        currentStatus={currentStatus}
        onStatusComplete={() => {
          console.log('Status process completed!');
          resetStatus();
        }}
      />
    </div>
  )
}