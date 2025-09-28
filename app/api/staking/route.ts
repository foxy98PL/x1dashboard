import { NextRequest, NextResponse } from 'next/server';
import { solanaRPC } from '@/lib/solana';

export async function GET(request: NextRequest) {
  try {
    const stakingInfo = await solanaRPC.getStakingInfo();
    
    return NextResponse.json({
      success: true,
      data: {
        totalStaked: stakingInfo.totalStaked,
        activeStake: stakingInfo.activeStake,
        inactiveStake: stakingInfo.inactiveStake,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Staking API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch staking data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
