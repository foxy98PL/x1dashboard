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
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Network Ping
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            RPC response time measurement
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

  if (!ping) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Network Ping
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            RPC response time measurement
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

  const pingStatus = getPingStatus(ping.responseTime);

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Network Ping
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          RPC response time measurement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {formatPingTime(ping.responseTime)}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${pingStatus.color} text-white`}>
              {pingStatus.label}
            </Badge>
            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated: {new Date(ping.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
