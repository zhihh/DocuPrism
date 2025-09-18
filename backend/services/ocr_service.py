"""
OCR识别服务
基于PaddleOCR的文字识别
"""

import logging
from typing import List, Optional, Union
from pathlib import Path
import tempfile

try:
    from paddleocr import PaddleOCR
    HAS_PADDLEOCR = True
except ImportError:
    HAS_PADDLEOCR = False
    logging.warning("PaddleOCR not installed, OCR功能将不可用")

from ..models.document_models import OCRResult


logger = logging.getLogger(__name__)


class OCRService:
    """OCR识别服务"""
    
    def __init__(self, use_angle_cls=True, lang='ch', use_gpu=None):
        """
        初始化OCR服务
        
        Args:
            use_angle_cls: 是否使用角度分类器
            lang: 语言设置，'ch'为中英文，'en'为英文
            use_gpu: 是否使用GPU，None为自动检测
        """
        if not HAS_PADDLEOCR:
            raise ImportError("需要安装 PaddleOCR: pip install paddleocr")
        
        logger.info("初始化PaddleOCR...")
        
        try:
            # PaddleOCR 2.8.1 初始化参数
            ocr_kwargs = {
                'use_angle_cls': use_angle_cls,
                'lang': lang,
                'show_log': False  # 2.8.1版本支持此参数
            }
            
            # 设备配置 - PaddleOCR 2.8.1 使用 use_gpu 参数
            if use_gpu is True:
                ocr_kwargs['use_gpu'] = True
            elif use_gpu is False:
                ocr_kwargs['use_gpu'] = False
            # use_gpu=None 时让PaddleOCR自动选择设备
            
            self.ocr = PaddleOCR(**ocr_kwargs)
            logger.info("PaddleOCR初始化成功")
        except Exception as e:
            logger.error(f"PaddleOCR初始化失败: {e}")
            raise
    
    def recognize_image(self, image_path: Union[str, Path]) -> List[OCRResult]:
        """
        识别图片中的文字
        
        Args:
            image_path: 图片文件路径
            
        Returns:
            List[OCRResult]: OCR识别结果列表
        """
        if not HAS_PADDLEOCR:
            raise RuntimeError("PaddleOCR未安装")
        
        logger.debug(f"开始OCR识别: {image_path}")
        
        try:
            # 执行OCR识别
            results = self.ocr.ocr(str(image_path), cls=True)
            
            if not results or not results[0]:
                logger.warning(f"图片 {image_path} 未识别到文字")
                return []
            
            ocr_results = []
            
            for line in results[0]:
                if len(line) >= 2:
                    bbox = line[0]  # 边界框坐标
                    text_info = line[1]  # (文本, 置信度)
                    
                    if len(text_info) >= 2:
                        text = text_info[0]
                        confidence = text_info[1]
                        
                        # 转换边界框格式 [[x1,y1], [x2,y2], [x3,y3], [x4,y4]] -> (x1, y1, x2, y2)
                        if len(bbox) >= 4:
                            x_coords = [point[0] for point in bbox]
                            y_coords = [point[1] for point in bbox]
                            
                            x1, y1 = min(x_coords), min(y_coords)
                            x2, y2 = max(x_coords), max(y_coords)
                            
                            ocr_result = OCRResult(
                                text=text,
                                confidence=confidence,
                                bbox=(x1, y1, x2, y2),
                                page_number=1  # 图片默认为第1页
                            )
                            
                            ocr_results.append(ocr_result)
            
            logger.info(f"OCR识别完成，识别到 {len(ocr_results)} 段文字")
            return ocr_results
            
        except Exception as e:
            logger.error(f"OCR识别失败: {e}")
            return []
    
    def recognize_pdf_page(self, pdf_page, page_number: int) -> List[OCRResult]:
        """
        识别PDF页面中的文字（针对扫描版PDF）
        
        Args:
            pdf_page: PDF页面对象（来自pdfplumber）
            page_number: 页码
            
        Returns:
            List[OCRResult]: OCR识别结果列表
        """
        try:
            # 将PDF页面转换为图片
            img = pdf_page.to_image(resolution=150)
            img_pil = img.original
            
            # 保存为临时文件
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                img_pil.save(tmp_file.name, 'PNG')
                tmp_path = tmp_file.name
            
            # 执行OCR识别
            ocr_results = self.recognize_image(tmp_path)
            
            # 更新页码信息
            for result in ocr_results:
                result.page_number = page_number
            
            # 清理临时文件
            Path(tmp_path).unlink()
            
            return ocr_results
            
        except Exception as e:
            logger.error(f"PDF页面OCR识别失败: {e}")
            return []
    
    def is_available(self) -> bool:
        """检查OCR服务是否可用"""
        return HAS_PADDLEOCR and hasattr(self, 'ocr')
    
    @staticmethod
    def get_supported_formats() -> List[str]:
        """获取支持的图片格式"""
        return ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif']