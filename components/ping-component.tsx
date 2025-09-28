'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock } from 'lucide-react';

interface PingData {
  responseTime: number;
  timestamp: string;
}

interface PingComponentProps {
  onRefreshUpdate?: (timestamp: string) => void;
}

async function fetchPing(): Promise<PingData> {
  const response = await fetch(`/api/ping?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
}

function formatPingTime(ms: number): string {
  if (ms < 100) return `${ms}ms`;
  if (ms < 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getPingStatus(responseTime: number): { label: string; color: string } {
  if (responseTime < 100) return { label: 'Excellent', color: 'bg-emerald-500' };
  if (responseTime < 500) return { label: 'Good', color: 'bg-yellow-500' };
  return { label: 'Slow', color: 'bg-red-500' };
}

export function PingComponent({ onRefreshUpdate }: PingComponentProps) {
  const { data: ping, isLoading } = useQuery({
    queryKey: ['ping-component'],
    queryFn: fetchPing,
    refetchInterval: 5000, // 5 seconds
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: false,
  });

  // Notify parent of refresh updates
  React.useEffect(() => {
    if (ping?.timestamp && onRefreshUpdate) {
      onRefreshUpdate(ping.timestamp);
    }
  }, [ping?.timestamp, onRefreshUpdate]);

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

  if (!ping) {
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
                Error
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

  const pingStatus = getPingStatus(ping.responseTime);

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
              {formatPingTime(ping.responseTime)}
            </div>
            <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
              Response Time
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              ping.responseTime < 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 
              ping.responseTime < 300 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {pingStatus.label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
