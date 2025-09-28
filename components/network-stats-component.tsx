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
    refetchInterval: 5000, // 5 seconds
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
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Network Performance
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Gas simulation and pricing
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

  if (!gas) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Network Performance
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Gas simulation and pricing
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

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Network Performance
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Gas simulation and pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Normal</div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {formatGasPrice(gas.normal)}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Fast</div>
              <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
                {formatGasPrice(gas.fast)}
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated: {new Date(gas.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
