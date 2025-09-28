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
  const response = await fetch(`/api/epoch?t=${Date.now()}`);
  const data = await response.json();
  return data.data;
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
  const { data: epoch, isLoading } = useQuery({
    queryKey: ['epoch-component'],
    queryFn: fetchEpoch,
    refetchInterval: 5000, // 5 seconds
    staleTime: 0, // Always consider data stale
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
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            Current Epoch
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Slot progress and timing
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

  if (!epoch) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            Current Epoch
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Slot progress and timing
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
          <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          Current Epoch
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Slot progress and timing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Epoch</div>
              <div className="text-xl font-bold text-green-800 dark:text-green-200">
                {epoch.epoch.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Slot</div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                {epoch.slotIndex.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {epoch.epochProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${epoch.epochProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {formatTimeRemaining(epoch.timeRemaining)} remaining
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              Updated: {new Date(epoch.timestamp).toLocaleTimeString()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
