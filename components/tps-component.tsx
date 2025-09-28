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
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const response = await fetch(`/api/transactions?t=${timestamp}&r=${randomId}&_=${timestamp}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
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
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Force refresh every 5 seconds by updating the query key
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const { data: transactions, isLoading } = useQuery({
    queryKey: [`tps-component-${refreshKey}`, Date.now()],
    queryFn: fetchTransactions,
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
      <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
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
                Loading...
              </div>
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Total Transactions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions) {
    return (
      <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Transaction Metrics
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Network transaction volume and throughput
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                Error
              </div>
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Total Transactions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLowTPS = transactions.transactionsPerSecond === 0;

  return (
    <Card className={`h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm transition-opacity duration-300 ${isLowTPS ? 'opacity-30' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
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
              {formatNumber(transactions.totalTransactions)}
            </div>
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Total Transactions
            </div>
          </div>
          <div className={`text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg border border-emerald-200 dark:border-emerald-700 transition-opacity duration-300 ${
            !transactions || transactions.transactionsPerSecond === 0 ? 'opacity-30' : 'opacity-100'
          }`}>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
              {transactions && transactions.transactionsPerSecond > 0 ? `${Math.round(transactions.transactionsPerSecond)} TPS` : '0 TPS'}
            </div>
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Transactions per second
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
