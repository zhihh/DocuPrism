// API响应类型定义
export interface Document {
  documentId: number;
  page: number;
  content: string;
}

export interface DuplicateResult {
  documentId1: number;
  page1: number;
  chunkId1: number;
  content1: string;
  prefix1: string;
  suffix1: string;
  documentId2: number;
  page2: number;
  chunkId2: number;
  content2: string;
  prefix2: string;
  suffix2: string;
  reason: string;
  score: number;
  category: number;
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  data: DuplicateResult[];
  total_count: number;
  processing_time: number;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}

// UI相关类型
export interface FileUpload {
  id: string;
  file: File;
  documentId: number;
  page: number;
  content?: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'uploading';
  error?: string;
  mode?: 'legacy' | 'backend'; // 处理模式
}

export interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  results: DuplicateResult[] | null;
  error: string | null;
  totalCount: number;
  processingTime: number;
}

// 分类常量
export const CATEGORY_LABELS = {
  1: '语义相似/重复内容',
  2: '错误一致（相同错别字）',
  3: '报价异常（数列规律）'
} as const;

export const CATEGORY_COLORS = {
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-orange-100 text-orange-800 border-orange-200',
  3: 'bg-red-100 text-red-800 border-red-200'
} as const;

export type CategoryType = keyof typeof CATEGORY_LABELS;