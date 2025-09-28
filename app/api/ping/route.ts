import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const pingData = await solanaRPC.getPing();
    const timestamp = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      data: {
        responseTime: pingData.responseTime,
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
    console.error('Ping API error:', error);
    const timestamp = new Date().toISOString();
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to measure RPC ping',
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
