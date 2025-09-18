import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle, XCircle, X } from 'lucide-react';

interface ApiConfigProps {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  onClose?: () => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({
  currentUrl,
  onUrlChange,
  onClose
}) => {
  const [tempUrl, setTempUrl] = useState(currentUrl);
  const [savedUrls, setSavedUrls] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // 预设的常用API地址
  const presetUrls = [
    'https://zhihh.github.io/DocuPrism/api',
    'https://docuprism.zhihh.xyz',
    'http://8.137.111.189:50200',
    'http://localhost:8000'
  ];

  // 测试连接
  const testConnection = async () => {
    if (!tempUrl.trim()) return;
    
    setIsTestingConnection(true);
    try {
      const response = await fetch(`${tempUrl}/health`, {
        method: 'GET'
      });
      
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem('docuprism_api_urls');
    if (saved) {
      try {
        setSavedUrls(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved URLs:', e);
      }
    }
  }, []);

  useEffect(() => {
    setTempUrl(currentUrl);
  }, [currentUrl]);

  const handleSave = () => {
    if (tempUrl.trim()) {
      onUrlChange(tempUrl.trim());
      
      // 保存到历史记录
      const newSavedUrls = [...new Set([tempUrl.trim(), ...savedUrls])].slice(0, 10);
      setSavedUrls(newSavedUrls);
      localStorage.setItem('docuprism_api_urls', JSON.stringify(newSavedUrls));
      
      onClose?.();
    }
  };

  const handleSelectUrl = (url: string) => {
    setTempUrl(url);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getStatusIcon = () => {
    if (isTestingConnection) {
      return <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />;
    } else if (isConnected === true) {
      return <CheckCircle className="h-4 w-4 text-success-600" />;
    } else if (isConnected === false) {
      return <XCircle className="h-4 w-4 text-error-600" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (isTestingConnection) return '正在测试连接...';
    if (isConnected === true) return 'API连接正常';
    if (isConnected === false) return 'API连接失败';
    return '';
  };

  const getStatusColor = () => {
    if (isTestingConnection) return 'text-gray-500';
    if (isConnected === true) return 'text-success-600';
    if (isConnected === false) return 'text-error-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">API配置</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 当前连接状态 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText() || '点击测试连接'}
            </span>
          </div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            当前: {currentUrl}
          </div>
        </div>
      </div>

      {/* API地址配置 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API服务地址
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="请输入API服务地址"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={testConnection}
              disabled={!tempUrl.trim() || !validateUrl(tempUrl) || isTestingConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTestingConnection ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                '测试'
              )}
            </button>
          </div>
          {tempUrl && !validateUrl(tempUrl) && (
            <p className="text-sm text-error-600 mt-1">
              请输入有效的URL地址
            </p>
          )}
        </div>

        {/* 预设地址 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            常用地址
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presetUrls.map((url) => (
              <button
                key={url}
                onClick={() => handleSelectUrl(url)}
                className={`text-left px-3 py-2 text-sm border rounded-lg transition-colors ${
                  tempUrl === url
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {url}
              </button>
            ))}
          </div>
        </div>

        {/* 历史记录 */}
        {savedUrls.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              历史记录
            </label>
            <div className="space-y-1">
              {savedUrls.slice(0, 5).map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectUrl(url)}
                  className={`w-full text-left px-3 py-2 text-sm border rounded-lg transition-colors ${
                    tempUrl === url
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {url}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!tempUrl.trim() || !validateUrl(tempUrl)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfig;