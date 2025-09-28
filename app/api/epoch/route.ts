import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const epochInfo = await solanaRPC.getEpochInfo();
    
    return NextResponse.json({
      success: true,
      data: {
        epoch: epochInfo.epoch,
        slotIndex: epochInfo.slotIndex,
        slotsInEpoch: epochInfo.slotsInEpoch,
        absoluteSlot: epochInfo.absoluteSlot,
        blockHeight: epochInfo.blockHeight,
        transactionCount: epochInfo.transactionCount,
        epochProgress: epochInfo.epochProgress,
        timeRemaining: epochInfo.timeRemaining,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Epoch API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch epoch data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
