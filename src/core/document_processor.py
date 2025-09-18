"""
文档处理器
负责文档的分割、向量化等预处理工作
"""

import os
import time
from typing import List, Tuple, Dict
from openai import OpenAI
from langchain_experimental.text_splitter import SemanticChunker
from langchain_core.embeddings import Embeddings
from langchain.schema import Document

from ..models.api_models import DocumentInput
from ..models.data_models import TextSegment, DocumentData
from ..utils.unified_logger import UnifiedLogger

logger = UnifiedLogger.get_logger(__name__)


class CustomEmbeddings(Embeddings):
    """自定义嵌入类，兼容阿里云DashScope API"""
    
    def __init__(self, client: OpenAI, model: str, dimensions: int = 1024):
        self.client = client
        self.model = model
        self.dimensions = dimensions
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """嵌入多个文档"""
        all_embeddings = []
        batch_size = 10
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            try:
                response = self.client.embeddings.create(
                    model=self.model,
                    input=batch_texts,
                    dimensions=self.dimensions,
                    encoding_format="float"
                )
                batch_embeddings = [item.embedding for item in response.data]
                all_embeddings.extend(batch_embeddings)
            except Exception as e:
                logger.error(f"嵌入生成失败: {e}")
                # 返回零向量作为回退
                for _ in batch_texts:
                    all_embeddings.append([0.0] * self.dimensions)
        
        return all_embeddings
    
    def embed_query(self, text: str) -> List[float]:
        """嵌入单个查询"""
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=[text],
                dimensions=self.dimensions,
                encoding_format="float"
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"查询嵌入生成失败: {e}")
            # 返回零向量作为回退
            return [0.0] * self.dimensions


class DocumentProcessor:
    """文档处理器"""
    
    def __init__(self):
        self.client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY"),
            base_url=os.environ.get("OPENAI_BASE_URL")
        )
        # 使用自定义嵌入类，兼容阿里云DashScope API
        embeddings = CustomEmbeddings(
            client=self.client,
            model=os.environ.get("EMBEDDING_MODEL_NAME", "text-embedding-v4"),
            dimensions=1024
        )
        self.text_splitter = SemanticChunker(
            embeddings=embeddings,
            breakpoint_threshold_type="percentile",  # 使用百分位数阈值
            breakpoint_threshold_amount=95,  # 95%百分位数作为阈值
            buffer_size=1,  # 缓冲区大小
            sentence_split_regex=r'(?<=[。！？；])\s*',  # 中文句子分割正则
        )
        # 从环境变量获取模型名
        self.embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "text-embedding-v4")
    
    def process_json_documents(self, json_data: List[Dict]) -> Tuple[List[DocumentData], List[DocumentInput]]:
        """处理JSON格式的文档数据，返回按doc为单位的数据和原始输入"""
        start_time = time.time()
        logger.info(f"📥 开始处理JSON文档数据，输入项目数: {len(json_data)}")
        
        documents_by_id = {}
        original_inputs = []
        
        # 按文档ID分组，合并同一文档的所有页面
        for item_idx, item in enumerate(json_data):
            doc_input = DocumentInput(
                documentId=item["documentId"],
                page=item["page"],
                content=item["content"]
            )
            original_inputs.append(doc_input)
            
            doc_id = doc_input.documentId
            if doc_id not in documents_by_id:
                documents_by_id[doc_id] = {
                    'pages': {},
                    'content_parts': []
                }
                logger.info(f"📄 发现新文档: {doc_id}")
            
            documents_by_id[doc_id]['pages'][doc_input.page] = doc_input.content
            documents_by_id[doc_id]['content_parts'].append(doc_input.content)
            
            logger.info(f"📑 处理文档页面: {doc_id} 第{doc_input.page}页, 内容长度: {len(doc_input.content)}字符")
        
        # 创建DocumentData对象
        document_data_list = []
        for doc_id, data in documents_by_id.items():
            combined_content = "\n\n".join(data['content_parts'])
            doc_data = DocumentData(
                document_id=doc_id,
                content=combined_content,
                pages=data['pages']
            )
            document_data_list.append(doc_data)
            
            logger.info(f"📋 合并文档: {doc_id}, 总页数: {len(data['pages'])}, 合并后长度: {len(combined_content)}字符")
        
        process_time = time.time() - start_time
        logger.info(f"✅ JSON文档处理完成，耗时: {process_time:.3f}秒，生成 {len(document_data_list)} 个文档对象")
        
        return document_data_list, original_inputs
    
    def segment_documents(self, document_inputs: List[DocumentInput]) -> List[TextSegment]:
        """基于语义相似性分割文档，支持跨页面的智能分块"""
        start_time = time.time()
        logger.info(f"🔍 开始语义分割文档，输入页面数: {len(document_inputs)}")
        
        all_segments = []
        
        # 按文档ID分组
        docs_by_id = {}
        for doc_input in document_inputs:
            if doc_input.documentId not in docs_by_id:
                docs_by_id[doc_input.documentId] = []
            docs_by_id[doc_input.documentId].append(doc_input)
        
        logger.info(f"📊 分组结果: {len(docs_by_id)} 个不同文档")
        
        # 对每个文档进行语义分割
        for doc_idx, (doc_id, doc_pages) in enumerate(docs_by_id.items(), 1):
            doc_start_time = time.time()
            logger.info(f"📄 处理文档 {doc_idx}/{len(docs_by_id)}: {doc_id}, 页面数: {len(doc_pages)}")
            
            # 按页码排序
            doc_pages.sort(key=lambda x: x.page)
            
            # 合并所有页面内容，记录页面边界
            combined_content = ""
            page_boundaries = []  # [(start_pos, end_pos, page_num), ...]
            current_pos = 0
            
            for doc_page in doc_pages:
                if doc_page.content:
                    start_pos = current_pos
                    end_pos = current_pos + len(doc_page.content)
                    page_boundaries.append((start_pos, end_pos, doc_page.page))
                    combined_content += doc_page.content + "\n\n"
                    current_pos = len(combined_content)
                    logger.info(f"  📑 页面 {doc_page.page}: {len(doc_page.content)} 字符, 位置 {start_pos}-{end_pos}")
            
            if not combined_content.strip():
                logger.warning(f"⚠️ 文档 {doc_id} 内容为空，跳过分割")
                continue
            
            logger.info(f"📝 文档 {doc_id} 合并后总长度: {len(combined_content)} 字符")
            
            # 使用语义分块器进行分割
            try:
                chunk_start_time = time.time()
                chunks = self.text_splitter.split_text(combined_content)
                chunk_time = time.time() - chunk_start_time
                
                logger.info(f"🧠 文档 {doc_id} 语义分割完成，耗时: {chunk_time:.2f}秒，生成 {len(chunks)} 个片段")
                
                # 转换为TextSegment对象，确定每个片段所属的页面
                for chunk_id, chunk_content in enumerate(chunks, 1):
                    chunk_content = chunk_content.strip()
                    if not chunk_content:
                        continue
                    
                    # 找到片段在合并内容中的位置
                    chunk_start = combined_content.find(chunk_content)
                    if chunk_start == -1:
                        # 如果找不到精确匹配，使用第一个页面
                        page_num = doc_pages[0].page
                        logger.warning(f"⚠️ 片段 {chunk_id} 位置匹配失败，使用第一页")
                    else:
                        # 根据位置确定所属页面（使用片段开始位置所在的页面）
                        page_num = doc_pages[0].page  # 默认值
                        for start_pos, end_pos, page in page_boundaries:
                            if start_pos <= chunk_start < end_pos:
                                page_num = page
                                break
                    
                    segment_id = f"doc_{doc_id}_page_{page_num}_semantic_chunk_{chunk_id}"
                    
                    segment = TextSegment(
                        id=segment_id,
                        content=chunk_content,
                        document_id=doc_id,
                        page=page_num,
                        chunk_id=chunk_id
                    )
                    
                    all_segments.append(segment)
                    logger.info(f"  ✅ 片段 {chunk_id}: 长度 {len(chunk_content)} 字符, 归属页面 {page_num}")
                    
            except Exception as e:
                logger.error(f"❌ 对文档 {doc_id} 进行语义分割时出错: {e}")
                # 回退到简单的按句子分割
                logger.info(f"🔄 文档 {doc_id} 回退到句子分割模式")
                sentences = combined_content.split('。')
                for chunk_id, sentence in enumerate(sentences, 1):
                    sentence = sentence.strip()
                    if sentence:
                        segment_id = f"doc_{doc_id}_fallback_chunk_{chunk_id}"
                        segment = TextSegment(
                            id=segment_id,
                            content=sentence + '。',
                            document_id=doc_id,
                            page=doc_pages[0].page,
                            chunk_id=chunk_id
                        )
                        all_segments.append(segment)
                
                logger.info(f"📋 文档 {doc_id} 回退分割完成，生成 {len(sentences)} 个句子片段")
            
            doc_time = time.time() - doc_start_time
            logger.info(f"✅ 文档 {doc_id} 处理完成，耗时: {doc_time:.2f}秒")
        
        total_time = time.time() - start_time
        logger.info(f"🎉 语义分割全部完成，总耗时: {total_time:.2f}秒，共生成 {len(all_segments)} 个文本片段")
        return all_segments
    
    def generate_embeddings(self, segments: List[TextSegment]) -> List[TextSegment]:
        """生成文本嵌入"""
        start_time = time.time()
        logger.info(f"🧠 开始生成嵌入向量，输入片段数: {len(segments)}")
        
        valid_segments = []
        contents = []
        
        # 验证和准备内容
        for seg_idx, seg in enumerate(segments):
            if seg.content and isinstance(seg.content, str) and seg.content.strip():
                valid_segments.append(seg)
                contents.append(str(seg.content).strip())
            else:
                logger.warning(f"⚠️ 跳过无效片段 {seg_idx}: 内容为空或格式错误")
        
        if not contents:
            logger.error("❌ 没有有效的文本内容用于生成嵌入")
            return segments
        
        logger.info(f"📋 有效片段统计: {len(valid_segments)}/{len(segments)}, 模型: {self.embedding_model_name}")
        
        try:
            batch_size = 10
            all_embeddings = []
            total_batches = (len(contents) + batch_size - 1) // batch_size
            
            for i in range(0, len(contents), batch_size):
                batch_start_time = time.time()
                batch_idx = i // batch_size + 1
                
                batch_contents = contents[i:i + batch_size]
                logger.info(f"🔄 处理批次 {batch_idx}/{total_batches}, 片段数: {len(batch_contents)}")
                
                # 记录批次内容统计
                batch_lengths = [len(content) for content in batch_contents]
                avg_length = sum(batch_lengths) / len(batch_lengths)
                logger.info(f"  📊 批次统计: 平均长度 {avg_length:.0f} 字符, 范围 {min(batch_lengths)}-{max(batch_lengths)}")
                
                response = self.client.embeddings.create(
                    model=self.embedding_model_name,
                    input=batch_contents,
                    dimensions=1024,
                    encoding_format="float"
                )
                
                batch_embeddings = [item.embedding for item in response.data]
                all_embeddings.extend(batch_embeddings)
                
                batch_time = time.time() - batch_start_time
                logger.info(f"  ✅ 批次 {batch_idx} 完成，耗时: {batch_time:.2f}秒, 向量维度: {len(batch_embeddings[0])}")
            
            # 将嵌入向量分配给片段
            embedding_assign_time = time.time()
            for segment, embedding in zip(valid_segments, all_embeddings):
                segment.embedding = embedding
            assign_time = time.time() - embedding_assign_time
                
            total_time = time.time() - start_time
            avg_time_per_segment = total_time / len(valid_segments)
            
            logger.info(f"🎉 嵌入向量生成完成！")
            logger.info(f"  📊 统计信息:")
            logger.info(f"    - 总片段数: {len(valid_segments)}")
            logger.info(f"    - 总耗时: {total_time:.2f}秒")
            logger.info(f"    - 平均每片段: {avg_time_per_segment:.3f}秒")
            logger.info(f"    - 向量分配耗时: {assign_time:.3f}秒")
            logger.info(f"    - 处理速度: {len(valid_segments)/total_time:.1f} 片段/秒")
            
        except Exception as e:
            error_time = time.time() - start_time
            logger.error(f"❌ 生成嵌入向量时出错，已耗时: {error_time:.2f}秒")
            logger.error(f"错误详情: {e}")
            raise e
        
        return segments
