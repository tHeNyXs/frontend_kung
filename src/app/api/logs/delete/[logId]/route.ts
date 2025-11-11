import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/logs/delete/[logId] - Delete a log file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const { logId } = await params
    
    // Forward request to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const deleteUrl = `${backendUrl}/api/v1/logs/${logId}`
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend responded with ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting log:', error)
    return NextResponse.json(
      { error: 'Failed to delete log file' },
      { status: 500 }
    )
  }
}