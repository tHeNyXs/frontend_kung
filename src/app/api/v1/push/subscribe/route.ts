import { NextRequest, NextResponse } from 'next/server'

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const subscriptionData: PushSubscriptionData = await request.json()
    
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
             // Use production backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(subscriptionData)
    })

    if (!response.ok) {
      let errorMessage = 'Failed to subscribe'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch (e) {
        errorMessage = response.statusText || errorMessage
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    )
  }
}
