import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for current status
// In production, you might want to use Redis or database
const currentStatusStore: { [key: number]: { status: number; timestamp: string } } = {};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pondId: string }> }
) {
  try {
    const { pondId } = await params;
    const body = await request.json();
    
    // Validate request body
    if (!body.status || typeof body.status !== 'number') {
      return NextResponse.json(
        { error: 'Status is required and must be a number' },
        { status: 400 }
      );
    }
    
    // Validate status range (1-5)
    if (body.status < 1 || body.status > 5) {
      return NextResponse.json(
        { error: 'Status must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Status messages mapping
  const statusMessages = {
    1: 'Preparing the camera...',
    2: 'Starting to lift the net...',
    3: 'Capture successful...',
    4: 'Please wait for the data...',
    5: 'Completed!!'
  };

    
    const statusData = {
      pondId: parseInt(pondId),
      status: body.status,
      message: statusMessages[body.status as keyof typeof statusMessages],
      timestamp: new Date().toISOString(),
      source: 'raspi'
    };
    
    // Update the status in the shared store
    currentStatusStore[parseInt(pondId)] = {
      status: body.status,
      timestamp: new Date().toISOString()
    };
    
    // Log the status update
    console.log(`Pond ${pondId} status updated:`, statusData);
    
    return NextResponse.json({
      success: true,
      data: statusData
    });
    
  } catch (error) {
    console.error('Error updating pond status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pondId: string }> }
) {
  try {
    const { pondId } = await params;
    const parsedPondId = parseInt(pondId);

    // Get current status from store
    const currentStatus = currentStatusStore[parsedPondId];

    if (!currentStatus) {
      return NextResponse.json({
        success: true,
        data: { pondId: parsedPondId, status: 0, message: 'No status available' }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        pondId: parsedPondId,
        status: currentStatus.status,
        timestamp: currentStatus.timestamp
      }
    });
  } catch (error) {
    console.error('Error getting pond status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
