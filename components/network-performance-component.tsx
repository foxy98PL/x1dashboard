'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface PingData {
  responseTime: number;
  timestamp: string;
  requestId?: string;
  apiResponseTime?: number;
  refreshId?: string;
}

interface GasData {
  normal: number;
  fast: number;
  timestamp: string;
  requestId?: string;
  apiResponseTime?: number;
  refreshId?: string;
}

interface NetworkPerformanceComponentProps {
  onRefreshUpdate?: (timestamp: string) => void;
}

async function fetchPing(): Promise<PingData> {
  const fetchId = Math.random().toString(36).substring(7);
  
  console.log(`[${fetchId}] Fetching ping data`);
  
  const url = `/api/ping?t=${Date.now()}`;
  console.log(`[${fetchId}] Fetch URL: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`[${fetchId}] Fetch response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[${fetchId}] Fetch data:`, data);
    return data.data;
  } catch (error) {
    console.error(`[${fetchId}] Fetch error:`, error);
    throw error;
  }
}

async function fetchGas(): Promise<GasData> {
  const fetchId = Math.random().toString(36).substring(7);
  
  console.log(`[${fetchId}] Fetching gas data`);
  
  const url = `/api/gas?t=${Date.now()}`;
  console.log(`[${fetchId}] Fetch URL: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`[${fetchId}] Fetch response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[${fetchId}] Fetch data:`, data);
    return data.data;
  } catch (error) {
    console.error(`[${fetchId}] Fetch error:`, error);
    throw error;
  }
}

function formatPingTime(ms: number): string {
  return `${ms}ms`;
}

function formatGasPrice(num: number): string {
  if (num >= 1) return num.toFixed(6) + ' XNT';
  if (num >= 0.001) return num.toFixed(6) + ' XNT';
  return num.toFixed(8) + ' XNT';
}

function getPingStatus(responseTime: number): { label: string; color: string } {
  if (responseTime < 100) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' };
  if (responseTime < 500) return { label: 'Good', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' };
  return { label: 'Slow', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' };
}

export function NetworkPerformanceComponent({ onRefreshUpdate }: NetworkPerformanceComponentProps) {
  const { data: ping, isLoading: pingLoading, error: pingError } = useQuery({
    queryKey: ['ping-combined'],
    queryFn: fetchPing,
    refetchInterval: 5000, // Always use 5 second interval
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  });

  const { data: gas, isLoading: gasLoading, error: gasError } = useQuery({
    queryKey: ['gas-combined'],
    queryFn: fetchGas,
    refetchInterval: 5000, // Always use 5 second interval
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  });

      // Log ping data when it changes
      React.useEffect(() => {
        if (ping) {
          console.log(`[Ping] Data received:`, {
            responseTime: ping.responseTime + 'ms',
            timestamp: ping.timestamp,
            requestId: ping.requestId,
            apiResponseTime: (ping.apiResponseTime || 0) + 'ms',
            refreshId: ping.refreshId,
          });
        }
      }, [ping]);

      // Log gas data when it changes
      React.useEffect(() => {
        if (gas) {
          console.log(`[Gas] Data received:`, {
            normal: gas.normal.toFixed(8) + ' XNT',
            fast: gas.fast.toFixed(8) + ' XNT',
            timestamp: gas.timestamp,
            requestId: gas.requestId,
            apiResponseTime: (gas.apiResponseTime || 0) + 'ms',
            refreshId: gas.refreshId,
          });
        }
      }, [gas]);

      // Log errors
      React.useEffect(() => {
        if (pingError) {
          console.error(`[Ping] Query error:`, pingError);
        }
      }, [pingError]);

      React.useEffect(() => {
        if (gasError) {
          console.error(`[Gas] Query error:`, gasError);
        }
      }, [gasError]);

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
