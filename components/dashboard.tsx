'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Activity, Users, Zap } from 'lucide-react';

interface SupplyData {
  total: number;
  circulating: number;
  nonCirculating: number;
  timestamp: string;
}

interface EpochData {
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
  blockHeight: number;
  transactionCount: number;
  epochProgress: number;
  timeRemaining: number;
  timestamp: string;
}

interface TransactionData {
  totalTransactions: number;
  transactionsPerSecond: number;
  timestamp: string;
}

interface StakingData {
  totalStaked: number;
  activeStake: number;
  inactiveStake: number;
  timestamp: string;
}

interface PingData {
  responseTime: number;
  timestamp: string;
}

interface GasData {
  normal: number;
  fast: number;
  timestamp: string;
}

interface ValidatorData {
  validators: Array<{
    identity: string;
    voteAccount: string;
    commission: number;
    lastVote: number;
    credits: number;
    totalCredits: number;
    potentialAirdrop: number;
    activatedStake: number;
  }>;
  stats: {
    total: number;
    average: number;
    min: number;
    max: number;
    totalCredits: number;
    totalPotentialAirdrop: number;
    totalGenesisAirdrop: number;
  };
  timestamp: string;
}

// API fetch functions
async function fetchSupply(): Promise<SupplyData> {
  const response = await fetch(`/api/supply?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

async function fetchEpoch(): Promise<EpochData> {
  const response = await fetch(`/api/epoch?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

async function fetchTransactions(): Promise<TransactionData> {
  const response = await fetch(`/api/transactions?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

async function fetchStaking(): Promise<StakingData> {
  const response = await fetch(`/api/staking?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

async function fetchValidators(): Promise<ValidatorData> {
  const response = await fetch(`/api/validators?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

async function fetchPing(): Promise<PingData> {
  const response = await fetch(`/api/ping?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

async function fetchGas(): Promise<GasData> {
  const response = await fetch(`/api/gas?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

// Formatting functions
function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

function formatXNT(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T XNT';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B XNT';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M XNT';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K XNT';
  if (num >= 1) return num.toFixed(2) + ' XNT';
  if (num >= 0.01) return num.toFixed(4) + ' XNT';
  return num.toFixed(6) + ' XNT';
}

function formatGasPrice(num: number): string {
  // For gas prices, show more decimal places for precision
  if (num >= 1) return num.toFixed(6) + ' XNT';
  if (num >= 0.001) return num.toFixed(6) + ' XNT';
  return num.toFixed(8) + ' XNT';
}

function formatTimeRemaining(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`;
}

function formatCommission(num: number): string {
  return `${num.toFixed(2)}%`;
}

interface DashboardProps {
  onRefreshUpdate?: (timestamp: string) => void;
}

export function Dashboard({ onRefreshUpdate }: DashboardProps) {
  const { data: supply, isLoading: supplyLoading, refetch: refetchSupply } = useQuery({
    queryKey: ['supply'],
    queryFn: fetchSupply,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  const { data: epoch, isLoading: epochLoading, refetch: refetchEpoch } = useQuery({
    queryKey: ['epoch'],
    queryFn: fetchEpoch,
    refetchInterval: 5000, // 5 seconds - same as other dashboard data
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: false,
  });

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    refetchInterval: 5000, // 5 seconds - same as other dashboard data
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: false,
  });

  const { data: staking, isLoading: stakingLoading, refetch: refetchStaking } = useQuery({
    queryKey: ['staking'],
    queryFn: fetchStaking,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  const { data: validators, isLoading: validatorsLoading, refetch: refetchValidators } = useQuery({
    queryKey: ['validators'],
    queryFn: fetchValidators,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent unnecessary refreshes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  const { data: ping, isLoading: pingLoading, refetch: refetchPing } = useQuery({
    queryKey: ['ping'],
    queryFn: fetchPing,
    refetchInterval: 5000, // 5 seconds - same as other dashboard data
    staleTime: 0, // Always consider data stale for real-time updates
  });

  const { data: gas, isLoading: gasLoading, refetch: refetchGas } = useQuery({
    queryKey: ['gas'],
    queryFn: fetchGas,
    refetchInterval: 5000, // 5 seconds - same as other dashboard data
  });

  const isLoading = supplyLoading || epochLoading || transactionsLoading || stakingLoading || validatorsLoading || pingLoading || gasLoading;

  // Track refresh times and notify parent
  useEffect(() => {
    if (supply?.timestamp) {
      onRefreshUpdate?.(supply.timestamp);
    }
  }, [supply?.timestamp, onRefreshUpdate]);

  useEffect(() => {
    if (epoch?.timestamp) {
      onRefreshUpdate?.(epoch.timestamp);
    }
  }, [epoch?.timestamp, onRefreshUpdate]);

  useEffect(() => {
    if (transactions?.timestamp) {
      onRefreshUpdate?.(transactions.timestamp);
    }
  }, [transactions?.timestamp, onRefreshUpdate]);

  useEffect(() => {
    if (staking?.timestamp) {
      onRefreshUpdate?.(staking.timestamp);
    }
  }, [staking?.timestamp, onRefreshUpdate]);

  useEffect(() => {
    if (ping?.timestamp) {
      onRefreshUpdate?.(ping.timestamp);
    }
  }, [ping?.timestamp, onRefreshUpdate]);

  useEffect(() => {
    if (gas?.timestamp) {
      onRefreshUpdate?.(gas.timestamp);
    }
  }, [gas?.timestamp, onRefreshUpdate]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading X1 Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100 tracking-tight">
            X1 Network Dashboard
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-400 text-base">
            Real-time blockchain analytics and monitoring
          </p>
        </motion.div>

        <div className="space-y-4">
          {/* Supply Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Token Supply
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Total and circulating XNT supply metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                      {supply ? formatXNT(supply.total) : 'N/A'}
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Supply</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                      {supply ? formatXNT(supply.circulating) : 'N/A'}
                    </div>
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Circulating Supply
                      {supply && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                          {formatPercentage((supply.circulating / supply.total) * 100)} of total
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 mb-2">
                      {supply ? formatXNT(supply.nonCirculating) : 'N/A'}
                    </div>
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Non-Circulating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Epoch Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    Current Epoch
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Epoch progress and timing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                        {epoch ? epoch.epoch : 'N/A'}
                      </div>
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Current Epoch</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="text-indigo-700 dark:text-indigo-300">{epoch ? formatPercentage(epoch.epochProgress) : '0%'}</span>
                      </div>
                      <div className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${epoch ? epoch.epochProgress : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                        {epoch ? formatTimeRemaining(epoch.timeRemaining) : 'N/A'}
                      </div>
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Time Remaining</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Transactions Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Transaction Metrics
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Network transaction volume and throughput
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                        {transactions ? formatNumber(transactions.totalTransactions) : 'N/A'}
                      </div>
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Total Transactions
                      </div>
                    </div>
                    <div className={`text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg border border-emerald-200 dark:border-emerald-700 transition-opacity duration-300 ${
                      !transactions || transactions.transactionsPerSecond === 0 ? 'opacity-30' : 'opacity-100'
                    }`}>
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                        {transactions && transactions.transactionsPerSecond > 0 ? `${transactions.transactionsPerSecond} TPS` : '0 TPS'}
                      </div>
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Transactions per second
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Validators Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <Zap className="h-5 w-5 text-amber-600" />
                    Validator Network
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Validator performance and reward metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg border border-amber-200 dark:border-amber-700">
                        <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mb-1">
                          {validators ? validators.stats.total : 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Total Validators</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                          {validators ? formatCommission(validators.stats.average) : 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Avg Commission</div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-lg border border-cyan-200 dark:border-cyan-700">
                      <div className="text-lg font-bold text-cyan-700 dark:text-cyan-300 mb-1">
                        {validators ? formatNumber(validators.stats.totalCredits) : 'N/A'}
                      </div>
                      <div className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Total Credits Earned</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 rounded-lg border border-rose-200 dark:border-rose-700">
                        <div className="text-lg font-bold text-rose-700 dark:text-rose-300 mb-1">
                          {validators ? formatXNT(validators.stats.totalPotentialAirdrop) : 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-rose-600 dark:text-rose-400">Full Airdrop</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-lg border border-pink-200 dark:border-pink-700">
                        <div className="text-lg font-bold text-pink-700 dark:text-pink-300 mb-1">
                          {validators ? formatXNT(validators.stats.totalGenesisAirdrop) : 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-pink-600 dark:text-pink-400">Genesis (10%)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ping Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <Activity className="h-5 w-5 text-red-600" />
                    Network Performance
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    RPC endpoint response time monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Response Time */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                        {ping ? `${ping.responseTime}ms` : 'N/A'}
                      </div>
                      <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
                        Response Time
                      </div>
                      {ping && (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          ping.responseTime < 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 
                          ping.responseTime < 300 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {ping.responseTime < 100 ? 'Excellent' : 
                           ping.responseTime < 300 ? 'Good' : 'Slow'}
                        </div>
                      )}
                    </div>

                    {/* Gas Simulation */}
                    {gas && (
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <div className="text-center mb-3">
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Gas Simulation
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1">
                              {formatGasPrice(gas.normal)}
                            </div>
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              Normal
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-1">
                              {formatGasPrice(gas.fast)}
                            </div>
                            <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                              Fast
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Staking Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <Users className="h-5 w-5 text-teal-600" />
                    Staking Overview
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Network staking distribution and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-700 dark:text-teal-300 mb-2">
                        {staking ? formatXNT(staking.totalStaked) : 'N/A'}
                      </div>
                      <div className="text-sm font-medium text-teal-600 dark:text-teal-400">Total Staked</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                          {staking ? formatXNT(staking.activeStake) : 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Stake</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="text-lg font-bold text-orange-700 dark:text-orange-300 mb-1">
                          {staking ? formatXNT(staking.inactiveStake) : 'N/A'}
                        </div>
                        <div className="text-xs font-medium text-orange-600 dark:text-orange-400">Delinquent</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}