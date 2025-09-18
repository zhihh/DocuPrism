"""
DocuPrism AI - 文档智能比对核心服务
AI-Powered Semantic Document Comparison Platform

整合所有功能模块，提供统一的服务接口，支持并发处理
"""

import time
import asyncio
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
from langchain.schema.runnable import RunnableLambda, RunnableParallel

from ..models.api_models import DuplicateOutput
from ..models.data_models import DocumentData
from ..core.document_processor import DocumentProcessor
from ..core.clustering_manager import ClusteringManager
from ..detectors.llm_duplicate_detector import LLMDuplicateDetector
from ..validators.validation_manager import ValidationManager
from ..config.config import Config
from ..utils.unified_logger import UnifiedLogger

logger = UnifiedLogger.get_logger(__name__)


class DocumentDeduplicationService:
    """文档智能比对服务 - 高并发版本"""
    
    def __init__(self):
        self.config = Config()
        self.processor = DocumentProcessor()
        
        # 使用配置初始化聚类管理器
        self.clustering_manager = ClusteringManager(
            top_k=self.config.top_k_candidates,
            similarity_threshold=self.config.similarity_threshold,
            use_reranker=self.config.use_reranker,
            max_candidates_for_rerank=self.config.max_rerank_candidates
        )
        
        self.detector = LLMDuplicateDetector()
        self.validator = ValidationManager()
        # 移除全局锁，支持并发处理
        self.max_workers = 4  # 可根据服务器配置调整
        
        logger.info(f"文档智能比对服务初始化完成，使用增强版聚类策略")
    
    async def analyze_documents(self, json_input: List[Dict]) -> List[DuplicateOutput]:
        """分析文档重复内容 - 高并发异步处理版本"""
        
        execution_id = int(time.time() * 1000)
        start_time = time.time()
        logger.info(f"🚀 开始执行工作流 (ID: {execution_id})")
        
        try:
            # 1. 处理输入数据
            logger.info(f"[{execution_id}] 📄 正在处理JSON输入，文档数量: {len(json_input)}")
            process_start = time.time()
            document_data_list, document_inputs = await self._run_in_executor(
                self.processor.process_json_documents, json_input
            )
            process_time = time.time() - process_start
            logger.info(f"[{execution_id}] ✅ JSON处理完成，耗时: {process_time:.2f}秒，生成{len(document_data_list)}个文档块")
            
            # 2. 并行执行两种策略
            logger.info(f"[{execution_id}] 🚀 开始并行执行分割聚类查重和直接查重...")
            strategy_start = time.time()
            
            # 使用asyncio创建并发任务
            logger.info(f"[{execution_id}] 🔧 创建聚类任务")
            cluster_task = asyncio.create_task(
                self._clustering_strategy(execution_id, document_inputs)
            )
            logger.info(f"[{execution_id}] 🔧 创建直接策略任务")
            direct_task = asyncio.create_task(
                self._direct_strategy(execution_id, document_data_list)
            )
            
            # 等待两个任务完成
            logger.info(f"[{execution_id}] ⏳ 等待并行任务完成...")
            cluster_results, direct_results = await asyncio.gather(
                cluster_task, 
                direct_task, 
                return_exceptions=True
            )
            
            strategy_time = time.time() - strategy_start
            logger.info(f"[{execution_id}] ⚡ 并行策略执行完成，耗时: {strategy_time:.2f}秒")
            
            # 处理异常结果
            if isinstance(cluster_results, Exception):
                logger.error(f"[{execution_id}] ❌ 聚类策略失败: {cluster_results}")
                cluster_results = []
            
            if isinstance(direct_results, Exception):
                logger.error(f"[{execution_id}] ❌ 直接策略失败: {direct_results}")
                direct_results = []
            
            # 确保结果是列表类型
            cluster_results = cluster_results if isinstance(cluster_results, list) else []
            direct_results = direct_results if isinstance(direct_results, list) else []
            
            # 3. 合并并去重结果
            logger.info(f"[{execution_id}] 📊 合并结果：聚类 {len(cluster_results)} + 直接 {len(direct_results)}")
            merge_start = time.time()
            combined_results = cluster_results + direct_results
            unique_results = self._deduplicate_results(combined_results)
            merge_time = time.time() - merge_start
            logger.info(f"[{execution_id}] 🔄 结果合并去重完成，耗时: {merge_time:.3f}秒，最终 {len(unique_results)} 对重复内容")
            
            # 4. 验证结果
            if unique_results:
                logger.info(f"[{execution_id}] 🔍 开始验证检测结果...")
                validation_start = time.time()
                validated_results = await self._run_in_executor(
                    self.validator.validate_results, document_data_list, unique_results
                )
                validation_time = time.time() - validation_start
                logger.info(f"[{execution_id}] ✅ 验证完成，耗时: {validation_time:.2f}秒，最终结果: {len(validated_results)} 对重复内容")
            else:
                validated_results = []
                logger.info(f"[{execution_id}] ℹ️ 无检测结果需要验证")
            
            total_time = time.time() - start_time
            logger.info(f"[{execution_id}] 🎉 工作流执行完成，总耗时: {total_time:.2f}秒")
            return validated_results
            
        except Exception as e:
            total_time = time.time() - start_time
            logger.error(f"[{execution_id}] ❌ 文档分析失败，总耗时: {total_time:.2f}秒，错误: {e}")
            raise
    
    async def _clustering_strategy(self, execution_id: int, document_inputs) -> List[DuplicateOutput]:
        """分割聚类查重策略 - 异步版本"""
        strategy_start = time.time()
        try:
            # 分割文档
            logger.info(f"[{execution_id}] 🔍 聚类策略：开始分割文档...")
            segment_start = time.time()
            segments = await self._run_in_executor(
                self.processor.segment_documents, document_inputs
            )
            segment_time = time.time() - segment_start
            logger.info(f"[{execution_id}] ✅ 聚类策略：已分割出 {len(segments)} 个文本片段，耗时: {segment_time:.2f}秒")
            
            # 生成嵌入向量
            logger.info(f"[{execution_id}] 🧠 聚类策略：开始生成嵌入向量...")
            embedding_start = time.time()
            segments = await self._run_in_executor(
                self.processor.generate_embeddings, segments
            )
            embedding_time = time.time() - embedding_start
            logger.info(f"[{execution_id}] ✅ 聚类策略：已生成 {len(segments)} 个嵌入向量，耗时: {embedding_time:.2f}秒")
            
            # 聚类分析
            logger.info(f"[{execution_id}] 🎯 聚类策略：开始聚类分析...")
            cluster_start = time.time()
            clusters = await self._run_in_executor(
                self.clustering_manager.initial_clustering, segments
            )
            multi_doc_clusters = await self._run_in_executor(
                self.clustering_manager.filter_multi_document_clusters, clusters
            )
            cluster_time = time.time() - cluster_start
            logger.info(f"[{execution_id}] ✅ 聚类策略：发现 {len(multi_doc_clusters)} 个可能包含重复内容的聚类，耗时: {cluster_time:.2f}秒")
            
            # 检测重复内容
            logger.info(f"[{execution_id}] 🤖 聚类策略：开始LLM检测...")
            llm_start = time.time()
            if multi_doc_clusters:
                cluster_results = await self._run_in_executor(
                    self.detector.detect_duplicates_parallel, multi_doc_clusters
                )
            else:
                cluster_results = []
            llm_time = time.time() - llm_start
            strategy_time = time.time() - strategy_start
            
            logger.info(f"[{execution_id}] ✅ 聚类策略：发现 {len(cluster_results)} 对重复内容，LLM耗时: {llm_time:.2f}秒，总耗时: {strategy_time:.2f}秒")
            return cluster_results
            
        except Exception as e:
            strategy_time = time.time() - strategy_start
            logger.error(f"[{execution_id}] ❌ 聚类策略失败，耗时: {strategy_time:.2f}秒，错误: {e}")
            return []
    
    async def _direct_strategy(self, execution_id: int, document_data_list) -> List[DuplicateOutput]:
        """直接查重策略 - 异步版本"""
        strategy_start = time.time()
        try:
            logger.info(f"[{execution_id}] 🎯 直接策略：开始完整文档比较，文档数量: {len(document_data_list)}")
            direct_results = await self._run_in_executor(
                self.detector.direct_document_comparison, document_data_list
            )
            strategy_time = time.time() - strategy_start
            logger.info(f"[{execution_id}] ✅ 直接策略：发现 {len(direct_results)} 对重复内容，耗时: {strategy_time:.2f}秒")
            return direct_results
            
        except Exception as e:
            strategy_time = time.time() - strategy_start
            logger.error(f"[{execution_id}] ❌ 直接策略失败，耗时: {strategy_time:.2f}秒，错误: {e}")
            return []
    
    async def _run_in_executor(self, func, *args):
        """在线程池中运行同步函数"""
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            return await loop.run_in_executor(executor, func, *args)
    
    def _deduplicate_results(self, results: List[DuplicateOutput]) -> List[DuplicateOutput]:
        """去除重复的检测结果"""
        if not results:
            return results
        
        logger.info(f"🔄 开始去重处理，输入 {len(results)} 对结果...")
        unique_results = []
        seen_pairs = set()
        
        for result in results:
            # 创建标准化的内容对标识
            content_pair = tuple(sorted([
                result.content1.strip().lower(),
                result.content2.strip().lower()
            ]))
            
            if content_pair not in seen_pairs:
                seen_pairs.add(content_pair)
                unique_results.append(result)
        
        logger.info(f"✅ 去重完成，去重前: {len(results)} 对，去重后: {len(unique_results)} 对")
        return unique_results
        
        logger.info(f"去重前: {len(results)} 对，去重后: {len(unique_results)} 对")
        return unique_results
