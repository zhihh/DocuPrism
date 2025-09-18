"""
文档预处理API
为现有的查重API添加文档处理功能
"""

import os
import uuid
import time
import logging
import tempfile
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import JSONResponse

from .processors.document_processor import DocumentProcessor
from .models.document_models import DocumentParseResult, TextBlock
from .utils.logger import get_document_logger, log_api_access, log_api_result, log_processing_performance

# 导入统一日志系统
try:
    from src.utils.unified_logger import UnifiedLogger
    unified_logger = UnifiedLogger.get_logger('document_api')
except ImportError:
    # 如果统一日志系统不可用，使用原有的logger
    unified_logger = get_document_logger('api')

logger = unified_logger


class DocumentProcessingAPI:
    """文档预处理API类"""
    
    def __init__(self, app: FastAPI, enable_ocr: bool = True):
        """
        初始化API
        
        Args:
            app: FastAPI应用实例
            enable_ocr: 是否启用OCR
        """
        self.app = app
        self.processor = DocumentProcessor(enable_ocr=enable_ocr)
        
        # 注册API路由
        self._register_routes()
        
        logger.info(f"文档预处理API已初始化，OCR功能: {'已启用' if self.processor.is_ocr_enabled() else '已禁用'}")
    
    def _register_routes(self):
        """注册API路由"""
        
        @self.app.post("/api/v2/upload-document")
        async def upload_and_process_document(
            request: Request,
            file: UploadFile = File(...),
            document_id: Optional[str] = Form(None)
        ):
            """
            上传并处理单个文档
            
            Returns:
                DocumentParseResult: 文档解析结果
            """
            start_time = time.time()
            client_ip = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            
            try:
                # 记录API请求
                files_info = [{"name": file.filename, "size": file.size, "type": file.content_type}]
                log_api_access("/api/v2/upload-document", "POST", files_info, client_ip, user_agent)
                
                logger.info(f"📄 开始处理单个文档: {file.filename} (大小: {file.size} 字节)")
                
                # 验证文件类型
                if not file.filename:
                    raise HTTPException(status_code=400, detail="文件名不能为空")
                
                file_extension = Path(file.filename).suffix.lower()
                supported_formats = self.processor.get_supported_formats()
                
                if file_extension not in supported_formats:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"不支持的文件格式: {file_extension}。支持的格式: {list(supported_formats.keys())}"
                    )
                
                # 生成文档ID
                if not document_id:
                    document_id = str(uuid.uuid4())
                
                logger.info(f"🔍 开始处理文档: {file.filename}, ID: {document_id}")
                
                # 保存临时文件
                with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as tmp_file:
                    content = await file.read()
                    tmp_file.write(content)
                    tmp_path = tmp_file.name
                
                logger.debug(f"📁 临时文件保存至: {tmp_path}")
                
                try:
                    # 处理文档
                    if file_extension in ['.png', '.jpg', '.jpeg']:
                        # 图片文件使用OCR
                        if not self.processor.is_ocr_enabled():
                            raise HTTPException(status_code=400, detail="OCR功能未启用，无法处理图片文件")
                        logger.info(f"🖼️ 使用OCR处理图片: {file.filename}")
                        result = self.processor.process_image_with_ocr(tmp_path, document_id)
                    else:
                        # 文档文件
                        logger.info(f"📋 处理文档文件: {file.filename}")
                        result = self.processor.process_file(tmp_path, document_id)
                    
                    processing_time = time.time() - start_time
                    
                    # 记录处理性能
                    log_processing_performance(
                        file_type=file_extension,
                        file_size=file.size or 0,
                        processing_time=processing_time,
                        text_blocks=len(result.all_text_blocks),
                        ocr_used=file_extension in ['.png', '.jpg', '.jpeg']
                    )
                    
                    # 转换为可序列化的格式
                    response_data = self._serialize_parse_result(result)
                    
                    logger.info(f"✅ 文档处理完成: {file.filename}, 耗时: {processing_time:.2f}秒, 文本块: {len(result.all_text_blocks)}个")
                    
                    # 记录API结果
                    result_summary = {
                        "document_id": document_id,
                        "file_name": file.filename,
                        "text_blocks": len(result.all_text_blocks),
                        "total_text_length": result.total_text_length,
                        "processing_time": processing_time
                    }
                    log_api_result("/api/v2/upload-document", "POST", 200, processing_time, result_summary)
                    
                    return JSONResponse(content={
                        "success": True,
                        "message": "文档处理成功",
                        "data": response_data
                    })
                    
                finally:
                    # 清理临时文件
                    Path(tmp_path).unlink(missing_ok=True)
                    logger.debug(f"🗑️ 清理临时文件: {tmp_path}")
                    
            except HTTPException:
                processing_time = time.time() - start_time
                log_api_result("/api/v2/upload-document", "POST", 400, processing_time, {"error": "HTTP异常"})
                raise
            except Exception as e:
                processing_time = time.time() - start_time
                logger.error(f"❌ 文档处理失败: {file.filename if file and file.filename else 'unknown'}, 错误: {e}")
                log_api_result("/api/v2/upload-document", "POST", 500, processing_time, {"error": str(e)})
                raise HTTPException(status_code=500, detail=f"文档处理失败: {str(e)}")
        
        @self.app.post("/api/v2/upload-and-analyze")
        async def upload_and_analyze_documents(
            request: Request,
            files: List[UploadFile] = File(...),
            threshold: float = Form(0.7),
            method: str = Form("semantic")
        ):
            """
            上传多个文档并直接进行查重分析
            
            Returns:
                查重分析结果
            """
            start_time = time.time()
            client_ip = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            
            try:
                # 记录API请求
                files_info = [{"name": f.filename, "size": f.size, "type": f.content_type} for f in files]
                log_api_access("/api/v2/upload-and-analyze", "POST", files_info, client_ip, user_agent)
                
                if len(files) < 2:
                    raise HTTPException(status_code=400, detail="至少需要上传2个文档进行比对")
                
                logger.info(f"🚀 开始批量处理 {len(files)} 个文档进行查重分析")
                logger.info(f"📊 分析参数: threshold={threshold}, method={method}")
                
                # 处理所有文档
                processed_documents = []
                temp_files = []
                
                try:
                    for i, file in enumerate(files):
                        if not file.filename:
                            logger.warning(f"⚠️ 跳过无名文件 (索引 {i})")
                            continue
                        
                        file_extension = Path(file.filename).suffix.lower()
                        supported_formats = self.processor.get_supported_formats()
                        
                        if file_extension not in supported_formats:
                            logger.warning(f"⚠️ 跳过不支持的文件格式: {file.filename} ({file_extension})")
                            continue
                        
                        logger.info(f"📄 处理文件 {i+1}/{len(files)}: {file.filename} ({file_extension})")
                        
                        # 保存临时文件
                        with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as tmp_file:
                            content = await file.read()
                            tmp_file.write(content)
                            tmp_path = tmp_file.name
                            temp_files.append(tmp_path)
                        
                        # 处理文档
                        document_id = f"doc_{i+1}"
                        
                        if file_extension in ['.png', '.jpg', '.jpeg']:
                            if self.processor.is_ocr_enabled():
                                logger.info(f"🖼️ 使用OCR处理图片: {file.filename}")
                                result = self.processor.process_image_with_ocr(tmp_path, document_id)
                            else:
                                logger.warning(f"⚠️ OCR未启用，跳过图片文件: {file.filename}")
                                continue
                        else:
                            logger.info(f"📋 处理文档: {file.filename}")
                            result = self.processor.process_file(tmp_path, document_id)
                        
                        # 记录处理性能
                        file_processing_time = time.time() - start_time
                        log_processing_performance(
                            file_type=file_extension,
                            file_size=file.size or 0,
                            processing_time=file_processing_time,
                            text_blocks=len(result.all_text_blocks),
                            ocr_used=file_extension in ['.png', '.jpg', '.jpeg']
                        )
                        
                        logger.info(f"✅ 文件处理完成: {file.filename}, 文本块: {len(result.all_text_blocks)}个")
                        
                        # 转换为查重API需要的格式
                        for block in result.all_text_blocks:
                            processed_documents.append({
                                "documentId": int(document_id.split('_')[1]),
                                "page": block.page_number,
                                "content": block.text
                            })
                    
                    if len(processed_documents) < 2:
                        raise HTTPException(status_code=400, detail="成功处理的文档少于2个，无法进行比对")
                    
                    logger.info(f"📈 开始查重分析，共 {len(processed_documents)} 个文档块")
                    
                    # 临时设置原有API的日志级别
                    original_service_logger = logging.getLogger('src.api.service')
                    original_level = original_service_logger.level
                    original_service_logger.setLevel(logging.INFO)
                    
                    # 为原有API添加控制台处理器
                    console_handler = logging.StreamHandler()
                    console_handler.setLevel(logging.INFO)
                    formatter = logging.Formatter('%(asctime)s | %(name)s | %(levelname)s | %(message)s', datefmt='%H:%M:%S')
                    console_handler.setFormatter(formatter)
                    original_service_logger.addHandler(console_handler)
                    
                    try:
                        # 调用现有的查重服务
                        from src.api.service import DocumentDeduplicationService
                        dedup_service = DocumentDeduplicationService()
                        
                        logger.info(f"🔍 调用原有查重服务进行分析...")
                        duplicate_results = await dedup_service.analyze_documents(processed_documents)
                        logger.info(f"📊 原有查重服务返回 {len(duplicate_results)} 个结果")
                        
                    finally:
                        # 恢复原始日志设置
                        original_service_logger.removeHandler(console_handler)
                        original_service_logger.setLevel(original_level)
                    
                    processing_time = time.time() - start_time
                    
                    # 格式化结果
                    formatted_results = []
                    for result in duplicate_results:
                        formatted_results.append({
                            "doc1_id": result.documentId1,
                            "doc2_id": result.documentId2,
                            "page1": result.page1,
                            "page2": result.page2,
                            "content1": result.content1,
                            "content2": result.content2,
                            "similarity": result.score,
                            "reason": result.reason,
                            "category": result.category
                        })
                    
                    logger.info(f"🎯 查重分析完成! 发现 {len(formatted_results)} 对重复内容，耗时: {processing_time:.2f}秒")
                    
                    # 记录API结果
                    result_summary = {
                        "files_processed": len([f for f in files if f.filename]),
                        "document_blocks": len(processed_documents),
                        "duplicates_found": len(formatted_results),
                        "processing_time": processing_time,
                        "threshold": threshold,
                        "method": method
                    }
                    log_api_result("/api/v2/upload-and-analyze", "POST", 200, processing_time, result_summary)
                    
                    return JSONResponse(content={
                        "success": True,
                        "message": f"分析完成，发现 {len(formatted_results)} 对重复内容",
                        "data": formatted_results,
                        "total_count": len(formatted_results),
                        "processed_documents": len(processed_documents),
                        "processing_time": processing_time,
                        "config": {
                            "threshold": threshold,
                            "method": method
                        }
                    })
                    
                finally:
                    # 清理所有临时文件
                    for tmp_path in temp_files:
                        Path(tmp_path).unlink(missing_ok=True)
                    logger.debug(f"🗑️ 清理了 {len(temp_files)} 个临时文件")
                    
            except HTTPException:
                processing_time = time.time() - start_time
                log_api_result("/api/v2/upload-and-analyze", "POST", 400, processing_time, {"error": "HTTP异常"})
                raise
            except Exception as e:
                processing_time = time.time() - start_time
                logger.error(f"❌ 批量文档处理失败，耗时: {processing_time:.2f}秒, 错误: {e}")
                log_api_result("/api/v2/upload-and-analyze", "POST", 500, processing_time, {"error": str(e)})
                raise HTTPException(status_code=500, detail=f"批量文档处理失败: {str(e)}")
        
        @self.app.get("/api/v2/supported-formats")
        async def get_supported_formats():
            """获取支持的文件格式"""
            formats = self.processor.get_supported_formats()
            
            return JSONResponse(content={
                "success": True,
                "data": {
                    "formats": formats,
                    "ocr_enabled": self.processor.is_ocr_enabled(),
                    "ocr_formats": [".png", ".jpg", ".jpeg"] if self.processor.is_ocr_enabled() else []
                }
            })
        
        @self.app.get("/api/v2/processor-status")
        async def get_processor_status():
            """获取文档处理器状态"""
            return JSONResponse(content={
                "success": True,
                "data": {
                    "ocr_enabled": self.processor.is_ocr_enabled(),
                    "supported_formats": self.processor.get_supported_formats(),
                    "version": "1.0.0"
                }
            })
    
    def _serialize_parse_result(self, result: DocumentParseResult) -> Dict[str, Any]:
        """将DocumentParseResult序列化为可JSON化的字典"""
        return {
            "document_id": result.document_id,
            "document_type": result.document_type.value,
            "total_pages": result.total_pages,
            "total_text_length": result.total_text_length,
            "processing_time": result.processing_time,
            "metadata": result.metadata,
            "pages": [
                {
                    "page_number": page.page_number,
                    "width": page.width,
                    "height": page.height,
                    "has_images": page.has_images,
                    "image_count": page.image_count,
                    "text_blocks_count": len(page.text_blocks)
                }
                for page in result.pages
            ],
            "text_blocks": [
                {
                    "text": block.text,
                    "page_number": block.page_number,
                    "block_id": block.block_id,
                    "original_position": block.original_position,
                    "char_start": block.char_start,
                    "char_end": block.char_end,
                    "confidence": block.confidence,
                    "block_type": block.block_type,
                    "is_ocr": block.is_ocr
                }
                for block in result.all_text_blocks
            ]
        }