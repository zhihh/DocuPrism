

AI-Powered Semantic Document Comparison PlatformAI-Powered Semantic Document Comparison Platform



基于深度学习和大模型的智能文档比对系统，支持文档内容的重复检测、语义相似性分析和智能比对。基于深度学习和大模型的智能文档比对系统，支持文档内容的重复检测、语义相似性分析和智能比对。



## 📝 更新日志## 📝 更新日志



- **v2.0.0 (2025-01-XX)**:- **v2.0.0 (2025-01-XX)**:

  - 🚀 全面重构为DocuPrism AI平台  - 🚀 全面重构为DocuPrism AI平台

  - ⚡ 多进程部署支持，提升并发性能  - ⚡ 多进程部署支持，提升并发性能

  - 📊 统一日志系统，支持多环境部署  - 📊 统一日志系统，支持多环境部署

  - 🔧 完整的文档预处理pipeline  - 🔧 完整的文档预处理pipeline

  - 🎨 优化前端界面和用户体验  - 🎨 优化前端界面和用户体验



- **v1.2.1 (2024-08-21)**:- **v1.2.1 (2024-08-21)**:

  - ⚡ 增加并发处理能力  - ⚡ 增加并发处理能力

  - 🎨 优化请求头日志记录  - 🎨 优化请求头日志记录



- **v1.2.0 (2024-08-13)**: - **v1.2.0 (2024-08-13)**: 

  - 🎨 更新API响应格式，增加重复内容前后缀  - 🎨 更新API响应格式，增加重复内容前后缀

  - 🔧 优化错误处理和异常分类  - 🔧 优化错误处理和异常分类

  - 📊 增强分析结果详细度  - 📊 增强分析结果详细度 基于AI语义理解的文档智能比对系统



## 🌟 功能特性AI-Powered Semantic Document Comparison Platform



### 核心功能基于深度学习和大模型的智能文档比对系统，支持文档内容的重复检测、语义相似性分析和智能比对。

- **智能比对**: 基于大模型的语义相似性检测，支持重复内容识别

- **错误一致检测**: 识别相同的错别字、用词错误、语法错误等一致性问题## 📝 Change Log

- **报价异常检测**: 识别投标报价中的等差、等比数列及其他异常规律

- **多格式支持**: 支持PDF、Word、TXT、MD、JSON、图片等多种文档格式- **20250821**:

  - ⚡ 增加并发处理

### 技术特性  - 🎨 增加请求头日志

- **分块处理**: 自动文档分割，支持长文档的细粒度分析

- **聚类分析**: 使用HDBSCAN算法进行文档聚类，提高检测效率- **20250813**: 

- **并行处理**: 采用LangChain RunnableParallel实现高性能并行分析  - 🎨 更新API的响应格式，加入重复内容的前后缀

- **多进程支持**: 支持多进程部署，提升并发处理能力  - ✨ 增加错误一致检测、报价异常检测

- **统一日志**: 完整的日志记录和监控系统  - 🎨 更新API响应格式，加入错误类别字段



### 部署特性## 🌟 功能特性

- **RESTful API**: 标准化的API接口，易于集成

- **Docker支持**: 容器化部署，支持快速部署和扩展### 核心功能

- **实时监控**: 集成LangSmith链路追踪，提供详细的执行分析- **智能比对**: 基于大模型的语义相似性检测，支持重复内容识别

- **Web界面**: 现代化的前端界面，支持文件上传和结果可视化- **错误一致检测**: 识别相同的错别字、用词错误、语法错误等一致性问题

- **报价异常检测**: 识别投标报价中的等差、等比数列及其他异常规律

## 🏗️ 项目架构- **多格式支持**: 支持PDF、Word、TXT、MD、JSON、图片等多种文档格式



```text### 技术特性

DocuPrism/- **分块处理**: 自动文档分割，支持长文档的细粒度分析

├── main.py                     # 应用入口- **聚类分析**: 使用HDBSCAN算法进行文档聚类，提高检测效率

├── src/                        # 核心源码- **并行处理**: 采用LangChain RunnableParallel实现高性能并行分析

│   ├── api/                    # API层- **多进程支持**: 支持多进程部署，提升并发处理能力

│   │   ├── app.py             # FastAPI应用定义- **统一日志**: 完整的日志记录和监控系统

│   │   └── service.py         # 核心业务服务

│   ├── core/                  # 核心处理模块### 部署特性

│   │   ├── document_processor.py    # 文档处理器- **RESTful API**: 标准化的API接口，易于集成

│   │   └── clustering_manager.py    # 聚类管理器- **Docker支持**: 容器化部署，支持快速部署和扩展

│   ├── detectors/             # 检测器模块- **实时监控**: 集成LangSmith链路追踪，提供详细的执行分析

│   │   └── llm_duplicate_detector.py # 大模型重复检测- **Web界面**: 现代化的前端界面，支持文件上传和结果可视化

│   ├── models/                # 数据模型

│   │   ├── api_models.py      # API数据模型## 🏗️ 项目架构

│   │   └── data_models.py     # 内部数据模型

│   ├── validators/            # 验证器模块```text

│   │   └── validation_manager.py    # 验证管理器DocuPrism/

│   ├── config/               # 配置管理├── main.py                     # 应用入口

│   │   └── config.py         # 系统配置├── src/                        # 核心源码

│   └── utils/                # 工具类│   ├── api/                    # API层

│       ├── unified_logger.py  # 统一日志系统│   │   ├── app.py             # FastAPI应用定义

│       └── text_utils.py     # 文本处理工具│   │   └── service.py         # 核心业务服务

├── backend/                   # 文档预处理模块│   ├── core/                  # 核心处理模块

│   ├── processors/           # 文档解析器│   │   ├── document_processor.py    # 文档处理器

│   ├── services/             # OCR等服务│   │   └── clustering_manager.py    # 聚类管理器

│   └── models/               # 数据模型│   ├── detectors/             # 检测器模块

├── frontend/                  # Web前端界面│   │   └── llm_duplicate_detector.py # 大模型重复检测

│   ├── src/components/       # React组件│   ├── models/                # 数据模型

│   ├── src/services/         # API服务│   │   ├── api_models.py      # API数据模型

│   └── src/hooks/            # React Hooks│   │   └── data_models.py     # 内部数据模型

├── scripts/                   # 运维脚本│   ├── validators/            # 验证器模块

│   └── aggregate_logs.py     # 日志聚合工具│   │   └── validation_manager.py    # 验证管理器

└── docs/                     # 文档│   ├── config/               # 配置管理

    └── MULTIPROCESS_DEPLOYMENT.md  # 多进程部署指南│   │   └── config.py         # 系统配置

```│   └── utils/                # 工具类

│       ├── unified_logger.py  # 统一日志系统

## 🚀 快速开始│       └── text_utils.py     # 文本处理工具

├── backend/                   # 文档预处理模块

### 环境要求│   ├── processors/           # 文档解析器

│   ├── services/             # OCR等服务

- Python 3.12+│   └── models/               # 数据模型

- Node.js 16+ (用于前端开发)├── frontend/                  # Web前端界面

- Docker 20+ (可选)│   ├── src/components/       # React组件

- Docker Compose 2+ (可选)│   ├── src/services/         # API服务

│   └── src/hooks/            # React Hooks

### 1. 克隆项目├── scripts/                   # 运维脚本

│   └── aggregate_logs.py     # 日志聚合工具

```bash└── docs/                     # 文档

git clone https://github.com/zhihh/DocuPrism.git    └── MULTIPROCESS_DEPLOYMENT.md  # 多进程部署指南

cd DocuPrism```

```

## 🚀 快速开始

### 2. 环境配置

### 环境要求

#### 方式一：通过环境变量配置

- Python 3.12

创建 `.env` 文件：- Docker 28.3.2

- Docker Compose 2.39.1

```bash

# 复制配置模板### 1. 克隆项目

cp .env.example .env

```bash

# 编辑配置文件git clone https://github.com/zhihh/DocuPrism.git

nano .envcd DocuPrism

``````



必要配置项：### 2. 环境配置

```bash

# OpenAI API配置#### 通过 config.py 配置

OPENAI_API_KEY=your_api_key_here

OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1修改 `src/config/config.py` 文件中的默认配置：



# 模型配置```python

LLM_MODEL_NAME=qwen-max

EMBEDDING_MODEL_NAME=text-embedding-v4        os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")

        os.environ["OPENAI_BASE_URL"] = os.getenv("OPENAI_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")

# 运行环境        

ENVIRONMENT=production        # 模型配置

WORKERS=4        os.environ["LLM_MODEL_NAME"] = os.getenv("LLM_MODEL_NAME", "qwen-turbo")

```        os.environ["EMBEDDING_MODEL_NAME"] = os.getenv("EMBEDDING_MODEL_NAME", "text-embedding-v4")

```

#### 方式二：通过代码配置

或手动设置环境变量。

修改 `src/config/config.py` 文件中的默认配置。

#### 通过`.env`文件配置

### 3. 部署方式

创建 `.env` 文件并配置以下环境变量：

#### 🐳 方式一：Docker Compose（推荐）

```bash

```bash# OpenAI API配置

# 一键部署OPENAI_API_KEY=your_api_key_here

docker compose up -dOPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1



# 查看服务状态# 模型配置

docker compose psLLM_MODEL_NAME=qwen-turbo

EMBEDDING_MODEL_NAME=text-embedding-v4

# 查看日志

docker compose logs -f```

```

### 3. 部署方式

#### 🐍 方式二：Python本地部署

#### 方式一：Docker Compose（推荐）

```bash

# 创建虚拟环境```bash

conda create -n DocuPrism python=3.12# 快速部署

conda activate DocuPrism./scripts/deploy.sh



# 安装依赖# 或者手动部署

pip install -r requirements.txtdocker compose up -d

```

# 启动后端服务

python main.py#### 方式二：本地开发



# 另开终端启动前端（可选）```bash

cd frontend# 安装依赖

npm installpip install -r requirements.txt

npm run dev

```# 启动服务

python main.py

#### ⚡ 方式三：多进程生产部署```



```bash### 4. 验证部署

# 设置多进程模式

export WORKERS=4访问以下端点验证服务状态：

export ENV_MODE=production

- 服务状态: <http://localhost:8000/>

# 启动服务- 健康检查: <http://localhost:8000/health>

python main.py- API文档: <http://localhost:8000/docs>



# 使用日志聚合工具监控## 📖 API使用指南

python scripts/aggregate_logs.py --real-time --type main

```### 文档智能比对接口



### 4. 验证部署**端点**: `POST /api/v2/analyze`



访问以下端点验证服务状态：**请求格式**:



- **API服务**: http://localhost:8000/```json

- **健康检查**: http://localhost:8000/health[

- **API文档**: http://localhost:8000/docs  {

- **前端界面**: http://localhost:3000/ (如果启动了前端)    "documentId": 1,

    "page": 1,

## 📖 API使用指南    "content": "文档内容..."

  },

### 主要API端点  {

    "documentId": 2,

#### 1. 文档智能比对接口    "page": 1,

    "content": "另一个文档内容..."

**端点**: `POST /api/v2/analyze`  }

]

**请求格式**:```

```json

[**响应格式**:

  {

    "documentId": 1,```json

    "page": 1,{

    "content": "文档内容..."  "success": true,

  },  "message": "分析完成，发现 2 对问题内容",

  {  "data": [

    "documentId": 2,    {

    "page": 1,      "documentId1": 1,

    "content": "另一个文档内容..."      "page1": 1,

  }      "chunkId1": 0,

]      "content1": "登陆系统进行操作",

```      "prefix1": "登陆系统进行",

      "suffix1": "系统进行操作",

**响应格式**:      "documentId2": 2,

```json      "page2": 1,

{      "chunkId2": 0,

  "success": true,      "content2": "登陆系统完成任务",

  "message": "分析完成，发现 2 对重复内容",      "prefix2": "登陆系统完成",

  "data": [      "suffix2": "系统完成任务",

    {      "reason": "两个文档都将'登录'错误地写成了'登陆'",

      "documentId1": 1,      "score": 0.85,

      "documentId2": 2,      "category": 2

      "score": 0.85,    }

      "content1": "重复内容片段1",  ],

      "content2": "重复内容片段2"  "total_count": 2,

    }  "processing_time": 3.45

  ],}

  "total_count": 2,```

  "processing_time": 1.23

}**字段说明**:

```

- `category`: 问题类别

#### 2. 文档预处理接口  - `1`: 语义相似/重复内容

  - `2`: 错误一致（如相同的错别字）

**端点**: `POST /api/v2/upload-document`  - `3`: 报价异常（如等差、等比数列）

- `prefix1/prefix2`: 内容前缀预览（默认前10字）

支持上传PDF、Word、图片等格式文档，自动进行OCR和文本提取。- `suffix1/suffix2`: 内容后缀预览（默认后10字）



#### 3. 批量处理接口### 使用示例



**端点**: `POST /api/v2/upload-and-analyze````python

import requests

支持批量上传文档并自动进行智能比对分析。import json



## 📊 监控和运维# 准备测试数据

documents = [

### 日志管理    {

        "documentId": 1,

#### 开发模式（单进程）        "page": 1,

- 完整的实时日志输出        "content": "人工智能是计算机科学的一个分支..."

- 详细的调试信息    },

- 支持热重载    {

        "documentId": 2,

```bash        "page": 1,

# 查看实时日志        "content": "AI是计算机科学的重要领域..."

tail -f logs/main.log    }

```]



#### 生产模式（多进程）# 发送请求

- 进程级别的日志分离response = requests.post(

- 高性能日志写入    "http://localhost:8000/api/v2/analyze",

- 日志聚合工具    json=documents,

    headers={"Content-Type": "application/json"}

```bash)

# 实时聚合查看所有进程日志

python scripts/aggregate_logs.py --real-time# 处理响应

result = response.json()

# 生成聚合日志文件print(f"发现 {result['total_count']} 对重复内容")

python scripts/aggregate_logs.py --type main --output aggregated.log```



# 查看可用日志文件## 🔧 配置说明

python scripts/aggregate_logs.py --list

```### 模型配置



### 性能监控系统支持多种大模型，通过环境变量配置：



- **LangSmith追踪**: 自动记录LLM调用链路- `LLM_MODEL_NAME`: 用于智能比对检测的大模型（默认: qwen-turbo）

- **请求响应时间**: API响应时间统计- `EMBEDDING_MODEL_NAME`: 用于向量化的嵌入模型（默认: text-embedding-v4）

- **并发性能**: 多进程处理能力监控

### 性能调优

## 🔧 高级配置

- **文档分割**: 可在 `document_processor.py` 中调整 `chunk_size` 和 `chunk_overlap`

### 多进程部署- **聚类参数**: 可在 `clustering_manager.py` 中调整 HDBSCAN 参数

- **并发控制**: 系统自动管理并发，避免资源冲突

详细的多进程部署指南请参考: [MULTIPROCESS_DEPLOYMENT.md](MULTIPROCESS_DEPLOYMENT.md)

## 🧪 测试

### 模型配置

### 运行测试

支持多种LLM提供商：

- **通义千问**: qwen-max, qwen-plus, qwen-turbo```bash

- **OpenAI**: gpt-4, gpt-3.5-turbo# 运行复杂数据测试

- **自定义模型**: 通过兼容OpenAI API的服务python test/test_complex_data.py



### 自定义配置# 使用Jupyter进行交互式测试

jupyter notebook notebook/test.ipynb

可以通过修改 `src/config/config.py` 进行深度定制：```

- 相似度阈值调整

- 分块策略配置### 测试数据

- 聚类参数优化

- 性能参数调优项目包含多种测试场景：



## 🤝 贡献指南- 学术论文重复检测

- 技术文档相似性分析

1. Fork 项目- 多语言内容检测

2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)- 大规模文档处理

3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)

4. 推送到分支 (`git push origin feature/AmazingFeature`)## 📊 监控与日志

5. 开启 Pull Request

### LangSmith追踪

## 📄 许可证

系统集成LangSmith链路追踪，提供：

本项目采用 Creative Commons Attribution-NonCommercial 4.0 International License 许可证。

- 详细的执行时间分析

- ✅ 允许非商业使用、修改和分发- 模型调用链路可视化

- ❌ 禁止商业用途- 性能瓶颈识别

- 📧 商业授权请联系作者

### 日志管理

## 📞 联系我们

- 应用日志: `logs/docuprism-ai.log`

- **作者**: zhihh- 访问日志: 通过Docker Compose查看

- **邮箱**: [联系邮箱]- 错误追踪: 集成到响应中

- **项目主页**: https://github.com/zhihh/DocuPrism

## 🐳 容器化部署

---

### 构建镜像

*DocuPrism AI - 让文档比对更智能* 🚀
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
