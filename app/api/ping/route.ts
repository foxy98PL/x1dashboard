import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.debug(`[${requestId}] Ping API called at ${new Date().toISOString()}`);
  
  try {
    console.debug(`[${requestId}] Making RPC call to getSlot...`);
    const pingData = await solanaRPC.getPing();
    const timestamp = new Date().toISOString();
    const responseTime = Date.now() - startTime;
    
    console.debug(`[${requestId}] RPC call completed in ${responseTime}ms, response time: ${pingData.responseTime}ms`);
    
    const response = {
      success: true,
      data: {
        responseTime: pingData.responseTime,
        timestamp: timestamp,
        refreshId: Math.random().toString(36).substring(7),
        requestId: requestId,
        apiResponseTime: responseTime,
      },
    };
    
    console.debug(`[${requestId}] Sending response:`, response);
    
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
    
    console.error(`[${requestId}] Ping API error after ${responseTime}ms:`, error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to measure RPC ping',
      timestamp: timestamp,
      refreshId: Math.random().toString(36).substring(7),
      requestId: requestId,
      apiResponseTime: responseTime,
    };
    
    console.debug(`[${requestId}] Sending error response:`, errorResponse);
    
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
