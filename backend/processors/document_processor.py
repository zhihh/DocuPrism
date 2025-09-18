"""
文档预处理服务
统一的文档解析入口
"""

import uuid
import time
from typing import Union, Optional, Dict, Any
from pathlib import Path

from .pdf_parser import PDFParser
from .docx_parser import DOCXParser
from ..services.ocr_service import OCRService
from ..models.document_models import DocumentParseResult, DocumentType, TextBlock
from ..utils.logger import get_document_logger


logger = get_document_logger('processor')


class DocumentProcessor:
    """文档预处理器主类"""
    
    def __init__(self, enable_ocr: bool = True, ocr_lang: str = 'ch'):
        """
        初始化文档处理器
        
        Args:
            enable_ocr: 是否启用OCR功能
            ocr_lang: OCR语言设置
        """
        self.pdf_parser = PDFParser()
        self.docx_parser = DOCXParser()
        
        # 初始化OCR服务
        self.ocr_service = None
        if enable_ocr:
            try:
                self.ocr_service = OCRService(lang=ocr_lang)
                self.pdf_parser.set_ocr_service(self.ocr_service)
                logger.info("OCR服务已启用")
            except Exception as e:
                logger.warning(f"OCR服务初始化失败，将禁用OCR功能: {e}")
    
    def process_file(self, file_path: str, document_id: Optional[str] = None) -> DocumentParseResult:
        """
        处理文档文件
        
        Args:
            file_path: 文件路径
            document_id: 文档ID
            
        Returns:
            DocumentParseResult: 解析结果
        """
        if document_id is None:
            document_id = str(uuid.uuid4())
            
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            raise FileNotFoundError(f"文件不存在: {file_path}")
        
        file_extension = file_path_obj.suffix.lower()
        file_size = file_path_obj.stat().st_size
        
        logger.info(f"🔍 开始处理文件: {file_path_obj.name} ({file_extension}, {file_size} 字节)")
        start_time = time.time()
        
        try:
            if file_extension == '.pdf':
                logger.debug("📄 使用PDF解析器")
                result = self.pdf_parser.parse(file_path, document_id)
            elif file_extension == '.docx':
                logger.debug("📝 使用DOCX解析器")
                result = self.docx_parser.parse(file_path, document_id)
            elif file_extension in ['.txt', '.md']:
                logger.debug("📃 使用文本解析器")
                result = self._parse_text_file(file_path, document_id)
            elif file_extension == '.json':
                logger.debug("📋 使用JSON解析器")
                result = self._parse_json_file(file_path, document_id)
            else:
                supported = list(self.get_supported_formats().keys())
                raise ValueError(f"不支持的文件格式: {file_extension}. 支持的格式: {supported}")
            
            processing_time = time.time() - start_time
            logger.info(f"✅ 文件处理完成: {file_path_obj.name}, 耗时: {processing_time:.2f}秒, "
                       f"页数: {result.total_pages}, 文本块: {len(result.all_text_blocks)}个, "
                       f"文本长度: {result.total_text_length}字符")
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"❌ 文件处理失败: {file_path_obj.name}, 耗时: {processing_time:.2f}秒, 错误: {e}")
            raise
    
    def _parse_text_file(self, file_path: str, document_id: str) -> DocumentParseResult:
        """解析纯文本文件"""
        import time
        start_time = time.time()
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 按段落分割
        paragraphs = content.split('\n\n')
        
        text_blocks = []
        char_offset = 0
        
        for i, paragraph in enumerate(paragraphs):
            if paragraph.strip():
                block_id = f"{document_id}_para{i}"
                
                block = TextBlock(
                    text=paragraph.strip(),
                    page_number=1,
                    block_id=block_id,
                    char_start=char_offset,
                    char_end=char_offset + len(paragraph),
                    confidence=1.0,
                    is_ocr=False
                )
                
                text_blocks.append(block)
                char_offset += len(paragraph)
        
        from ..models.document_models import PageInfo
        
        page_info = PageInfo(
            page_number=1,
            width=595,
            height=842,
            text_blocks=text_blocks
        )
        
        processing_time = time.time() - start_time
        
        return DocumentParseResult(
            document_id=document_id,
            document_type=DocumentType.TXT,
            total_pages=1,
            total_text_length=len(content),
            pages=[page_info],
            all_text_blocks=text_blocks,
            metadata={
                "file_path": file_path,
                "file_size": Path(file_path).stat().st_size,
                "parser": "text"
            },
            processing_time=processing_time
        )
    
    def _parse_json_file(self, file_path: str, document_id: str) -> DocumentParseResult:
        """解析JSON文件"""
        import json
        import time
        start_time = time.time()
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 将JSON内容转换为文本
        content = json.dumps(data, ensure_ascii=False, indent=2)
        
        # 创建单个文本块
        block = TextBlock(
            text=content,
            page_number=1,
            block_id=f"{document_id}_json",
            char_start=0,
            char_end=len(content),
            confidence=1.0,
            is_ocr=False
        )
        
        from ..models.document_models import PageInfo
        
        page_info = PageInfo(
            page_number=1,
            width=595,
            height=842,
            text_blocks=[block]
        )
        
        processing_time = time.time() - start_time
        
        return DocumentParseResult(
            document_id=document_id,
            document_type=DocumentType.JSON,
            total_pages=1,
            total_text_length=len(content),
            pages=[page_info],
            all_text_blocks=[block],
            metadata={
                "file_path": file_path,
                "file_size": Path(file_path).stat().st_size,
                "parser": "json"
            },
            processing_time=processing_time
        )
    
    def process_image_with_ocr(self, image_path: Union[str, Path], document_id: Optional[str] = None) -> DocumentParseResult:
        """
        使用OCR处理图片文件
        
        Args:
            image_path: 图片文件路径
            document_id: 文档ID
            
        Returns:
            DocumentParseResult: 解析结果
        """
        if not self.ocr_service:
            raise RuntimeError("OCR服务未启用")
        
        if document_id is None:
            document_id = str(uuid.uuid4())
        
        image_path = Path(image_path)
        logger.info(f"开始OCR识别图片: {image_path}")
        
        import time
        start_time = time.time()
        
        # 执行OCR识别
        ocr_results = self.ocr_service.recognize_image(image_path)
        
        # 转换为TextBlock
        text_blocks = []
        total_text = ""
        
        for i, ocr_result in enumerate(ocr_results):
            block = TextBlock(
                text=ocr_result.text,
                page_number=1,
                block_id=f"{document_id}_ocr{i}",
                original_position=ocr_result.bbox,
                char_start=len(total_text),
                char_end=len(total_text) + len(ocr_result.text),
                confidence=ocr_result.confidence,
                is_ocr=True
            )
            
            text_blocks.append(block)
            total_text += ocr_result.text + "\n"
        
        from ..models.document_models import PageInfo
        
        page_info = PageInfo(
            page_number=1,
            width=800,  # 默认图片宽度
            height=600, # 默认图片高度
            text_blocks=text_blocks,
            has_images=True,
            image_count=1
        )
        
        processing_time = time.time() - start_time
        
        return DocumentParseResult(
            document_id=document_id,
            document_type=DocumentType.PDF,  # 图片当作PDF处理
            total_pages=1,
            total_text_length=len(total_text),
            pages=[page_info],
            all_text_blocks=text_blocks,
            metadata={
                "file_path": str(image_path),
                "file_size": image_path.stat().st_size,
                "parser": "ocr",
                "ocr_blocks": len(ocr_results)
            },
            processing_time=processing_time
        )
    
    @staticmethod
    def get_supported_formats() -> Dict[str, str]:
        """获取支持的文件格式"""
        return {
            '.pdf': 'PDF文档',
            '.docx': 'Word文档',
            '.txt': '纯文本文件',
            '.md': 'Markdown文件',
            '.json': 'JSON文件',
            '.png': '图片文件（需OCR）',
            '.jpg': '图片文件（需OCR）',
            '.jpeg': '图片文件（需OCR）'
        }
    
    def is_ocr_enabled(self) -> bool:
        """检查OCR是否启用"""
        return self.ocr_service is not None and self.ocr_service.is_available()