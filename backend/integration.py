"""
Backend文档预处理模块集成到现有API
"""

import sys
import os
from pathlib import Path

# 添加backend模块到Python路径
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

try:
    from backend.api import DocumentProcessingAPI
    from backend.processors.document_processor import DocumentProcessor
    
    def integrate_document_processing(app, enable_ocr: bool = True):
        """
        将文档预处理功能集成到现有的FastAPI应用
        
        Args:
            app: FastAPI应用实例
            enable_ocr: 是否启用OCR功能
        """
        # 初始化文档预处理API
        doc_api = DocumentProcessingAPI(app, enable_ocr=enable_ocr)
        
        print(f"✅ 文档预处理功能已集成到API")
        print(f"📋 新增API端点:")
        print(f"   - POST /api/v2/upload-document (单文档处理)")
        print(f"   - POST /api/v2/upload-and-analyze (批量处理+查重)")
        print(f"   - GET  /api/v2/supported-formats (支持格式)")
        print(f"   - GET  /api/v2/processor-status (处理器状态)")
        print(f"🔧 OCR功能: {'已启用' if enable_ocr else '已禁用'}")
        
        return doc_api
        
except ImportError as e:
    print(f"❌ Backend模块导入失败: {e}")
    print("请确保安装了必要的依赖包:")
    print("pip install pdfplumber PyPDF2 python-docx paddleocr paddlepaddle Pillow")
    
    def integrate_document_processing(app, enable_ocr: bool = True):
        """备用函数"""
        print("⚠️ 文档预处理功能未启用，请安装依赖包")
        return None