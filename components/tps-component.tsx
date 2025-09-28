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
  requestId?: string;
  apiResponseTime?: number;
  refreshId?: string;
}

interface TPSComponentProps {
  onRefreshUpdate?: (timestamp: string) => void;
}

async function fetchTransactions(): Promise<TransactionData> {
  const fetchId = Math.random().toString(36).substring(7);
  
  console.log(`[${fetchId}] Fetching transactions data`);
  
  const url = `/api/transactions?t=${Date.now()}`;
  console.log(`[${fetchId}] Fetch URL: ${url}`);
  
  const response = await fetch(url);
  console.log(`[${fetchId}] Fetch response status: ${response.status}`);
  const data = await response.json();
  console.log(`[${fetchId}] Fetch data:`, data);
  return data.data;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toLocaleString();
}

export function TPSComponent({ onRefreshUpdate }: TPSComponentProps) {
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['tps-component'],
    queryFn: fetchTransactions,
    refetchInterval: 5000, // Always use 5 second interval
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  });

      // Log data when it changes
      React.useEffect(() => {
        if (transactions) {
          console.log(`[TPS] Data received:`, {
            tps: transactions.transactionsPerSecond,
            total: transactions.totalTransactions.toLocaleString(),
            timestamp: transactions.timestamp,
            requestId: transactions.requestId,
            apiResponseTime: transactions.apiResponseTime,
            refreshId: transactions.refreshId,
          });
        }
      }, [transactions]);

      // Log errors
      React.useEffect(() => {
        if (error) {
          console.error(`[TPS] Query error:`, error);
        }
      }, [error]);

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
