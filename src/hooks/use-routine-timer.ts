import { useEffect, useRef } from 'react'
import { useAllEnabledSchedules } from './use-routine-settings'

interface RoutineTimerOptions {
  enabled?: boolean
}

interface Schedule {
  id: string
  pond_id: number
  action: 'lift_up' | 'lift_down'
  time: string
  days: string[]
}

export const useRoutineTimer = ({ enabled = true }: RoutineTimerOptions = {}) => {
  const { data: schedules, isLoading } = useAllEnabledSchedules()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const executeRoutine = async (schedule: Schedule) => {
    try {
      const rspiServerUrl = process.env.NEXT_PUBLIC_RSPI_SERVER_YOKYOR || 'http://localhost:3002'
      
      const endpoint = schedule.action === 'lift_up' ? 'api/lift-up' : 'api/lift-down'
      const url = `${rspiServerUrl}/${endpoint}`
      
      const requestBody = {
        pondId: schedule.pond_id.toString(),
        action: schedule.action,
        timestamp: new Date().toISOString(),
        routine: true // แสดงว่าเป็นการทำงานจาก routine
      }
      
      console.log(`🕐 Executing routine: ${schedule.action} for pond ${schedule.pond_id}`, requestBody)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      if (response.ok) {
        console.log(`✅ Routine executed successfully: ${schedule.action} for pond ${schedule.pond_id}`)
      } else {
        console.error(`❌ Routine execution failed: ${schedule.action} for pond ${schedule.pond_id}`, response.statusText)
      }
    } catch (error) {
      console.error(`❌ Error executing routine: ${schedule.action} for pond ${schedule.pond_id}`, error)
    }
  }

  const checkAndExecuteRoutines = () => {
    if (!schedules || schedules.length === 0) return

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const currentDay = now.toLocaleDateString('th-TH', { weekday: 'long' }) // วันในสัปดาห์

    console.log(`🕐 Checking routines at ${currentTime} on ${currentDay}`)

    schedules.forEach((schedule: Schedule) => {
      // ตรวจสอบว่าเป็นวันที่กำหนดไว้หรือไม่
      const isScheduledDay = schedule.days.includes(currentDay)
      
      // ตรวจสอบว่าเป็นเวลาที่กำหนดไว้หรือไม่ (ให้ความยืดหยุ่น ±1 นาที)
      const scheduleTime = schedule.time
      const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number)
      const [currentHour, currentMinute] = currentTime.split(':').map(Number)
      
      const scheduleMinutes = scheduleHour * 60 + scheduleMinute
      const currentMinutes = currentHour * 60 + currentMinute
      
      // ตรวจสอบว่าอยู่ในช่วงเวลา ±1 นาที
      const timeDiff = Math.abs(currentMinutes - scheduleMinutes)
      const isScheduledTime = timeDiff <= 1

      if (isScheduledDay && isScheduledTime) {
        console.log(`🎯 Found matching routine: ${schedule.action} at ${schedule.time} on ${currentDay}`)
        executeRoutine(schedule)
      }
    })
  }

  useEffect(() => {
    if (!enabled || isLoading) return

    // ตรวจสอบทันทีเมื่อโหลดเสร็จ
    checkAndExecuteRoutines()

    // ตั้ง interval ให้ตรวจสอบทุกนาที
    intervalRef.current = setInterval(checkAndExecuteRoutines, 60000) // 60 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, schedules, isLoading])

  return {
    schedules,
    isLoading,
    checkAndExecuteRoutines
  }
}
