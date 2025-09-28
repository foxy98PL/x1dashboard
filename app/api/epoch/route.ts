import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`[${requestId}] Epoch API called at ${new Date().toISOString()}`);
  
  try {
    console.log(`[${requestId}] Making RPC call to getEpochInfo...`);
    const epochInfo = await solanaRPC.getEpochInfo();
    const timestamp = new Date().toISOString();
    const responseTime = Date.now() - startTime;
    
    console.log(`[${requestId}] RPC call completed in ${responseTime}ms, epoch: ${epochInfo.epoch}, progress: ${epochInfo.epochProgress.toFixed(1)}%`);
    
    const response = {
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
        requestId: requestId,
        apiResponseTime: responseTime,
      },
    };
    
    console.log(`[${requestId}] Sending response:`, response);
    
    return NextResponse.json(response, {
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
    const timestamp = new Date().toISOString();
    const responseTime = Date.now() - startTime;
    
    console.error(`[${requestId}] Epoch API error after ${responseTime}ms:`, error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to fetch epoch data',
      timestamp: timestamp,
      refreshId: Math.random().toString(36).substring(7),
      requestId: requestId,
      apiResponseTime: responseTime,
    };
    
    console.log(`[${requestId}] Sending error response:`, errorResponse);
    
    return NextResponse.json(errorResponse, { 
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
    });
  }
}
