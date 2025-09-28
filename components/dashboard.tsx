'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Activity, Users, Zap } from 'lucide-react';
import { PingComponent } from './ping-component';
import { NetworkStatsComponent } from './network-stats-component';
import { EpochComponent } from './epoch-component';
import { TPSComponent } from './tps-component';
import { NetworkPerformanceComponent } from './network-performance-component';

interface SupplyData {
  total: number;
  circulating: number;
  nonCirculating: number;
  timestamp: string;
}

interface StakingData {
  totalStaked: number;
  activeStake: number;
  inactiveStake: number;
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
  const { data: supply, isLoading: supplyLoading } = useQuery({
    queryKey: ['supply'],
    queryFn: fetchSupply,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  const { data: staking, isLoading: stakingLoading } = useQuery({
    queryKey: ['staking'],
    queryFn: fetchStaking,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  const { data: validators, isLoading: validatorsLoading } = useQuery({
    queryKey: ['validators'],
    queryFn: fetchValidators,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent unnecessary refreshes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  const isLoading = supplyLoading || stakingLoading || validatorsLoading;

  // Track refresh times and notify parent
  useEffect(() => {
    if (supply?.timestamp) {
      onRefreshUpdate?.(supply.timestamp);
    }
  }, [supply?.timestamp, onRefreshUpdate]);

  useEffect(() => {
    if (staking?.timestamp) {
      onRefreshUpdate?.(staking.timestamp);
    }
  }, [staking?.timestamp, onRefreshUpdate]);

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
              <EpochComponent onRefreshUpdate={onRefreshUpdate} />
            </motion.div>

            {/* Transactions Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TPSComponent onRefreshUpdate={onRefreshUpdate} />
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
            {/* Network Performance Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <NetworkPerformanceComponent onRefreshUpdate={onRefreshUpdate} />
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