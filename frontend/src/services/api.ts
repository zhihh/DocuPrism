import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Document, AnalysisResponse, HealthCheckResponse } from '@/types/api';

// Backend API相关类型
export interface SupportedFormatsResponse {
  success: boolean;
  data: {
    formats: Record<string, string>;
    ocr_enabled: boolean;
    ocr_formats: string[];
  };
}

export interface ProcessorStatusResponse {
  success: boolean;
  data: {
    ocr_enabled: boolean;
    supported_formats: Record<string, string>;
    version: string;
  };
}

export interface DocumentProcessResult {
  success: boolean;
  message: string;
  data: {
    document_id: string;
    document_type: string;
    total_pages: number;
    total_text_length: number;
    processing_time: number;
    metadata: Record<string, any>;
    pages: Array<{
      page_number: number;
      width: number;
      height: number;
      has_images: boolean;
      image_count: number;
      text_blocks_count: number;
    }>;
    text_blocks: Array<{
      text: string;
      page_number: number;
      block_id: string;
      original_position?: [number, number, number, number];
      char_start: number;
      char_end: number;
      confidence: number;
      block_type: string;
      is_ocr: boolean;
    }>;
  };
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // 从环境变量或localStorage获取API地址
    this.baseURL = this.getApiBaseUrl();
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 300000, // 5分钟超时
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API请求错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API响应: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API响应错误:', error);
        
        // 处理常见错误
        if (error.response) {
          const status = error.response.status;
          switch (status) {
            case 400:
              throw new Error('请求参数错误');
            case 404:
              throw new Error('API接口不存在');
            case 422:
              throw new Error('数据验证失败');
            case 500:
              throw new Error('服务器内部错误');
            case 503:
              throw new Error('服务暂时不可用');
            default:
              throw new Error(`请求失败 (${status})`);
          }
        } else if (error.request) {
          throw new Error('网络连接失败，请检查网络设置');
        } else {
          throw new Error('请求配置错误');
        }
      }
    );
  }

  private getApiBaseUrl(): string {
    // 1. 检查localStorage中的配置
    const storedApiUrl = localStorage.getItem('apiBaseUrl');
    if (storedApiUrl && storedApiUrl !== 'default') {
      return storedApiUrl;
    }

    // 2. 检查环境变量
    const envApiUrl = import.meta.env.VITE_API_BASE_URL;
    if (envApiUrl) {
      return envApiUrl;
    }

    // 3. 默认值 - 使用HTTPS生产服务器
    return 'https://docuprism.zhihh.xyz';
  }

  // 动态更新API地址
  updateBaseURL(newBaseURL: string) {
    this.baseURL = newBaseURL;
    this.api.defaults.baseURL = newBaseURL;
    localStorage.setItem('apiBaseUrl', newBaseURL);
    console.log(`API地址已更新为: ${newBaseURL}`);
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await this.api.get<HealthCheckResponse>('/health');
    return response.data;
  }

  /**
   * 获取服务状态
   */
  async getStatus(): Promise<{ status: string; message: string }> {
    const response = await this.api.get<{ status: string; message: string }>('/');
    return response.data;
  }

  /**
   * 分析文档重复度
   */
  async analyzeDocuments(documents: Document[]): Promise<AnalysisResponse> {
    // 验证输入
    if (!documents || documents.length === 0) {
      throw new Error('文档列表不能为空');
    }

    if (documents.length < 2) {
      throw new Error('至少需要2个文档进行比较');
    }

    // 验证文档格式
    for (const doc of documents) {
      if (!doc.content || doc.content.trim().length === 0) {
        throw new Error(`文档${doc.documentId}的内容不能为空`);
      }
      if (doc.content.length > 50000) {
        throw new Error(`文档${doc.documentId}内容过长，请控制在50000字符以内`);
      }
    }

    console.log(`开始分析${documents.length}个文档...`);
    
    const response = await this.api.post<AnalysisResponse>('/api/v2/analyze', documents);
    
    console.log(`分析完成，发现${response.data.total_count}个重复项`);
    
    return response.data;
  }

  /**
   * 获取API文档
   */
  async getApiDocs(): Promise<string> {
    const response = await this.api.get('/docs', {
      headers: {
        'Accept': 'text/html',
      },
    });
    return response.data;
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }

  /**
   * 获取支持的文件格式
   */
  async getSupportedFormats(): Promise<SupportedFormatsResponse> {
    const response = await this.api.get<SupportedFormatsResponse>('/api/v2/supported-formats');
    return response.data;
  }

  /**
   * 获取文档处理器状态
   */
  async getProcessorStatus(): Promise<ProcessorStatusResponse> {
    const response = await this.api.get<ProcessorStatusResponse>('/api/v2/processor-status');
    return response.data;
  }

  /**
   * 上传并处理单个文档
   */
  async uploadAndProcessDocument(file: File, documentId?: string): Promise<DocumentProcessResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (documentId) {
      formData.append('document_id', documentId);
    }

    const response = await this.api.post<DocumentProcessResult>(
      '/api/v2/upload-document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5分钟超时，处理大文件
      }
    );

    return response.data;
  }

  /**
   * 批量上传文档并直接进行查重分析
   */
  async uploadAndAnalyzeDocuments(
    files: File[], 
    threshold: number = 0.7, 
    method: string = 'semantic'
  ): Promise<AnalysisResponse> {
    if (!files || files.length === 0) {
      throw new Error('文件列表不能为空');
    }

    if (files.length < 2) {
      throw new Error('至少需要2个文件进行比较');
    }

    const formData = new FormData();
    
    // 添加所有文件
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // 添加参数
    formData.append('threshold', threshold.toString());
    formData.append('method', method);

    console.log(`开始批量处理和分析${files.length}个文件...`);

    const response = await this.api.post(
      '/api/v2/upload-and-analyze',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10分钟超时，处理多个大文件
      }
    );

    console.log(`批量分析完成，发现${response.data.total_count}个重复项`);
    
    // 转换后端响应格式为前端期望的格式
    const backendData = response.data;
    
    // 将后端格式转换为前端DuplicateResult格式
    const convertedData = backendData.data?.map((item: any) => ({
      documentId1: item.doc1_id || item.documentId1,
      page1: item.page1 || 1,
      chunkId1: 1,
      content1: item.content1,
      prefix1: '',
      suffix1: '',
      documentId2: item.doc2_id || item.documentId2,
      page2: item.page2 || 1,
      chunkId2: 1,
      content2: item.content2,
      prefix2: '',
      suffix2: '',
      reason: item.reason,
      score: item.similarity || item.score,
      category: item.category || 1
    })) || [];
    
    return {
      success: backendData.success !== false,
      message: backendData.message || '分析完成',
      data: convertedData,
      total_count: backendData.total_count || convertedData.length,
      processing_time: backendData.processing_time || 0
    };
  }

  /**
   * 设置API基础URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.api.defaults.baseURL = url;
  }
}

// 创建单例实例
const apiService = new ApiService();

export default apiService;