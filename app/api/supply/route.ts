import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const supply = await solanaRPC.getSupply();
    
    return NextResponse.json({
      success: true,
      data: {
        total: supply.total,
        circulating: supply.circulating,
        nonCirculating: supply.nonCirculating,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Supply API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch supply data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
