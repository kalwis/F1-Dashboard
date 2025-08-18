import { useState, useEffect } from 'react';
import { FaSync, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import fastf1Api from '../services/fastf1Api';

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    isOnline: false,
    isLoading: false,
    cacheStatus: [],
    nextAutoSync: null
  });

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const checkApiStatus = async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const isOnline = await fastf1Api.isAvailable();
      const cacheStatus = fastf1Api.getCacheStatus();
      
      // Find the most recent cache entry
      const lastSync = cacheStatus.length > 0 
        ? Math.max(...cacheStatus.map(entry => entry.timestamp || 0))
        : null;

      // Calculate next auto-sync (every 5 minutes based on cache timeout)
      const nextAutoSync = lastSync ? lastSync + (5 * 60 * 1000) : null;

      setSyncStatus({
        lastSync,
        isOnline,
        isLoading: false,
        cacheStatus,
        nextAutoSync
      });
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: false,
        isLoading: false
      }));
    }
  };

  const handleManualSync = async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Clear cache to force fresh data fetch
      fastf1Api.clearCache();
      
      // Trigger a health check to update status
      await checkApiStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (syncStatus.isLoading) return <FaSync className="animate-spin" />;
    if (syncStatus.isOnline) return <FaCheckCircle className="text-green-400" />;
    return <FaExclamationTriangle className="text-yellow-400" />;
  };

  const getStatusText = () => {
    if (syncStatus.isLoading) return 'Checking...';
    if (!syncStatus.isOnline) return 'API Offline';
    if (!syncStatus.lastSync) return 'No data synced';
    return 'Online';
  };

  const getStatusColor = () => {
    if (syncStatus.isLoading) return 'text-blue-400';
    if (!syncStatus.isOnline) return 'text-yellow-400';
    if (!syncStatus.lastSync) return 'text-gray-400';
    return 'text-green-400';
  };

  return (
    <div className="flex items-center justify-between text-xs text-gray-400">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span>API Status:</span>
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
            <span className={getStatusColor()}>{getStatusText()}</span>
          </div>
        </div>
        
        {syncStatus.lastSync && (
          <div className="flex items-center space-x-1">
            <FaClock className="text-gray-500" />
            <span>Last synced: <strong>{formatTimeAgo(syncStatus.lastSync)}</strong></span>
          </div>
        )}
      </div>
      
      <button
        onClick={handleManualSync}
        disabled={syncStatus.isLoading}
        className="flex items-center space-x-1 px-3 py-1.5 bg-black/20 border border-white/10 hover:bg-black/30 hover:border-white/20 disabled:bg-black/10 disabled:border-white/5 disabled:cursor-not-allowed rounded-md transition-all duration-200 text-gray-300 hover:text-white"
      >
        <FaSync className={`w-3 h-3 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
        <span className="text-xs">Sync Now</span>
      </button>
    </div>
  );
}
