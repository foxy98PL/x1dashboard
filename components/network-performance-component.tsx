'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface PingData {
  responseTime: number;
  timestamp: string;
}

interface GasData {
  normal: number;
  fast: number;
  timestamp: string;
}

interface NetworkPerformanceComponentProps {
  onRefreshUpdate?: (timestamp: string) => void;
}

async function fetchPing(): Promise<PingData> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Aggressive cache-busting for production
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const response = await fetch(`/api/ping?t=${timestamp}&r=${randomId}&_=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    const data = await response.json();
    return data.data;
  } else {
    // Normal fetch for local development
    const response = await fetch(`/api/ping?t=${Date.now()}`);
    const data = await response.json();
    return data.data;
  }
}

async function fetchGas(): Promise<GasData> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Aggressive cache-busting for production
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const response = await fetch(`/api/gas?t=${timestamp}&r=${randomId}&_=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    const data = await response.json();
    return data.data;
  } else {
    // Normal fetch for local development
    const response = await fetch(`/api/gas?t=${Date.now()}`);
    const data = await response.json();
    return data.data;
  }
}

function formatPingTime(ms: number): string {
  if (ms < 100) return `${ms}ms`;
  if (ms < 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatGasPrice(price: number): string {
  if (price >= 0.01) return price.toFixed(4) + ' XNT';
  if (price >= 0.001) return price.toFixed(5) + ' XNT';
  if (price >= 0.0001) return price.toFixed(6) + ' XNT';
  return price.toFixed(8) + ' XNT';
}

function getPingStatus(responseTime: number): { label: string; color: string } {
  if (responseTime < 100) return { label: 'Excellent', color: 'bg-emerald-500' };
  if (responseTime < 500) return { label: 'Good', color: 'bg-yellow-500' };
  return { label: 'Slow', color: 'bg-red-500' };
}

export function NetworkPerformanceComponent({ onRefreshUpdate }: NetworkPerformanceComponentProps) {
  const isProduction = process.env.NODE_ENV === 'production';
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Force refresh every 5 seconds by updating the query key (production only)
  React.useEffect(() => {
    if (!isProduction) return;
    
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [isProduction]);

  const { data: ping, isLoading: pingLoading } = useQuery({
    queryKey: isProduction ? [`ping-combined-${refreshKey}`, Date.now()] : ['ping-combined'],
    queryFn: fetchPing,
    refetchInterval: isProduction ? undefined : 5000, // Use normal refetch interval locally
    staleTime: isProduction ? 0 : 30 * 1000, // Allow some caching locally
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log(`[Ping] Data received:`, {
        responseTime: data.responseTime,
        timestamp: data.timestamp,
        requestId: data.requestId,
        apiResponseTime: data.apiResponseTime,
        refreshId: data.refreshId,
      });
    },
    onError: (error) => {
      console.error(`[Ping] Query error:`, error);
    },
  });

  const { data: gas, isLoading: gasLoading } = useQuery({
    queryKey: isProduction ? [`gas-combined-${refreshKey}`, Date.now()] : ['gas-combined'],
    queryFn: fetchGas,
    refetchInterval: isProduction ? undefined : 5000, // Use normal refetch interval locally
    staleTime: isProduction ? 0 : 30 * 1000, // Allow some caching locally
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log(`[Gas] Data received:`, {
        normal: data.normal,
        fast: data.fast,
        timestamp: data.timestamp,
        requestId: data.requestId,
        apiResponseTime: data.apiResponseTime,
        refreshId: data.refreshId,
      });
    },
    onError: (error) => {
      console.error(`[Gas] Query error:`, error);
    },
  });

  // Notify parent of refresh updates
  React.useEffect(() => {
    if (ping?.timestamp && onRefreshUpdate) {
      onRefreshUpdate(ping.timestamp);
    }
  }, [ping?.timestamp, onRefreshUpdate]);

  React.useEffect(() => {
    if (gas?.timestamp && onRefreshUpdate) {
      onRefreshUpdate(gas.timestamp);
    }
  }, [gas?.timestamp, onRefreshUpdate]);

  const isLoading = pingLoading || gasLoading;

  if (isLoading) {
    return (
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
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                Loading...
              </div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
                Response Time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pingStatus = ping ? getPingStatus(ping.responseTime) : null;

  return (
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
              {ping ? formatPingTime(ping.responseTime) : 'N/A'}
            </div>
            <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
              Response Time
            </div>
            {ping && pingStatus && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                ping.responseTime < 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 
                ping.responseTime < 300 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {pingStatus.label}
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
  );
}
