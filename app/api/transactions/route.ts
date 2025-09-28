import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const transactionData = await solanaRPC.getTransactionCount();
    
    return NextResponse.json({
      success: true,
      data: {
        totalTransactions: transactionData.totalTransactions,
        transactionsPerSecond: transactionData.transactionsPerSecond,
        timestamp: transactionData.timestamp,
      },
    });
  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transaction data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
