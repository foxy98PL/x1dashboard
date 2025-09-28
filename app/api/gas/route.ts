import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    // Simulate gas prices for normal and fast transactions
    // In a real implementation, this would fetch actual gas prices from the network
    const gasPrices = await solanaRPC.getGasPrices();
    
    return NextResponse.json({
      success: true,
      data: {
        normal: gasPrices.normal,
        fast: gasPrices.fast,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Gas API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gas prices',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
