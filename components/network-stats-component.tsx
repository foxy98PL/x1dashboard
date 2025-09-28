'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock } from 'lucide-react';

interface GasData {
  normal: number;
  fast: number;
  timestamp: string;
}

interface NetworkStatsComponentProps {
  onRefreshUpdate?: (timestamp: string) => void;
}

async function fetchGas(): Promise<GasData> {
  const response = await fetch(`/api/gas?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

function formatGasPrice(price: number): string {
  if (price >= 0.01) return price.toFixed(4) + ' XNT';
  if (price >= 0.001) return price.toFixed(5) + ' XNT';
  if (price >= 0.0001) return price.toFixed(6) + ' XNT';
  return price.toFixed(8) + ' XNT';
}

export function NetworkStatsComponent({ onRefreshUpdate }: NetworkStatsComponentProps) {
  const { data: gas, isLoading } = useQuery({
    queryKey: ['gas-component'],
    queryFn: fetchGas,

    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: false,
  });

  // Notify parent of refresh updates
  React.useEffect(() => {
    if (gas?.timestamp && onRefreshUpdate) {
      onRefreshUpdate(gas.timestamp);
    }
  }, [gas?.timestamp, onRefreshUpdate]);

  if (isLoading) {
    return (
      <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <Zap className="h-5 w-5 text-purple-600" />
            Gas Simulation
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Transaction fee estimation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                Loading...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gas) {
    return (
      <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <Zap className="h-5 w-5 text-purple-600" />
            Gas Simulation
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Transaction fee estimation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                Error
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Zap className="h-5 w-5 text-purple-600" />
          Gas Simulation
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Transaction fee estimation
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
