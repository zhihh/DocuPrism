import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Copy, Download, Eye } from 'lucide-react';
import { DuplicateResult, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/api';
import { copyToClipboard } from '@/utils/helpers';

interface ResultCardProps {
  result: DuplicateResult;
  index: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showDetails?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  index,
  isExpanded = false,
  onToggleExpand,
  showDetails = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 bg-red-50';
    if (score >= 0.6) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div 
      className={`border border-gray-200 rounded-lg transition-all duration-200 ${
        isHovered ? 'shadow-md border-primary-300' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-semibold text-gray-900">
              #{index + 1}
            </span>
            
            <div className="flex items-center space-x-2">
              <span className={`badge ${CATEGORY_COLORS[result.category as keyof typeof CATEGORY_COLORS]}`}>
                {CATEGORY_LABELS[result.category as keyof typeof CATEGORY_LABELS]}
              </span>
              
              <span className={`px-2 py-1 rounded-md text-sm font-medium ${getScoreColor(result.score)}`}>
                {formatScore(result.score)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {copySuccess && (
              <span className="text-sm text-green-600 animate-fade-in">
                已复制!
              </span>
            )}
            
            <button
              onClick={() => handleCopy(`文档${result.documentId1} vs 文档${result.documentId2}: ${result.reason}`)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="复制结果"
            >
              <Copy className="h-4 w-4" />
            </button>

            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={isExpanded ? "收起详情" : "展开详情"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* 快速预览 */}
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">文档 {result.documentId1}</span>
          <span className="mx-2">↔</span>
          <span className="font-medium">文档 {result.documentId2}</span>
          <span className="mx-2">•</span>
          <span className="italic">{result.reason}</span>
        </div>
      </div>

      {/* 详细内容 */}
      {showDetails && (isExpanded || !onToggleExpand) && (
        <div className="p-4 space-y-4">
          {/* 文档对比 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 文档1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  文档 {result.documentId1} - 页 {result.page1}
                </h4>
                <button
                  onClick={() => handleCopy(result.content1)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  复制
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">
                  前缀: {result.prefix1}
                </div>
                <div className="bg-white p-2 rounded border-l-4 border-blue-400 font-mono text-sm">
                  {result.content1}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  后缀: {result.suffix1}
                </div>
              </div>
            </div>

            {/* 文档2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  文档 {result.documentId2} - 页 {result.page2}
                </h4>
                <button
                  onClick={() => handleCopy(result.content2)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  复制
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">
                  前缀: {result.prefix2}
                </div>
                <div className="bg-white p-2 rounded border-l-4 border-purple-400 font-mono text-sm">
                  {result.content2}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  后缀: {result.suffix2}
                </div>
              </div>
            </div>
          </div>

          {/* 分析详情 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h5 className="text-sm font-medium text-amber-800 mb-1">
              分析结果
            </h5>
            <p className="text-sm text-amber-700">
              {result.reason}
            </p>
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-amber-600">
              <span>相似度: {formatScore(result.score)}</span>
              <span>分块ID: {result.chunkId1} ↔ {result.chunkId2}</span>
              <span>类别: {result.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;