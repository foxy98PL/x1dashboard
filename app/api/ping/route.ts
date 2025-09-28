import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const pingData = await solanaRPC.getPing();
    
    return NextResponse.json({
      success: true,
      data: {
        responseTime: pingData.responseTime,
        timestamp: pingData.timestamp,
      },
    });
  } catch (error) {
    console.error('Ping API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to measure RPC ping',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
