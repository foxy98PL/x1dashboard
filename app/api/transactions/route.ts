import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`[${requestId}] Transactions API called at ${new Date().toISOString()}`);
  
  try {
    console.log(`[${requestId}] Making RPC call to getTransactionCount...`);
    const transactionData = await solanaRPC.getTransactionCount();
    const timestamp = new Date().toISOString();
    const responseTime = Date.now() - startTime;
    
    console.log(`[${requestId}] RPC call completed in ${responseTime}ms, TPS: ${transactionData.transactionsPerSecond}`);
    
    const response = {
      success: true,
      data: {
        totalTransactions: transactionData.totalTransactions,
        transactionsPerSecond: transactionData.transactionsPerSecond,
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
    
    console.error(`[${requestId}] Transactions API error after ${responseTime}ms:`, error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to fetch transaction data',
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
