'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  lastRefresh?: string;
  isOnline: boolean;
  currentView?: 'dashboard' | 'validators';
}

export function Header({ onMenuToggle, lastRefresh, isOnline, currentView }: HeaderProps) {
  const [nextUpdateCountdown, setNextUpdateCountdown] = useState<string>('5s');

  useEffect(() => {
    if (currentView !== 'dashboard') return;

    const updateCountdown = () => {
      if (!lastRefresh) {
        setNextUpdateCountdown('5s');
        return;
      }
      
      const date = new Date(lastRefresh);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const remainingMs = 5000 - (diffMs % 5000); // 5 second intervals
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      setNextUpdateCountdown(`${remainingSeconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [lastRefresh, currentView]);



  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Center */}
          {currentView === 'dashboard' && (
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div>Next update in: {nextUpdateCountdown}</div>
              </div>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-emerald-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
