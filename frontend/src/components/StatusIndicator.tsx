import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, Clock, Server } from 'lucide-react';
import apiService from '@/services/api';

interface ConnectionStatus {
  isConnected: boolean;
  latency: number | null;
  lastCheck: Date | null;
  error: string | null;
}

interface StatusIndicatorProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 30000 // 30秒
}) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    latency: null,
    lastCheck: null,
    error: null
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    const startTime = Date.now();

    try {
      await apiService.healthCheck();
      const endTime = Date.now();
      const latency = endTime - startTime;

      setStatus({
        isConnected: true,
        latency,
        lastCheck: new Date(),
        error: null
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        latency: null,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : '连接失败'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // 初始检查
    checkConnection();

    // 自动刷新
    if (autoRefresh) {
      const interval = setInterval(checkConnection, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-500';
    return status.isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <Activity className={`h-4 w-4 ${getStatusColor()} animate-pulse`} />;
    }
    return status.isConnected ? 
      <Wifi className={`h-4 w-4 ${getStatusColor()}`} /> :
      <WifiOff className={`h-4 w-4 ${getStatusColor()}`} />;
  };

  const getStatusText = () => {
    if (isChecking) return '检查中...';
    if (status.isConnected) {
      return showDetails && status.latency ? 
        `在线 (${status.latency}ms)` : '在线';
    }
    return '离线';
  };

  const formatLastCheck = () => {
    if (!status.lastCheck) return '';
    const now = Date.now();
    const diff = now - status.lastCheck.getTime();
    
    if (diff < 60000) {
      return '刚刚检查';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}分钟前`;
    } else {
      const hours = Math.floor(diff / 3600000);
      return `${hours}小时前`;
    }
  };

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">
          服务状态
        </h3>
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          刷新
        </button>
      </div>

      <div className="space-y-3">
        {/* 连接状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm text-gray-700">连接状态</span>
          </div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* 延迟 */}
        {status.latency !== null && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">响应时间</span>
            </div>
            <span className="text-sm text-gray-600">
              {status.latency}ms
            </span>
          </div>
        )}

        {/* API地址 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-700">API地址</span>
          </div>
          <span className="text-sm text-gray-600 font-mono truncate max-w-48">
            {apiService.getBaseURL()}
          </span>
        </div>

        {/* 最后检查时间 */}
        {status.lastCheck && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
            {formatLastCheck()}
          </div>
        )}

        {/* 错误信息 */}
        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-sm text-red-700">
              {status.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;