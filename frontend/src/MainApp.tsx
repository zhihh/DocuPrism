import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, RefreshCw, Settings } from 'lucide-react';
import FileUploader from './components/FileUploader';
import AnalysisResults from './components/AnalysisResults';
import ProgressBar from './components/ProgressBar';
import ApiConfig from './components/ApiConfig';
import { useAnalysis } from './hooks/useAnalysis';
import { FileUpload } from './types/api';
import apiService from './services/api';
import './index.css';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('');
  const [showApiConfig, setShowApiConfig] = useState<boolean>(false);
  
  const {
    isAnalyzing,
    progress,
    results,
    error: analysisError,
    totalCount,
    processingTime,
    analyzeFiles,
    resetAnalysis,
  } = useAnalysis();

  // 检查API连接状态
  const checkConnection = async () => {
    try {
      const response = await apiService.healthCheck();
      setIsConnected(true);
      setApiStatus(response.message || '服务正常');
    } catch (error) {
      setIsConnected(false);
      setApiStatus(error instanceof Error ? error.message : '连接失败');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  // 处理API配置变更
  const handleApiConfigChange = (newUrl: string) => {
    apiService.updateBaseURL(newUrl);
    checkConnection(); // 重新检查连接
  };

  // 开始分析
  const handleAnalyze = async () => {
    const validFiles = files.filter(f => f.status === 'completed');
    
    if (validFiles.length < 2) {
      alert('至少需要2个有效文档才能进行分析');
      return;
    }

    try {
      await analyzeFiles(validFiles);
    } catch (error) {
      console.error('分析失败:', error);
    }
  };

  // 重置所有状态
  const handleReset = () => {
    setFiles([]);
    resetAnalysis();
  };

  const getValidFileCount = () => {
    return files.filter(f => f.status === 'completed').length;
  };

  const canAnalyze = () => {
    return getValidFileCount() >= 2 && !isAnalyzing && isConnected;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  DocuPrism AI
                </h1>
                <p className="text-sm text-gray-500">
                  AI语义文档比对系统
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 连接状态 */}
              <div className="flex items-center space-x-2">
                {isConnected === null ? (
                  <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
                ) : isConnected ? (
                  <CheckCircle className="h-4 w-4 text-success-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-error-600" />
                )}
                
                <span className={`text-sm ${
                  isConnected === null ? 'text-gray-500' :
                  isConnected ? 'text-success-600' : 'text-error-600'
                }`}>
                  {isConnected === null ? '连接中...' :
                   isConnected ? '服务正常' : '连接失败'}
                </span>
              </div>
              
              {/* API配置按钮 */}
              <button
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="API配置"
              >
                <Settings className="h-4 w-4" />
              </button>
              
              <button
                onClick={checkConnection}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="重新检查连接"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* API配置 */}
          {showApiConfig && (
            <ApiConfig
              currentUrl={apiService.getDisplayURL()}
              onUrlChange={handleApiConfigChange}
              onClose={() => setShowApiConfig(false)}
            />
          )}

          {/* API状态警告 */}
          {!isConnected && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-error-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-error-800">
                    API服务连接失败
                  </h3>
                  <p className="text-sm text-error-700 mt-1">
                    {apiStatus}. 请检查后端服务是否启动，默认地址: http://localhost:8000
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 文件上传区域 */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                文档上传
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                上传需要检测的文档文件，支持 PDF、Word、TXT、MD、JSON、图片格式
              </p>
            </div>
            
            <div className="card-body">
              <FileUploader
                files={files}
                onFilesChange={setFiles}
                disabled={isAnalyzing || !isConnected}
                maxFiles={10}
                mode="backend"
              />
            </div>
          </div>

          {/* 分析控制区域 */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    开始分析
                  </h3>
                  <p className="text-sm text-gray-600">
                    已准备 {getValidFileCount()} 个文档，
                    {getValidFileCount() >= 2 ? '可以开始分析' : '至少需要2个文档'}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="btn btn-outline"
                    disabled={isAnalyzing}
                  >
                    重置
                  </button>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze()}
                    className="btn btn-primary"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        开始分析
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 进度条 */}
              {(isAnalyzing || progress > 0) && (
                <ProgressBar
                  progress={progress}
                  isActive={isAnalyzing}
                  label="分析进度"
                />
              )}

              {/* 错误信息 */}
              {analysisError && (
                <div className="mt-4 bg-error-50 border border-error-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-error-400 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-error-800">
                        分析失败
                      </h3>
                      <p className="text-sm text-error-700 mt-1">
                        {analysisError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 分析结果 */}
          {results && (
            <AnalysisResults
              results={results}
              totalCount={totalCount}
              processingTime={processingTime}
              onExport={() => console.log('导出结果')}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              DocuPrism AI v2.0.0 - 基于AI语义理解的文档智能比对系统
            </p>
            <p className="mt-1">
              API端点: {apiService.getBaseURL()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;