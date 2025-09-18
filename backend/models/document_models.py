"""
文档预处理数据模型
包含文本块、页面信息等数据结构
"""

from typing import List, Optional, Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum


class DocumentType(Enum):
    """支持的文档类型"""
    PDF = "pdf"
    DOCX = "docx" 
    TXT = "txt"
    MD = "md"
    JSON = "json"


@dataclass
class TextBlock:
    """文本块数据结构"""
    text: str                                    # 文本内容
    page_number: int                            # 页码（从1开始）
    block_id: str                               # 块ID
    original_position: Optional[Tuple[float, float, float, float]] = None  # 原始位置坐标 (x1, y1, x2, y2)
    char_start: int = 0                         # 在整个文档中的字符起始位置
    char_end: int = 0                           # 在整个文档中的字符结束位置
    confidence: float = 1.0                     # OCR置信度（1.0表示非OCR文本）
    block_type: str = "text"                    # 块类型：text, title, table等
    font_size: Optional[float] = None           # 字体大小
    is_ocr: bool = False                        # 是否来自OCR识别


@dataclass
class PageInfo:
    """页面信息"""
    page_number: int                            # 页码
    width: float                                # 页面宽度
    height: float                               # 页面高度
    text_blocks: List[TextBlock]                # 页面中的文本块
    has_images: bool = False                    # 是否包含图片
    image_count: int = 0                        # 图片数量


@dataclass
class DocumentParseResult:
    """文档解析结果"""
    document_id: str                            # 文档ID
    document_type: DocumentType                 # 文档类型
    total_pages: int                            # 总页数
    total_text_length: int                      # 总文本长度
    pages: List[PageInfo]                       # 页面信息列表
    all_text_blocks: List[TextBlock]            # 所有文本块（扁平化）
    metadata: Dict[str, Any]                    # 文档元数据
    processing_time: float                      # 处理耗时


@dataclass
class OCRResult:
    """OCR识别结果"""
    text: str                                   # 识别的文本
    confidence: float                           # 置信度
    bbox: Tuple[float, float, float, float]     # 边界框坐标
    page_number: int                            # 页码


@dataclass
class DocumentPosition:
    """文档位置信息，用于查重结果定位"""
    document_id: str                            # 文档ID
    page_number: int                            # 页码
    block_id: str                               # 文本块ID
    char_start: int                             # 字符起始位置
    char_end: int                               # 字符结束位置
    bbox: Optional[Tuple[float, float, float, float]] = None  # 位置坐标