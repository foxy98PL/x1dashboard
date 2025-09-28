import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const validators = await solanaRPC.getValidators();
    const stats = await solanaRPC.getValidatorStats();
    
    return NextResponse.json({
      success: true,
      data: {
        validators: validators, // Return all validators
        stats: {
          total: stats.total,
          average: stats.average,
          min: stats.min,
          max: stats.max,
          totalCredits: stats.totalCredits,
          totalPotentialAirdrop: stats.totalPotentialAirdrop,
          totalGenesisAirdrop: stats.totalGenesisAirdrop,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Validators API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch validator data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
