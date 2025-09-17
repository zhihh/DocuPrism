import { useState, useCallback } from 'react';
import { AnalysisState, DuplicateResult } from '@/types/api';
import apiService from '@/services/api';
import { Document } from '@/types/api';

export const useAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    results: null,
    error: null,
    totalCount: 0,
    processingTime: 0,
  });

  const analyzeDocuments = useCallback(async (documents: Document[]) => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      progress: 0,
      error: null,
      results: null,
    }));

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 500);

      const response = await apiService.analyzeDocuments(documents);

      clearInterval(progressInterval);

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100,
        results: response.data,
        totalCount: response.total_count,
        processingTime: response.processing_time,
      }));

      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 0,
        error: error instanceof Error ? error.message : '分析失败',
      }));
      throw error;
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      progress: 0,
      results: null,
      error: null,
      totalCount: 0,
      processingTime: 0,
    });
  }, []);

  return {
    ...state,
    analyzeDocuments,
    resetAnalysis,
  };
};