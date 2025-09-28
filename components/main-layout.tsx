'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Dashboard } from './dashboard';
import { ValidatorsPage } from './validators-page';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'validators'>('dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleViewChange = (view: 'dashboard' | 'validators') => {
    setCurrentView(view);
  };

  const handleRefreshUpdate = (timestamp: string) => {
    setLastRefresh(timestamp);
  };

  const handleRefresh = () => {
    // Force refresh by updating the timestamp
    setLastRefresh(new Date().toISOString());
    // Force refresh all queries
    window.location.reload();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onRefreshUpdate={handleRefreshUpdate} />;
      case 'validators':
        return <ValidatorsPage />;
      default:
        return <Dashboard onRefreshUpdate={handleRefreshUpdate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-70' : 'ml-0'} lg:ml-70`}>
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          lastRefresh={lastRefresh}
          isOnline={isOnline}
          currentView={currentView}
          onRefresh={handleRefresh}
        />
        
        {renderCurrentView()}
      </div>
    </div>
  );
}
