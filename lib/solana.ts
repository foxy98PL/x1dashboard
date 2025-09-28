import { Connection, PublicKey } from '@solana/web3.js';

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || 'https://rpc.testnet.x1.xyz/';

export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export interface SupplyInfo {
  total: number;
  circulating: number;
  nonCirculating: number;
}

export interface EpochInfo {
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
  blockHeight: number;
  transactionCount: number;
  epochProgress: number;
  timeRemaining: number;
}

export interface ValidatorInfo {
  identity: string;
  voteAccount: string;
  commission: number;
  lastVote: number;
  credits: number;
  totalCredits: number;
  potentialAirdrop: number;
  activatedStake: number;
  delinquent?: boolean;
}

export interface StakingInfo {
  totalStaked: number;
  activeStake: number;
  inactiveStake: number;
}

export interface TransactionData {
  totalTransactions: number;
  transactionsPerSecond: number;
  timestamp: string;
}

export interface PingData {
  responseTime: number;
  timestamp: string;
}

export class SolanaRPC {
  private connection: Connection;
  private lastTransactionCount: number = 0;
  private lastTransactionTimestamp: number = 0;

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, 'confirmed');
  }

  async getSupply(): Promise<SupplyInfo> {
    try {
      const supply = await this.connection.getSupply();
      // Convert from lamports to SOL (1 SOL = 1,000,000,000 lamports)
      const LAMPORTS_PER_SOL = 1_000_000_000;
      
      return {
        total: supply.value.total / LAMPORTS_PER_SOL,
        circulating: supply.value.circulating / LAMPORTS_PER_SOL,
        nonCirculating: supply.value.nonCirculating / LAMPORTS_PER_SOL,
      };
    } catch (error) {
      console.error('Error fetching supply:', error);
      throw new Error('Failed to fetch supply data');
    }
  }

  async getEpochInfo(): Promise<EpochInfo> {
    try {
      const epochInfo = await this.connection.getEpochInfo();
      
      // Calculate epoch progress percentage
      const epochProgress = (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100;
      
      // Estimate time remaining (simplified calculation)
      // Each slot is approximately 400ms, so we can estimate time remaining
      const slotsRemaining = epochInfo.slotsInEpoch - epochInfo.slotIndex;
      const estimatedTimeRemaining = slotsRemaining * 400; // 400ms per slot

      return {
        epoch: epochInfo.epoch,
        slotIndex: epochInfo.slotIndex,
        slotsInEpoch: epochInfo.slotsInEpoch,
        absoluteSlot: epochInfo.absoluteSlot,
        blockHeight: epochInfo.blockHeight || 0,
        transactionCount: epochInfo.transactionCount || 0,
        epochProgress,
        timeRemaining: estimatedTimeRemaining,
      };
    } catch (error) {
      console.error('Error fetching epoch info:', error);
      throw new Error('Failed to fetch epoch data');
    }
  }

  async getTransactionCount(): Promise<TransactionData> {
    try {
      const epochInfo = await this.connection.getEpochInfo();
      const currentTransactionCount = epochInfo.transactionCount || 0;
      const currentTimestamp = Date.now();
      
      let transactionsPerSecond = 0;
      
      // Calculate TPS if we have previous data
      if (this.lastTransactionCount > 0 && this.lastTransactionTimestamp > 0) {
        const timeDiff = (currentTimestamp - this.lastTransactionTimestamp) / 1000; // Convert to seconds
        const transactionDiff = currentTransactionCount - this.lastTransactionCount;
        
        if (timeDiff > 0) {
          transactionsPerSecond = transactionDiff / timeDiff;
        }
      }
      
      // Update tracking variables
      this.lastTransactionCount = currentTransactionCount;
      this.lastTransactionTimestamp = currentTimestamp;
      
      return {
        totalTransactions: currentTransactionCount,
        transactionsPerSecond: Math.max(0, Math.round(transactionsPerSecond)), // Round to whole number, minimum 0
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching transaction count:', error);
      throw new Error('Failed to fetch transaction count');
    }
  }

  async getStakingInfo(): Promise<StakingInfo> {
    try {
      const voteAccounts = await this.connection.getVoteAccounts();
      
      // Convert from lamports to SOL (1 SOL = 1,000,000,000 lamports)
      const LAMPORTS_PER_SOL = 1_000_000_000;
      
      // Calculate total stake from all validators
      let totalStaked = 0;
      let activeStake = 0;
      let inactiveStake = 0;
      
      // Sum up stakes from current validators
      for (const validator of voteAccounts.current) {
        const stakeInSOL = validator.activatedStake / LAMPORTS_PER_SOL;
        totalStaked += stakeInSOL;
        activeStake += stakeInSOL;
      }
      
      // Sum up stakes from delinquent validators
      for (const validator of voteAccounts.delinquent) {
        const stakeInSOL = validator.activatedStake / LAMPORTS_PER_SOL;
        totalStaked += stakeInSOL;
        inactiveStake += stakeInSOL;
      }
      
      return {
        totalStaked,
        activeStake,
        inactiveStake,
      };
    } catch (error) {
      console.error('Error fetching staking info:', error);
      throw new Error('Failed to fetch staking data');
    }
  }

  async getValidators(): Promise<ValidatorInfo[]> {
    try {
      // Fetch all validators
      const validators = await this.connection.getVoteAccounts();
      const validatorInfos: ValidatorInfo[] = [];

      // Process current validators
      for (const validator of validators.current) {
        const validatorInfo = this.processValidator(validator, false); // false = not delinquent
        validatorInfos.push(validatorInfo);
      }

      // Process delinquent validators
      for (const validator of validators.delinquent) {
        const validatorInfo = this.processValidator(validator, true); // true = delinquent
        validatorInfos.push(validatorInfo);
      }

      return validatorInfos;
    } catch (error) {
      console.error('Error fetching validators:', error);
      throw new Error('Failed to fetch validator data');
    }
  }

  private processValidator(validator: any, isDelinquent: boolean = false): ValidatorInfo {
    // Convert from lamports to XNT (1 XNT = 1,000,000,000 lamports)
    const LAMPORTS_PER_XNT = 1_000_000_000;
    
    // Get total credits from the latest epoch (cumulative credits)
    // epochCredits format: [epoch, creditsInEpoch, cumulativeCredits]
    const latestEpochCredits = validator.epochCredits[validator.epochCredits.length - 1];
    const totalCredits = latestEpochCredits ? latestEpochCredits[2] : 0; // cumulative credits

    // Current epoch credits (credits earned in current epoch)
    const currentCredits = latestEpochCredits ? latestEpochCredits[1] : 0;

    // Calculate potential airdrop: 50,000 credits = 1 XNT
    const potentialAirdropXNT = totalCredits / 50000; // Total potential XNT

    return {
      identity: validator.nodePubkey,
      voteAccount: validator.votePubkey,
      commission: validator.commission,
      lastVote: validator.lastVote,
      credits: currentCredits,
      totalCredits: totalCredits,
      potentialAirdrop: potentialAirdropXNT, // Full potential airdrop in XNT
      activatedStake: validator.activatedStake / LAMPORTS_PER_XNT, // Convert lamports to XNT
      delinquent: isDelinquent, // Use the parameter instead of validator.delinquent
    };
  }


  async getValidatorStats(): Promise<{
    average: number;
    min: number;
    max: number;
    total: number;
    totalCredits: number;
    totalPotentialAirdrop: number;
    totalGenesisAirdrop: number;
  }> {
    try {
      const validators = await this.getValidators();
      
      if (validators.length === 0) {
        return { 
          average: 0, 
          min: 0, 
          max: 0, 
          total: 0,
          totalCredits: 0,
          totalPotentialAirdrop: 0,
          totalGenesisAirdrop: 0
        };
      }

      // Calculate commission statistics
      const commissions = validators.map(v => v.commission).filter(c => c >= 0);
      const averageCommission = commissions.reduce((sum, commission) => sum + commission, 0) / commissions.length;
      const minCommission = Math.min(...commissions);
      const maxCommission = Math.max(...commissions);

      // Calculate total credits and potential airdrop across all validators
      const totalCredits = validators.reduce((sum, v) => sum + v.totalCredits, 0);
      const totalPotentialAirdrop = validators.reduce((sum, v) => sum + v.potentialAirdrop, 0);
      const totalGenesisAirdrop = totalPotentialAirdrop * 0.1; // 10% at genesis

      return {
        average: Math.round(averageCommission * 100) / 100,
        min: minCommission,
        max: maxCommission,
        total: validators.length,
        totalCredits: totalCredits,
        totalPotentialAirdrop: Math.round(totalPotentialAirdrop * 100) / 100,
        totalGenesisAirdrop: Math.round(totalGenesisAirdrop * 100) / 100,
      };
    } catch (error) {
      console.error('Error calculating validator stats:', error);
      throw new Error('Failed to calculate validator statistics');
    }
  }

  async getPing(): Promise<PingData> {
    try {
      const startTime = Date.now();
      await this.connection.getSlot();
      const endTime = Date.now();
      
      return {
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error measuring ping:', error);
      throw new Error('Failed to measure RPC ping');
    }
  }

  async getGasPrices(): Promise<{ normal: number; fast: number }> {
    try {
      // Simulate gas price calculation based on network conditions
      // In a real implementation, this would fetch actual gas prices from the network
      
      // Get recent block information to simulate network congestion
      const recentBlockhash = await this.connection.getRecentBlockhash();
      const slot = await this.connection.getSlot();
      
      // Simulate gas prices based on network activity
      // Normal transaction: base fee
      // Fast transaction: higher fee for priority
      const baseFee = 0.000005; // 0.000005 XNT base fee (more precise)
      const priorityMultiplier = 1.5; // Fast transactions cost 50% more
      
      return {
        normal: baseFee,
        fast: baseFee * priorityMultiplier,
      };
    } catch (error) {
      console.error('Error getting gas prices:', error);
      // Return default gas prices if API fails
      return {
        normal: 0.000005,
        fast: 0.0000075,
      };
    }
  }
}

export const solanaRPC = new SolanaRPC();
