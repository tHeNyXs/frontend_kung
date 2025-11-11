import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pondId: string }> }
) {
  try {
    const { pondId } = await params
    
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
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/sensors/yorrkung-batches/${encodeURIComponent(pondId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get batch data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error getting batch data:', error)
    return NextResponse.json(
      { error: 'Failed to get batch data' },
      { status: 500 }
    )
  }
}
