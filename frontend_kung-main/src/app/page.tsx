'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
    setIsMounted(true)
    
    // Simple redirect logic - always redirect to login first
    router.push('/login')
  }, [router])

  // Don't render until mounted to avoid SSR issues
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Shrimp Farm WebApp</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }


  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Shrimp Farm WebApp</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
