"""
DocuPrism AI - 基于AI语义理解的文档智能比对系统
AI-Powered Semantic Document Comparison Platform

主入口程序 - 高并发生产版本
使用模块化架构的新版本，支持多工作进程和异步处理
"""

import os
import multiprocessing

import uvicorn
from dotenv import load_dotenv

# 首先初始化统一日志系统
from src.utils.unified_logger import UnifiedLogger
UnifiedLogger.setup_logging()

from src.config.config import Config

# 检查 .env 文件是否存在
if os.path.exists(".env"):
    load_dotenv(".env")

# 初始化配置
config = Config()

from src.api.app import app

# 集成backend文档预处理模块
try:
    from backend.integration import integrate_document_processing
    # 集成文档预处理功能到FastAPI应用
    enable_ocr = os.environ.get("ENABLE_OCR", "true").lower() == "true"
    integrate_document_processing(app, enable_ocr=enable_ocr)
    print("✅ Backend文档预处理模块已集成")
except ImportError as e:
    print(f"⚠️ Backend文档预处理模块未启用: {e}")
    print("请安装相关依赖: pip install -r backend/requirements.txt")

if __name__ == "__main__":
    # 根据环境变量决定运行模式
    workers = int(os.environ.get("WORKERS", 1))
    env_mode = os.environ.get("ENV_MODE", "development").lower()
    
    # 多进程模式的日志配置
    if workers > 1:
        print(f"🚀 启动多进程模式: {workers} 个工作进程")
        print("📋 多进程日志策略:")
        print("  - 每个进程独立写入日志文件")
        print("  - 使用进程ID区分日志来源")
        print("  - 集中式日志聚合通过外部工具实现")
        
        # 生产环境多进程配置
        uvicorn.run(
            "main:app", 
            host="0.0.0.0", 
            port=8000, 
            workers=workers,
            log_level="info", 
            access_log=True,
            reload=False,  # 多进程模式禁用重载
            log_config=None,  # 使用应用自定义日志配置
            loop="uvloop",
            http="httptools"
        )
    else:
        print(f"🔧 启动单进程模式 (开发/调试)")
        print("📋 单进程日志策略:")
        print("  - 完整的实时日志输出")
        print("  - 详细的调试信息")
        print("  - 实时日志监控")
        
        # 开发环境单进程配置
        uvicorn.run(
            "main:app", 
            host="0.0.0.0", 
            port=8000, 
            workers=1,
            log_level="info", 
            access_log=True,
            reload=(env_mode == "development"),
            log_config=None,
            use_colors=True,
            loop="uvloop",
            http="httptools"
        )
