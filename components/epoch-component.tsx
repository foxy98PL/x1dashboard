'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface EpochData {
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
  blockHeight: number;
  transactionCount: number;
  epochProgress: number;
  timeRemaining: number;
  timestamp: string;
}

interface EpochComponentProps {
  onRefreshUpdate?: (timestamp: string) => void;
}

async function fetchEpoch(): Promise<EpochData> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Aggressive cache-busting for production
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const response = await fetch(`/api/epoch?t=${timestamp}&r=${randomId}&_=${timestamp}`, {
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
    const response = await fetch(`/api/epoch?t=${Date.now()}`);
    const data = await response.json();
    return data.data;
  }
}

function formatTimeRemaining(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function EpochComponent({ onRefreshUpdate }: EpochComponentProps) {
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

  const { data: epoch, isLoading } = useQuery({
    queryKey: isProduction ? [`epoch-component-${refreshKey}`, Date.now()] : ['epoch-component'],
    queryFn: fetchEpoch,
    refetchInterval: isProduction ? undefined : 5000, // Use normal refetch interval locally
    staleTime: isProduction ? 0 : 30 * 1000, // Allow some caching locally
    refetchOnWindowFocus: false,
  });

  // Notify parent of refresh updates
  React.useEffect(() => {
    if (epoch?.timestamp && onRefreshUpdate) {
      onRefreshUpdate(epoch.timestamp);
    }
  }, [epoch?.timestamp, onRefreshUpdate]);

  if (isLoading) {
    return (
      <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Current Epoch
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Epoch progress and timing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                Loading...
              </div>
              <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Current Epoch</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!epoch) {
    return (
      <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Current Epoch
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Epoch progress and timing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                Error
              </div>
              <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Current Epoch</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Calendar className="h-5 w-5 text-indigo-600" />
          Current Epoch
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Epoch progress and timing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">
              {epoch.epoch.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Current Epoch</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="text-indigo-700 dark:text-indigo-300">{epoch.epochProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${epoch.epochProgress}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
              {formatTimeRemaining(epoch.timeRemaining)}
            </div>
            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Time Remaining</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
