"""
Backend文档预处理模块初始化文件
"""

from .processors.document_processor import DocumentProcessor
from .processors.pdf_parser import PDFParser
from .processors.docx_parser import DOCXParser
from .services.ocr_service import OCRService
from .api import DocumentProcessingAPI
from .models.document_models import (
    DocumentParseResult,
    TextBlock,
    PageInfo,
    DocumentType,
    OCRResult,
    DocumentPosition
)

__all__ = [
    'DocumentProcessor',
    'PDFParser', 
    'DOCXParser',
    'OCRService',
    'DocumentProcessingAPI',
    'DocumentParseResult',
    'TextBlock',
    'PageInfo',
    'DocumentType',
    'OCRResult',
    'DocumentPosition'
]

__version__ = "1.0.0"