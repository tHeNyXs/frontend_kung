'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function RouteGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // รอให้ auth check เสร็จ

    if (requireAuth && !isAuthenticated) {
      // ถ้าต้องการ auth แต่ไม่ได้ login ให้ redirect ไป login
      router.push(redirectTo)
    } else if (!requireAuth && isAuthenticated) {
      // ถ้าไม่ต้องการ auth แต่ login แล้ว ให้ redirect ไปหน้าแรก
      router.push('/ponds')
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  // แสดง loading ขณะตรวจสอบ auth
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #fcfaf7;
            padding: 20px;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #f2c245;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loading-container p {
            font-family: 'Inter', 'Noto Sans Thai', sans-serif;
            font-size: 16px;
            color: #6b7280;
            margin: 0;
          }
        `}</style>
      </div>
    )
  }

  // ถ้าไม่ผ่านเงื่อนไข auth ไม่แสดง children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}
