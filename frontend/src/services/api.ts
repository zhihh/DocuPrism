import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Document, AnalysisResponse, HealthCheckResponse } from '@/types/api';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
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
   * 获取当前API基础URL
   */
  getBaseURL(): string {
    return this.baseURL;
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