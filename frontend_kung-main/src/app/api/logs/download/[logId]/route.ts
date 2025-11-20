import { NextRequest, NextResponse } from 'next/server'

// GET /api/logs/download/[logId] - Download a log file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const { logId } = await params
    
    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const downloadUrl = `${backendUrl}/api/v1/logs/${logId}/download`
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend responded with ${response.status}: ${errorText}`)
    }

    // Get the file data
    const fileData = await response.arrayBuffer()
    
    // Get content type from backend response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // Return the file with proper headers
    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="log-${logId}.txt"`,
      },
    })
  } catch (error) {
    console.error('Error downloading log:', error)
    return NextResponse.json(
      { error: 'Failed to download log file' },
      { status: 500 }
    )
  }
}