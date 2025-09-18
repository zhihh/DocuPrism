"""
后端文档处理模块的日志配置
与统一日志系统集成
"""

import os
import sys
import logging
import logging.handlers
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
import json


class DocumentProcessingLogger:
    """文档处理专用日志器 - 集成到统一日志系统"""
    
    def __init__(self, log_dir: str = "logs", log_level: str = "INFO"):
        # 确保使用统一的 logs 目录
        project_root = Path(__file__).parent.parent.parent
        self.log_dir = project_root / "logs"
        self.log_dir.mkdir(exist_ok=True)
        self.log_level = getattr(logging, log_level.upper(), logging.INFO)
        
        # 使用与统一日志系统相同的格式
        self.detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        self.simple_formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # 创建主日志器
        self.logger = self._setup_logger()
        
    def _setup_logger(self) -> logging.Logger:
        """设置主日志器"""
        logger = logging.getLogger('document_processing')
        logger.setLevel(self.log_level)
        
        # 清除现有的处理器
        for handler in logger.handlers[:]:
            logger.removeHandler(handler)
        
        # 1. 控制台处理器
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(self.log_level)
        console_handler.setFormatter(self.simple_formatter)
        logger.addHandler(console_handler)
        
        # 2. 详细日志文件处理器
        detailed_log_file = self.log_dir / 'document_processing_detailed.log'
        detailed_handler = logging.handlers.RotatingFileHandler(
            detailed_log_file,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        detailed_handler.setLevel(logging.DEBUG)
        detailed_handler.setFormatter(self.detailed_formatter)
        logger.addHandler(detailed_handler)
        
        # 3. 错误日志文件处理器
        error_log_file = self.log_dir / 'document_processing_errors.log'
        error_handler = logging.handlers.RotatingFileHandler(
            error_log_file,
            maxBytes=5*1024*1024,  # 5MB
            backupCount=3,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(self.detailed_formatter)
        logger.addHandler(error_handler)
        
        # 4. API访问日志处理器
        api_log_file = self.log_dir / 'document_api_access.log'
        api_handler = logging.handlers.RotatingFileHandler(
            api_log_file,
            maxBytes=20*1024*1024,  # 20MB
            backupCount=10,
            encoding='utf-8'
        )
        api_handler.setLevel(logging.INFO)
        
        # API日志使用JSON格式
        api_formatter = logging.Formatter('%(message)s')
        api_handler.setFormatter(api_formatter)
        
        # 创建API专用日志器
        api_logger = logging.getLogger('document_processing.api')
        api_logger.addHandler(api_handler)
        
        return logger
    
    def get_logger(self, name: Optional[str] = None) -> logging.Logger:
        """获取日志器"""
        if name:
            return logging.getLogger(f'document_processing.{name}')
        return self.logger
    
    def log_api_request(self, endpoint: str, method: str, files_info: List[Dict[str, Any]], 
                       client_ip: Optional[str] = None, user_agent: Optional[str] = None):
        """记录API请求"""
        api_logger = logging.getLogger('document_processing.api')
        
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'type': 'request',
            'endpoint': endpoint,
            'method': method,
            'client_ip': client_ip,
            'user_agent': user_agent,
            'files_count': len(files_info),
            'files_info': files_info
        }
        
        api_logger.info(json.dumps(log_data, ensure_ascii=False))
    
    def log_api_response(self, endpoint: str, method: str, status_code: int,
                        processing_time: float, result_summary: Dict[str, Any]):
        """记录API响应"""
        api_logger = logging.getLogger('document_processing.api')
        
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'type': 'response',
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'processing_time': processing_time,
            'result_summary': result_summary
        }
        
        api_logger.info(json.dumps(log_data, ensure_ascii=False))
    
    def log_processing_stats(self, file_type: str, file_size: int, 
                           processing_time: float, text_blocks: int,
                           ocr_used: bool = False):
        """记录处理统计信息"""
        stats_logger = logging.getLogger('document_processing.stats')
        
        log_data = {
            'timestamp': datetime.now().isoformat(),
            'file_type': file_type,
            'file_size': file_size,
            'processing_time': processing_time,
            'text_blocks': text_blocks,
            'ocr_used': ocr_used,
            'throughput': file_size / processing_time if processing_time > 0 else 0
        }
        
        stats_logger.info(json.dumps(log_data, ensure_ascii=False))


# 全局日志器实例
_doc_logger = None

def get_document_logger(name: Optional[str] = None) -> logging.Logger:
    """获取文档处理日志器"""
    global _doc_logger
    
    if _doc_logger is None:
        log_level = os.environ.get('DOC_LOG_LEVEL', 'INFO')
        log_dir = os.environ.get('DOC_LOG_DIR', 'logs')
        _doc_logger = DocumentProcessingLogger(log_dir=log_dir, log_level=log_level)
    
    return _doc_logger.get_logger(name)

def log_api_access(endpoint: str, method: str, files_info: List[Dict[str, Any]], 
                  client_ip: Optional[str] = None, user_agent: Optional[str] = None):
    """记录API访问"""
    global _doc_logger
    if _doc_logger:
        _doc_logger.log_api_request(endpoint, method, files_info, client_ip, user_agent)

def log_api_result(endpoint: str, method: str, status_code: int,
                  processing_time: float, result_summary: Dict[str, Any]):
    """记录API结果"""
    global _doc_logger
    if _doc_logger:
        _doc_logger.log_api_response(endpoint, method, status_code, processing_time, result_summary)

def log_processing_performance(file_type: str, file_size: int, 
                             processing_time: float, text_blocks: int,
                             ocr_used: bool = False):
    """记录处理性能"""
    global _doc_logger
    if _doc_logger:
        _doc_logger.log_processing_stats(file_type, file_size, processing_time, text_blocks, ocr_used)