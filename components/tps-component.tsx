'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Activity } from 'lucide-react';

interface TransactionData {
  totalTransactions: number;
  transactionsPerSecond: number;
  timestamp: string;
}

interface TPSComponentProps {
  onRefreshUpdate?: (timestamp: string) => void;
}

async function fetchTransactions(): Promise<TransactionData> {
  const response = await fetch(`/api/transactions?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toLocaleString();
}

export function TPSComponent({ onRefreshUpdate }: TPSComponentProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['tps-component'],
    queryFn: fetchTransactions,
    refetchInterval: 5000, // 5 seconds
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: false,
  });

  // Notify parent of refresh updates
  React.useEffect(() => {
    if (transactions?.timestamp && onRefreshUpdate) {
      onRefreshUpdate(transactions.timestamp);
    }
  }, [transactions?.timestamp, onRefreshUpdate]);

  if (isLoading) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Transactions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Network throughput and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-slate-400 dark:text-slate-500">
              Loading...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Transactions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Network throughput and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-red-500">
              Error
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLowTPS = transactions.transactionsPerSecond === 0;

  return (
    <Card className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 transition-opacity duration-300 ${isLowTPS ? 'opacity-30' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Transactions
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Network throughput and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
              <div className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">TPS</div>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {Math.round(transactions.transactionsPerSecond)}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total</div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {formatNumber(transactions.totalTransactions)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Transactions per second
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              Updated: {new Date(transactions.timestamp).toLocaleTimeString()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
