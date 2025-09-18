"""
PDF文档解析器
支持文本PDF和扫描版PDF（通过OCR）
"""

import uuid
import logging
from typing import List, Optional, Dict, Any
from pathlib import Path

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    logging.warning("pdfplumber not installed, PDF text extraction disabled")

try:
    from PyPDF2 import PdfReader
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False
    logging.warning("PyPDF2 not installed, fallback PDF reader disabled")

from ..models.document_models import DocumentParseResult, PageInfo, TextBlock, DocumentType


logger = logging.getLogger(__name__)


class PDFParser:
    """PDF文档解析器"""
    
    def __init__(self):
        self.ocr_service = None  # 稍后注入OCR服务
    
    def set_ocr_service(self, ocr_service):
        """设置OCR服务"""
        self.ocr_service = ocr_service
    
    def parse(self, file_path: str, document_id: str = None) -> DocumentParseResult:
        """
        解析PDF文档
        
        Args:
            file_path: PDF文件路径
            document_id: 文档ID，如果为None则自动生成
            
        Returns:
            DocumentParseResult: 解析结果
        """
        if document_id is None:
            document_id = str(uuid.uuid4())
            
        logger.info(f"开始解析PDF文档: {file_path}")
        
        # 优先使用pdfplumber
        if HAS_PDFPLUMBER:
            return self._parse_with_pdfplumber(file_path, document_id)
        elif HAS_PYPDF2:
            return self._parse_with_pypdf2(file_path, document_id)
        else:
            raise ImportError("需要安装 pdfplumber 或 PyPDF2 来解析PDF文档")
    
    def _parse_with_pdfplumber(self, file_path: str, document_id: str) -> DocumentParseResult:
        """使用pdfplumber解析PDF"""
        import time
        start_time = time.time()
        
        pages_info = []
        all_text_blocks = []
        total_text_length = 0
        
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                logger.debug(f"解析第 {page_num} 页")
                
                # 提取文本
                text = page.extract_text()
                
                if text and text.strip():
                    # 有文本内容，按段落分块
                    text_blocks = self._split_text_into_blocks(
                        text, page_num, document_id, page.width, page.height
                    )
                else:
                    # 没有文本，可能是扫描版，需要OCR
                    logger.info(f"第 {page_num} 页未检测到文本，准备OCR识别")
                    text_blocks = self._ocr_page_if_needed(
                        page, page_num, document_id
                    )
                
                # 创建页面信息
                page_info = PageInfo(
                    page_number=page_num,
                    width=page.width,
                    height=page.height,
                    text_blocks=text_blocks,
                    has_images=bool(page.images),
                    image_count=len(page.images) if page.images else 0
                )
                
                pages_info.append(page_info)
                all_text_blocks.extend(text_blocks)
                total_text_length += sum(len(block.text) for block in text_blocks)
        
        processing_time = time.time() - start_time
        
        result = DocumentParseResult(
            document_id=document_id,
            document_type=DocumentType.PDF,
            total_pages=len(pages_info),
            total_text_length=total_text_length,
            pages=pages_info,
            all_text_blocks=all_text_blocks,
            metadata={
                "file_path": file_path,
                "file_size": Path(file_path).stat().st_size,
                "parser": "pdfplumber"
            },
            processing_time=processing_time
        )
        
        logger.info(f"PDF解析完成，共 {len(pages_info)} 页，{total_text_length} 字符，耗时 {processing_time:.2f}秒")
        return result
    
    def _parse_with_pypdf2(self, file_path: str, document_id: str) -> DocumentParseResult:
        """使用PyPDF2解析PDF（备用方案）"""
        import time
        start_time = time.time()
        
        pages_info = []
        all_text_blocks = []
        total_text_length = 0
        
        with open(file_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                
                if text and text.strip():
                    text_blocks = self._split_text_into_blocks(
                        text, page_num, document_id, 595, 842  # A4默认尺寸
                    )
                else:
                    # PyPDF2无法提供图像信息，跳过OCR
                    text_blocks = []
                
                page_info = PageInfo(
                    page_number=page_num,
                    width=595,  # A4默认宽度
                    height=842, # A4默认高度
                    text_blocks=text_blocks
                )
                
                pages_info.append(page_info)
                all_text_blocks.extend(text_blocks)
                total_text_length += sum(len(block.text) for block in text_blocks)
        
        processing_time = time.time() - start_time
        
        result = DocumentParseResult(
            document_id=document_id,
            document_type=DocumentType.PDF,
            total_pages=len(pages_info),
            total_text_length=total_text_length,
            pages=pages_info,
            all_text_blocks=all_text_blocks,
            metadata={
                "file_path": file_path,
                "file_size": Path(file_path).stat().st_size,
                "parser": "PyPDF2"
            },
            processing_time=processing_time
        )
        
        logger.info(f"PDF解析完成（PyPDF2），共 {len(pages_info)} 页，{total_text_length} 字符")
        return result
    
    def _split_text_into_blocks(self, text: str, page_num: int, document_id: str, 
                               page_width: float, page_height: float) -> List[TextBlock]:
        """将文本分割成文本块"""
        blocks = []
        paragraphs = text.split('\n\n')  # 按双换行分割段落
        
        char_offset = 0
        for i, paragraph in enumerate(paragraphs):
            if paragraph.strip():
                block_id = f"{document_id}_page{page_num}_block{i}"
                
                # 简单的位置估算（实际应用中可以更精确）
                y_position = (i / len(paragraphs)) * page_height
                
                block = TextBlock(
                    text=paragraph.strip(),
                    page_number=page_num,
                    block_id=block_id,
                    original_position=(0, y_position, page_width, y_position + 20),
                    char_start=char_offset,
                    char_end=char_offset + len(paragraph),
                    confidence=1.0,  # 文本PDF的置信度为1.0
                    is_ocr=False
                )
                
                blocks.append(block)
                char_offset += len(paragraph)
        
        return blocks
    
    def _ocr_page_if_needed(self, page, page_num: int, document_id: str) -> List[TextBlock]:
        """对页面进行OCR识别（如果需要）"""
        if not self.ocr_service:
            logger.warning("OCR服务未配置，跳过OCR识别")
            return []
        
        try:
            # 将页面转换为图片
            import io
            from PIL import Image
            
            # pdfplumber提供的图片转换
            img = page.to_image(resolution=150)
            img_pil = img.original
            
            # 保存临时图片文件用于OCR
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                img_pil.save(tmp_file.name, 'PNG')
                tmp_path = tmp_file.name
            
            # 调用OCR服务
            ocr_results = self.ocr_service.recognize_image(tmp_path)
            
            # 清理临时文件
            Path(tmp_path).unlink()
            
            # 转换OCR结果为TextBlock
            blocks = []
            for i, ocr_result in enumerate(ocr_results):
                block_id = f"{document_id}_page{page_num}_ocr{i}"
                
                block = TextBlock(
                    text=ocr_result.text,
                    page_number=page_num,
                    block_id=block_id,
                    original_position=ocr_result.bbox,
                    confidence=ocr_result.confidence,
                    is_ocr=True
                )
                
                blocks.append(block)
            
            logger.info(f"第 {page_num} 页OCR识别完成，识别到 {len(blocks)} 个文本块")
            return blocks
            
        except Exception as e:
            logger.error(f"第 {page_num} 页OCR识别失败: {e}")
            return []