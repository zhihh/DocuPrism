"""
统一日志配置管理
将所有日志输出统一到 logs 目录
支持单进程和多进程环境
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
import json
from typing import Optional, Dict, Any


class UnifiedLogger:
    """统一日志管理器 - 支持多进程"""
    
    _initialized = False
    
    @classmethod
    def setup_logging(cls):
        """设置统一日志配置"""
        if cls._initialized:
            return
        
        # 确保 logs 目录存在
        logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
        os.makedirs(logs_dir, exist_ok=True)
        
        # 获取进程信息用于多进程环境
        process_id = os.getpid()
        workers = int(os.environ.get("WORKERS", 1))
        
        # 完全重置所有日志配置
        root_logger = logging.getLogger()
        root_logger.handlers = []  # 清除所有现有处理器
        
        # 强制设置根日志级别为DEBUG，确保所有级别的日志都能通过
        root_logger.setLevel(logging.DEBUG)
        
        # 禁用uvicorn和fastapi的默认日志处理器并强制设置级别
        for logger_name in ["uvicorn", "uvicorn.access", "fastapi", "uvicorn.error"]:
            logger_obj = logging.getLogger(logger_name)
            logger_obj.handlers = []
            logger_obj.setLevel(logging.DEBUG)
            logger_obj.propagate = True  # 确保日志传播到根日志器
        
        # 定义日志格式（多进程环境包含PID）
        if workers > 1:
            log_format = f'%(asctime)s - PID-{process_id} - %(name)s - %(levelname)s - %(message)s'
            main_log_file = f"main_worker_{process_id}.log"
            error_log_file = f"error_worker_{process_id}.log"
        else:
            log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            main_log_file = "main.log"
            error_log_file = "error.log"
            
        formatter = logging.Formatter(
            log_format,
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # 控制台处理器 - 显示所有日志级别
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG)  # 显示所有级别
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
        
        # 主日志文件 - 记录所有 DEBUG 及以上级别的日志
        main_handler = RotatingFileHandler(
            os.path.join(logs_dir, main_log_file),
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        main_handler.setLevel(logging.DEBUG)  # 记录所有级别
        main_handler.setFormatter(formatter)
        root_logger.addHandler(main_handler)
        
        # 错误日志文件 - 仅 ERROR 及以上级别
        error_handler = RotatingFileHandler(
            os.path.join(logs_dir, error_log_file),
            maxBytes=10*1024*1024,
            backupCount=5,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        root_logger.addHandler(error_handler)
        
        # API 访问日志
        cls._setup_api_logger(logs_dir, formatter, process_id, workers)
        
        # 文档处理日志
        cls._setup_document_logger(logs_dir, formatter, process_id, workers)
        
        # 强制设置所有应用模块的日志级别
        for module_name in ["src.api.app", "src.api.service", "src.core.document_processor", 
                           "src.validators.validation_manager", "src.detectors.llm_duplicate_detector"]:
            module_logger = logging.getLogger(module_name)
            module_logger.setLevel(logging.DEBUG)
            module_logger.propagate = True
        
        cls._initialized = True
        
        if workers > 1:
            root_logger.info(f"🎯 多进程日志系统初始化完成 - 进程ID: {process_id}, 总进程数: {workers}")
        else:
            root_logger.info(f"🎯 单进程日志系统初始化完成 - 进程ID: {process_id}")
            
        root_logger.info(f"📁 日志文件: {main_log_file}")
        root_logger.warning("⚠️ 日志系统测试 - WARNING级别")
        root_logger.error("❌ 日志系统测试 - ERROR级别")
    
    @classmethod
    def _setup_api_logger(cls, logs_dir, formatter, process_id=None, workers=1):
        """设置API访问日志"""
        api_logger = logging.getLogger("api")
        api_logger.setLevel(logging.INFO)
        
        # 多进程环境使用进程特定的日志文件
        if workers > 1:
            log_file = f"api_access_worker_{process_id}.log"
        else:
            log_file = "api_access.log"
        
        api_handler = RotatingFileHandler(
            os.path.join(logs_dir, log_file),
            maxBytes=10*1024*1024,
            backupCount=5,
            encoding='utf-8'
        )
        api_handler.setLevel(logging.INFO)
        api_handler.setFormatter(formatter)
        api_logger.addHandler(api_handler)
    
    @classmethod
    def _setup_document_logger(cls, logs_dir, formatter, process_id=None, workers=1):
        """设置文档处理日志"""
        doc_logger = logging.getLogger("document")
        doc_logger.setLevel(logging.INFO)
        
        # 多进程环境使用进程特定的日志文件
        if workers > 1:
            log_file = f"document_processing_worker_{process_id}.log"
        else:
            log_file = "document_processing.log"
        
        # 文档处理详细日志
        doc_handler = RotatingFileHandler(
            os.path.join(logs_dir, log_file),
            maxBytes=10*1024*1024,
            backupCount=5,
            encoding='utf-8'
        )
        doc_handler.setLevel(logging.INFO)
        doc_handler.setFormatter(formatter)
        doc_logger.addHandler(doc_handler)
    
    @classmethod
    def get_logger(cls, name: Optional[str] = None):
        """获取日志记录器"""
        if not cls._initialized:
            cls.setup_logging()
        
        if name:
            return logging.getLogger(name)
        return logging.getLogger()
    
    @classmethod
    def log_api_access(cls, method: str, path: str, status_code: int, 
                       processing_time: Optional[float] = None, 
                       user_agent: Optional[str] = None):
        """记录API访问日志"""
        api_logger = cls.get_logger("api")
        
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "method": method,
            "path": path,
            "status_code": status_code,
            "processing_time": processing_time,
            "user_agent": user_agent
        }
        
        api_logger.info(f"API访问: {json.dumps(log_data, ensure_ascii=False)}")
    
    @classmethod
    def log_document_processing(cls, operation: str, file_name: Optional[str] = None, 
                               processing_time: Optional[float] = None, 
                               status: str = "success", 
                               details: Optional[Dict[str, Any]] = None):
        """记录文档处理日志"""
        doc_logger = cls.get_logger("document")
        
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "operation": operation,
            "file_name": file_name,
            "processing_time": processing_time,
            "status": status,
            "details": details or {}
        }
        
        doc_logger.info(f"文档处理: {json.dumps(log_data, ensure_ascii=False)}")


# 在模块导入时自动初始化
UnifiedLogger.setup_logging()