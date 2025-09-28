import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const epochInfo = await solanaRPC.getEpochInfo();
    const timestamp = new Date().toISOString();
    
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
        timestamp: timestamp,
        refreshId: Math.random().toString(36).substring(7),
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'CDN-Cache-Control': 'no-cache',
        'Vercel-CDN-Cache-Control': 'no-cache',
        'Vercel-Cache-Control': 'no-cache',
        'Last-Modified': timestamp,
        'ETag': `"${timestamp}-${Math.random()}"`,
      }
    });
  } catch (error) {
    console.error('Epoch API error:', error);
    const timestamp = new Date().toISOString();
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch epoch data',
        timestamp: timestamp,
        refreshId: Math.random().toString(36).substring(7),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'CDN-Cache-Control': 'no-cache',
          'Vercel-CDN-Cache-Control': 'no-cache',
          'Vercel-Cache-Control': 'no-cache',
          'Last-Modified': timestamp,
          'ETag': `"${timestamp}-${Math.random()}"`,
        }
      }
    );
  }
}
