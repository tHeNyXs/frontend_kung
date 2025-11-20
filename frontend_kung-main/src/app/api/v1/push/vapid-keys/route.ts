import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Use production backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/push/vapid-keys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      let errorMessage = 'Failed to get VAPID keys'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const vapidKeys = await response.json()
    return NextResponse.json(vapidKeys)
  } catch (error) {
    console.error('Error getting VAPID keys:', error)
    return NextResponse.json(
      { error: 'Failed to get VAPID keys' },
      { status: 500 }
    )
  }
}
