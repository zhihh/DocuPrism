# DocuPrism AI

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Version](https://img.shields.io/badge/version-v2.0.0-blue.svg)](https://github.com/zhihh/DocuPrism/releases)
[![Python](https://img.shields.io/badge/python-3.12+-green.svg)](https://www.python.org/)

> **AI-Powered Semantic Document Comparison Platform**  
> 基于深度学习和大模型的智能文档比对系统，支持文档内容的重复检测、语义相似性分析和智能比对。

## ✨ 主要特性

### 🧠 智能检测

- **语义相似性分析** - 基于大模型的深度语义理解
- **重复内容识别** - 智能识别文档间的重复片段
- **错误一致检测** - 发现相同的错别字、语法错误等
- **异常模式检测** - 识别报价中的等差、等比数列异常

### 🔧 技术特性

- **多格式支持** - PDF、Word、TXT、MD、JSON、图片等
- **分块处理** - 支持长文档的细粒度分析
- **聚类分析** - HDBSCAN算法提升检测效率
- **并行处理** - LangChain RunnableParallel高性能分析
- **多进程架构** - 支持高并发处理

### 🚀 部署特性

- **RESTful API** - 标准化接口，易于集成
- **Docker支持** - 容器化部署，一键启动
- **实时监控** - LangSmith链路追踪
- **统一日志** - 完整的日志记录和监控系统
- **现代化前端** - React + TypeScript Web界面

## 📝 更新日志

### v2.0.0 (2025-09-18)
- 🚀 全面重构为DocuPrism AI平台
- ⚡ 多进程部署支持，提升并发性能
- 📊 统一日志系统，支持多环境部署
- 🔧 完整的文档预处理pipeline
- 🎨 优化前端界面和用户体验

### v1.2.1 (2024-08-21)
- ⚡ 增加并发处理能力
- 🎨 优化请求头日志记录

### v1.2.0 (2024-08-13)
- 🎨 更新API响应格式，增加重复内容前后缀
- 🔧 优化错误处理和异常分类
- 📊 增强分析结果详细度



## 🏗️ 项目架构

```text
DocuPrism/
├── main.py                     # 应用入口
├── src/                        # 核心源码
│   ├── api/                    # API层
│   │   ├── app.py             # FastAPI应用定义
│   │   └── service.py         # 核心业务服务
│   ├── core/                  # 核心处理模块
│   │   ├── document_processor.py    # 文档处理器
│   │   └── clustering_manager.py    # 聚类管理器
│   ├── detectors/             # 检测器模块
│   │   └── llm_duplicate_detector.py # 大模型重复检测
│   ├── models/                # 数据模型
│   │   ├── api_models.py      # API数据模型
│   │   └── data_models.py     # 内部数据模型
│   ├── validators/            # 验证器模块
│   │   └── validation_manager.py    # 验证管理器
│   ├── config/               # 配置管理
│   │   └── config.py         # 系统配置
│   └── utils/                # 工具类
│       ├── unified_logger.py  # 统一日志系统
│       └── text_utils.py     # 文本处理工具
├── backend/                   # 文档预处理模块
│   ├── processors/           # 文档解析器
│   ├── services/             # OCR等服务
│   └── models/               # 数据模型
├── frontend/                  # Web前端界面
│   ├── src/components/       # React组件
│   ├── src/services/         # API服务
│   └── src/hooks/            # React Hooks
├── scripts/                   # 运维脚本
│   └── aggregate_logs.py     # 日志聚合工具
└── docs/                     # 文档
    └── MULTIPROCESS_DEPLOYMENT.md  # 多进程部署指南
```

## 🚀 快速开始

### 环境要求

- Python 3.12+
- Docker 20+ (推荐)
- Node.js 16+ (前端开发)

### 1. 克隆项目

```bash
git clone https://github.com/zhihh/DocuPrism.git
cd DocuPrism
```

### 2. 环境配置

#### 方式一：通过 .env 文件配置

```bash
# 复制配置模板
cp .env.example .env

# 编辑配置文件
nano .env
```

配置内容：
```bash
# OpenAI API配置
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 模型配置
LLM_MODEL_NAME=qwen-turbo
EMBEDDING_MODEL_NAME=text-embedding-v4

# 运行环境
ENVIRONMENT=production
WORKERS=1
```

#### 方式二：通过代码配置

修改 `src/config/config.py` 文件中的默认配置。

### 3. 部署方式

#### 🐳 Docker Compose 部署（推荐）

```bash
# 一键部署
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

#### 🐍 Python 本地部署

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

#### ⚡ 多进程生产部署

```bash
# 使用部署脚本
./scripts/deploy.sh

# 手动配置多进程
export WORKERS=1
export ENV_MODE=production
python main.py
```

### 4. 验证部署

访问以下端点验证服务状态：

- **服务状态**: http://localhost:8000/
- **健康检查**: http://localhost:8000/health
- **API文档**: http://localhost:8000/docs
- **前端界面**: http://localhost:3000/ (如果启动了前端)

## 📖 API 使用指南

### 核心接口：文档智能比对

**端点**: `POST /api/v2/analyze`

**请求格式**:
```json
[
  {
    "documentId": 1,
    "page": 1,
    "content": "文档内容..."
  },
  {
    "documentId": 2,
    "page": 1,
    "content": "另一个文档内容..."
  }
]
```

**响应格式**:
```json
{
  "success": true,
  "message": "分析完成，发现 2 对问题内容",
  "data": [
    {
      "documentId1": 1,
      "page1": 1,
      "chunkId1": 0,
      "content1": "登陆系统进行操作",
      "prefix1": "登陆系统进行",
      "suffix1": "系统进行操作",
      "documentId2": 2,
      "page2": 1,
      "chunkId2": 0,
      "content2": "登陆系统完成任务",
      "prefix2": "登陆系统完成",
      "suffix2": "系统完成任务",
      "reason": "两个文档都将'登录'错误地写成了'登陆'",
      "score": 0.85,
      "category": 2
    }
  ],
  "total_count": 2,
  "processing_time": 3.45
}
```

**字段说明**:
- `category`: 问题类别
  - `1`: 语义相似/重复内容
  - `2`: 错误一致（如相同的错别字）
  - `3`: 报价异常（如等差、等比数列）
- `prefix1/prefix2`: 内容前缀预览（默认前10字）
- `suffix1/suffix2`: 内容后缀预览（默认后10字）

### 使用示例

```python
import requests
import json

# 准备测试数据
documents = [
    {
        "documentId": 1,
        "page": 1,
        "content": "人工智能是计算机科学的一个分支..."
    },
    {
        "documentId": 2,
        "page": 1,
        "content": "AI是计算机科学的重要领域..."
    }
]

# 发送请求
response = requests.post(
    "http://localhost:8000/api/v2/analyze",
    json=documents,
    headers={"Content-Type": "application/json"}
)

# 处理响应
result = response.json()
print(f"发现 {result['total_count']} 对重复内容")
```

## 🔧 配置说明

### 模型配置

系统支持多种大模型，通过环境变量配置：

- `LLM_MODEL_NAME`: 用于智能比对检测的大模型（默认: qwen-turbo）
- `EMBEDDING_MODEL_NAME`: 用于向量化的嵌入模型（默认: text-embedding-v4）

**支持的模型**:
- **通义千问**: qwen-max, qwen-plus, qwen-turbo
- **OpenAI**: gpt-4, gpt-3.5-turbo
- **自定义模型**: 通过兼容OpenAI API的服务

### 性能调优

#### OCR设备配置

DocuPrism支持动态CPU/GPU设备选择，可根据硬件自动优化OCR性能：

**自动检测模式**（推荐）:
```python
from backend.processors.document_processor import DocumentProcessor

# 自动选择最佳设备
processor = DocumentProcessor(enable_ocr=True, use_gpu=None)
```

**GPU加速配置**:
```bash
# 安装GPU版本PaddlePaddle (推荐2.6.2)
conda activate DocuPrism
uv pip install paddlepaddle-gpu>=2.5.0

# 安装兼容的PaddleOCR版本 (重要：版本兼容性)
uv pip install paddleocr==2.8.1

# 验证GPU支持
python scripts/test_ocr_device.py
```

**版本兼容性说明**:
- **PaddleOCR 2.8.1**: 与PaddlePaddle-GPU 2.6.2完全兼容，推荐使用
- **PaddleOCR 3.x**: 存在API兼容性问题，暂不推荐
- **硬件要求**: NVIDIA GPU + CUDA 11.8/12.x，建议4GB+显存

**手动设备选择**:
```python
# 强制使用GPU
processor = DocumentProcessor(enable_ocr=True, use_gpu=True, gpu_memory_limit=500)

# 强制使用CPU
processor = DocumentProcessor(enable_ocr=True, use_gpu=False)

# 运行时切换设备
processor.switch_ocr_device(use_gpu=True)
```

**性能对比**:
- **GPU模式**: 3-10倍速度提升，适合大批量处理
- **CPU模式**: 稳定可靠，适合轻量级使用
- **自动模式**: 智能选择，平衡性能和兼容性

#### 其他性能调优

- **文档分割**: 在 `document_processor.py` 中调整 `chunk_size` 和 `chunk_overlap`
- **聚类参数**: 在 `clustering_manager.py` 中调整 HDBSCAN 参数
- **并发控制**: 系统自动管理并发，避免资源冲突

详细的多进程部署指南请参考: [MULTIPROCESS_DEPLOYMENT.md](MULTIPROCESS_DEPLOYMENT.md)

## 🧪 测试

### 运行测试

```bash
# 运行复杂数据测试
python test/test_complex_data.py

# 使用Jupyter进行交互式测试
jupyter notebook notebook/test.ipynb
```

### 测试场景

项目包含多种测试场景：

- 学术论文重复检测
- 技术文档相似性分析
- 多语言内容检测
- 大规模文档处理

## 📊 监控与日志

### LangSmith追踪

系统集成LangSmith链路追踪，提供：

- 详细的执行时间分析
- 模型调用链路可视化
- 性能瓶颈识别

### 日志管理

#### 开发模式（单进程）
- 完整的实时日志输出
- 详细的调试信息
- 支持热重载

```bash
# 查看实时日志
tail -f logs/main.log
```

#### 生产模式（多进程）
- 进程级别的日志分离
- 高性能日志写入
- 日志聚合工具

```bash
# 实时聚合查看所有进程日志
python scripts/aggregate_logs.py --real-time

# 生成聚合日志文件
python scripts/aggregate_logs.py --type main --output aggregated.log

# 查看可用日志文件
python scripts/aggregate_logs.py --list
```

### 性能监控

- **LangSmith追踪**: 自动记录LLM调用链路
- **请求响应时间**: API响应时间统计
- **并发性能**: 多进程处理能力监控

##  容器化部署

### 构建镜像

```bash
# 构建生产镜像
docker build -t zhihh/docuprism-ai:latest .

# 推送到仓库（可选）
docker push zhihh/docuprism-ai:latest
```

### 生产部署

```bash
# 生产环境部署
./scripts/deploy.sh --prod

# 开发环境部署
./scripts/deploy.sh --dev
```

## 🔒 安全说明

- API密钥通过环境变量配置，避免硬编码
- 支持CORS配置，可根据需要限制访问源
- 容器化运行，与主机环境隔离
- 支持HTTPS部署（需配置反向代理）

## 📈 性能指标

- **处理速度**: 单文档分析通常在2-5秒内完成
- **并发支持**: 支持多请求并发处理
- **内存使用**: 优化的内存管理，支持大文档处理
- **准确率**: 基于大模型的语义分析，准确率>90%

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

本项目采用 Creative Commons Attribution-NonCommercial 4.0 International License 许可证。

### 重要声明：本项目禁止用于商业用途

您可以：

- ✅ 分享 — 在任何媒介或格式下复制并重新分发该项目
- ✅ 改编 — 重新编译、转换和基于该项目进行创作

但必须遵循以下条件：

- 📝 署名 — 您必须给予适当的署名，提供指向许可协议的链接，并指出是否对原始作品进行了修改
- 🚫 非商业性使用 — 您不得将该项目用于商业目的

如需商业使用授权，请通过 GitHub Issues 或邮件联系项目维护者。

详情请参阅 [LICENSE](LICENSE) 文件。

## 🆘 技术支持

如有问题或建议，请通过以下方式联系：

- 创建 Issue
- 发送邮件至项目维护者
- 查看项目文档和示例

## 🔄 版本历史

- **v2.0.0**: 模块化重构，支持并行处理
- **v1.0.0**: 初始版本，基础查重功能

---

⭐ 如果这个项目对您有帮助，请给个Star支持！
