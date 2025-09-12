import React, { useState, useEffect } from 'react';
import { Database, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { adminCache } from '../../services/adminCache';
import { IOSCard } from '../ios/IOSDesignSystem';

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  entries: Array<{ key: string; age: number; size: number }>;
}

export const AdminCacheMonitor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(adminCache.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatAge = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const handleClearCache = () => {
    adminCache.clear();
    setStats(adminCache.getStats());
  };

  if (!stats) return null;

  return (
    <div className={className}>
      <IOSCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-white flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Cache Performance
            </h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-pink-400 hover:text-pink-400"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-white">{stats.totalEntries}</div>
              <div className="text-xs text-gray-500">Entries</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{formatBytes(stats.totalSize)}</div>
              <div className="text-xs text-gray-500">Size</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {stats.hitRate ? `${(stats.hitRate * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500">Hit Rate</div>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-gray-700">Cache Entries</span>
                <button
                  onClick={handleClearCache}
                  className="flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Clear Cache
                </button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stats.entries.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-2">No cache entries</div>
                ) : (
                  stats.entries.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <span className="text-gray-700 truncate flex-1 mr-2" title={entry.key}>
                        {entry.key.length > 20 ? `${entry.key.substring(0, 20)}...` : entry.key}
                      </span>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatAge(entry.age)}
                        </span>
                        <span>{formatBytes(entry.size)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {stats.totalEntries > 0 && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              💡 Cache reduces API calls by storing frequently accessed data
            </div>
          )}
        </div>
      </IOSCard>
    </div>
  );
};

export default AdminCacheMonitor;
