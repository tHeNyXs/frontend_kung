import { NextRequest, NextResponse } from 'next/server'

// POST /api/logs - Create new log file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pondId } = body

    if (!pondId) {
      return NextResponse.json(
        { error: 'pondId is required' },
        { status: 400 }
      )
    }

    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pondId }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json(
      { error: 'Failed to create log file' },
      { status: 500 }
    )
  }
}