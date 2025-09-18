import { useState, useCallback } from 'react';
import { AnalysisState, DuplicateResult, FileUpload } from '@/types/api';
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

  const analyzeFiles = useCallback(async (files: FileUpload[]) => {
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

      // 检查是否需要使用新的批量上传和分析API
      // 对于backend模式或者非文本文件，使用新API
      const needsBackendProcessing = files.some(f => 
        f.mode === 'backend' && (
          !f.content || // 没有内容（如PDF、DOCX等）
          f.file.name.toLowerCase().match(/\.(pdf|docx|png|jpg|jpeg)$/) // 或者是需要后端处理的格式
        )
      );

      let response;
      
      if (needsBackendProcessing) {
        // 使用新的批量上传和分析API
        console.log('使用后端批量处理API');
        const fileObjects = files
          .filter(f => f.status === 'completed')
          .map(f => f.file);
        
        response = await apiService.uploadAndAnalyzeDocuments(fileObjects);
      } else {
        // 使用传统的文档分析API
        console.log('使用传统文档分析API');
        const documents: Document[] = files
          .filter(f => f.status === 'completed' && f.content)
          .map(f => ({
            documentId: f.documentId,
            page: f.page,
            content: f.content!
          }));
        
        if (documents.length === 0) {
          throw new Error('没有可分析的文档内容');
        }
        
        response = await apiService.analyzeDocuments(documents);
      }

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
    analyzeFiles,
    resetAnalysis,
  };
};