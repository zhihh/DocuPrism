import React from 'react';
import { Clock, FileText, AlertTriangle, Copy, Download } from 'lucide-react';
import { DuplicateResult, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/api';
import { formatDuration, copyToClipboard, downloadAsFile } from '@/utils/helpers';

interface AnalysisResultsProps {
  results: DuplicateResult[];
  totalCount: number;
  processingTime: number;
  onExport?: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  totalCount,
  processingTime,
  onExport
}) => {
  const handleCopyResult = async (result: DuplicateResult) => {
    const text = `文档${result.documentId1} vs 文档${result.documentId2}:
内容1: ${result.content1}
内容2: ${result.content2}
原因: ${result.reason}
相似度: ${(result.score * 100).toFixed(1)}%
类别: ${CATEGORY_LABELS[result.category as keyof typeof CATEGORY_LABELS]}`;

    const success = await copyToClipboard(text);
    if (success) {
      // 这里可以添加 toast 通知
      console.log('复制成功');
    }
  };

  const handleExportAll = () => {
    const exportData = {
      summary: {
        totalCount,
        processingTime,
        timestamp: new Date().toISOString()
      },
      results: results.map(result => ({
        ...result,
        categoryLabel: CATEGORY_LABELS[result.category as keyof typeof CATEGORY_LABELS]
      }))
    };

    const json = JSON.stringify(exportData, null, 2);
    downloadAsFile(json, `bidcheck-results-${Date.now()}.json`, 'application/json');
    
    if (onExport) {
      onExport();
    }
  };

  if (results.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无分析结果
          </h3>
          <p className="text-gray-500">
            请上传文件并开始分析
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 结果摘要 */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">分析结果</h2>
          <button
            onClick={handleExportAll}
            className="btn btn-outline text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            导出结果
          </button>
        </div>
        
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{totalCount}</p>
              <p className="text-sm text-gray-600">发现重复项</p>
            </div>
            
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <p className="text-2xl font-bold text-success-600">
                {formatDuration(processingTime)}
              </p>
              <p className="text-sm text-gray-600">处理时间</p>
            </div>
            
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <p className="text-2xl font-bold text-warning-600">
                {new Set(results.flatMap(r => [r.documentId1, r.documentId2])).size}
              </p>
              <p className="text-sm text-gray-600">涉及文档数</p>
            </div>
          </div>
        </div>
      </div>

      {/* 详细结果 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">重复内容详情</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {results.map((result, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              {/* 结果头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`badge ${CATEGORY_COLORS[result.category as keyof typeof CATEGORY_COLORS]}`}>
                    {CATEGORY_LABELS[result.category as keyof typeof CATEGORY_LABELS]}
                  </span>
                  
                  <span className="text-sm text-gray-500">
                    相似度: {(result.score * 100).toFixed(1)}%
                  </span>
                </div>
                
                <button
                  onClick={() => handleCopyResult(result)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="复制结果"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              {/* 文档对比 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 文档1 */}
                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-primary-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      文档 {result.documentId1} (页 {result.page1})
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-2">前缀: {result.prefix1}</div>
                    <div className="font-mono text-sm text-gray-900 bg-white p-3 rounded border-l-4 border-primary-400">
                      {result.content1}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">后缀: {result.suffix1}</div>
                  </div>
                </div>

                {/* 文档2 */}
                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-secondary-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      文档 {result.documentId2} (页 {result.page2})
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-2">前缀: {result.prefix2}</div>
                    <div className="font-mono text-sm text-gray-900 bg-white p-3 rounded border-l-4 border-secondary-400">
                      {result.content2}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">后缀: {result.suffix2}</div>
                  </div>
                </div>
              </div>

              {/* 分析原因 */}
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">分析原因</p>
                    <p className="text-sm text-yellow-700">{result.reason}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;