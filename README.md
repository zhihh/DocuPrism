# DocuPrism AI



[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)AI-Powered Semantic Document Comparison PlatformAI-Powered Semantic Document Comparison Platform

[![Version](https://img.shields.io/badge/version-v2.0.0-blue.svg)](https://github.com/zhihh/DocuPrism/releases)

[![Python](https://img.shields.io/badge/python-3.12+-green.svg)](https://www.python.org/)



> **基于深度学习和大模型的智能文档比对系统**  基于深度学习和大模型的智能文档比对系统，支持文档内容的重复检测、语义相似性分析和智能比对。基于深度学习和大模型的智能文档比对系统，支持文档内容的重复检测、语义相似性分析和智能比对。

> 支持文档内容的重复检测、语义相似性分析和智能比对



## ✨ 主要特性

## 📝 更新日志## 📝 更新日志

### 🧠 智能检测

- **语义相似性分析** - 基于大模型的深度语义理解

- **重复内容识别** - 智能识别文档间的重复片段

- **错误一致检测** - 发现相同的错别字、语法错误等- **v2.0.0 (2025-01-XX)**:- **v2.0.0 (2025-01-XX)**:

- **异常模式检测** - 识别报价中的等差、等比数列异常

  - 🚀 全面重构为DocuPrism AI平台  - 🚀 全面重构为DocuPrism AI平台

### 🔧 技术特性

- **多格式支持** - PDF、Word、TXT、MD、JSON、图片等  - ⚡ 多进程部署支持，提升并发性能  - ⚡ 多进程部署支持，提升并发性能

- **分块处理** - 支持长文档的细粒度分析

- **聚类分析** - HDBSCAN算法提升检测效率  - 📊 统一日志系统，支持多环境部署  - 📊 统一日志系统，支持多环境部署

- **并行处理** - LangChain RunnableParallel高性能分析

- **多进程架构** - 支持高并发处理  - 🔧 完整的文档预处理pipeline  - 🔧 完整的文档预处理pipeline



### 🚀 部署特性  - 🎨 优化前端界面和用户体验  - 🎨 优化前端界面和用户体验

- **RESTful API** - 标准化接口，易于集成

- **Docker支持** - 容器化部署，一键启动

- **实时监控** - LangSmith链路追踪

- **统一日志** - 完整的日志记录和监控系统- **v1.2.1 (2024-08-21)**:- **v1.2.1 (2024-08-21)**:

- **现代化前端** - React + TypeScript Web界面

  - ⚡ 增加并发处理能力  - ⚡ 增加并发处理能力

## 📝 更新日志

  - 🎨 优化请求头日志记录  - 🎨 优化请求头日志记录

### v2.0.0 (2025-09-18)

- 🚀 全面重构为DocuPrism AI平台

- ⚡ 多进程部署支持，提升并发性能

- 📊 统一日志系统，支持多环境部署- **v1.2.0 (2024-08-13)**: - **v1.2.0 (2024-08-13)**: 

- 🔧 完整的文档预处理pipeline

- 🎨 优化前端界面和用户体验  - 🎨 更新API响应格式，增加重复内容前后缀  - 🎨 更新API响应格式，增加重复内容前后缀



### v1.2.1 (2024-08-21)  - 🔧 优化错误处理和异常分类  - 🔧 优化错误处理和异常分类

- ⚡ 增加并发处理能力

- 🎨 优化请求头日志记录  - 📊 增强分析结果详细度  - 📊 增强分析结果详细度 基于AI语义理解的文档智能比对系统



### v1.2.0 (2024-08-13)

- 🎨 更新API响应格式，增加重复内容前后缀

- 🔧 优化错误处理和异常分类## 🌟 功能特性AI-Powered Semantic Document Comparison Platform

- 📊 增强分析结果详细度



## 🏗️ 项目架构

### 核心功能基于深度学习和大模型的智能文档比对系统，支持文档内容的重复检测、语义相似性分析和智能比对。

```

DocuPrism/- **智能比对**: 基于大模型的语义相似性检测，支持重复内容识别

├── main.py                     # 应用入口

├── src/                        # 核心源码- **错误一致检测**: 识别相同的错别字、用词错误、语法错误等一致性问题## 📝 Change Log

│   ├── api/                    # API层

│   │   ├── app.py             # FastAPI应用定义- **报价异常检测**: 识别投标报价中的等差、等比数列及其他异常规律

│   │   └── service.py         # 核心业务服务

│   ├── core/                  # 核心处理模块- **多格式支持**: 支持PDF、Word、TXT、MD、JSON、图片等多种文档格式- **20250821**:

│   │   ├── document_processor.py    # 文档处理器

│   │   └── clustering_manager.py    # 聚类管理器  - ⚡ 增加并发处理

│   ├── detectors/             # 检测器模块

│   │   └── llm_duplicate_detector.py # 大模型重复检测### 技术特性  - 🎨 增加请求头日志

│   ├── models/                # 数据模型

│   ├── validators/            # 验证器模块- **分块处理**: 自动文档分割，支持长文档的细粒度分析

│   ├── config/               # 配置管理

│   └── utils/                # 工具类- **聚类分析**: 使用HDBSCAN算法进行文档聚类，提高检测效率- **20250813**: 

├── backend/                   # 文档预处理模块

│   ├── processors/           # 文档解析器- **并行处理**: 采用LangChain RunnableParallel实现高性能并行分析  - 🎨 更新API的响应格式，加入重复内容的前后缀

│   ├── services/             # OCR等服务

│   └── models/               # 数据模型- **多进程支持**: 支持多进程部署，提升并发处理能力  - ✨ 增加错误一致检测、报价异常检测

├── frontend/                  # Web前端界面

│   └── src/                  # React组件和服务- **统一日志**: 完整的日志记录和监控系统  - 🎨 更新API响应格式，加入错误类别字段

├── scripts/                   # 运维脚本

└── docs/                     # 文档

```

### 部署特性## 🌟 功能特性

## 🚀 快速开始

- **RESTful API**: 标准化的API接口，易于集成

### 环境要求

- **Docker支持**: 容器化部署，支持快速部署和扩展### 核心功能

- Python 3.12+

- Docker 20+ (推荐)- **实时监控**: 集成LangSmith链路追踪，提供详细的执行分析- **智能比对**: 基于大模型的语义相似性检测，支持重复内容识别

- Node.js 16+ (前端开发)

- **Web界面**: 现代化的前端界面，支持文件上传和结果可视化- **错误一致检测**: 识别相同的错别字、用词错误、语法错误等一致性问题

### 1. 克隆项目

- **报价异常检测**: 识别投标报价中的等差、等比数列及其他异常规律

```bash

git clone https://github.com/zhihh/DocuPrism.git## 🏗️ 项目架构- **多格式支持**: 支持PDF、Word、TXT、MD、JSON、图片等多种文档格式

cd DocuPrism

```



### 2. 环境配置```text### 技术特性



#### 方式一：通过 .env 文件配置DocuPrism/- **分块处理**: 自动文档分割，支持长文档的细粒度分析



```bash├── main.py                     # 应用入口- **聚类分析**: 使用HDBSCAN算法进行文档聚类，提高检测效率

# 复制配置模板

cp .env.example .env├── src/                        # 核心源码- **并行处理**: 采用LangChain RunnableParallel实现高性能并行分析



# 编辑配置文件│   ├── api/                    # API层- **多进程支持**: 支持多进程部署，提升并发处理能力

nano .env

```│   │   ├── app.py             # FastAPI应用定义- **统一日志**: 完整的日志记录和监控系统



配置内容：│   │   └── service.py         # 核心业务服务

```bash

# OpenAI API配置│   ├── core/                  # 核心处理模块### 部署特性

OPENAI_API_KEY=your_api_key_here

OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1│   │   ├── document_processor.py    # 文档处理器- **RESTful API**: 标准化的API接口，易于集成



# 模型配置│   │   └── clustering_manager.py    # 聚类管理器- **Docker支持**: 容器化部署，支持快速部署和扩展

LLM_MODEL_NAME=qwen-turbo

EMBEDDING_MODEL_NAME=text-embedding-v4│   ├── detectors/             # 检测器模块- **实时监控**: 集成LangSmith链路追踪，提供详细的执行分析



# 运行环境│   │   └── llm_duplicate_detector.py # 大模型重复检测- **Web界面**: 现代化的前端界面，支持文件上传和结果可视化

ENVIRONMENT=production

WORKERS=4│   ├── models/                # 数据模型

```

│   │   ├── api_models.py      # API数据模型## 🏗️ 项目架构

#### 方式二：通过代码配置

│   │   └── data_models.py     # 内部数据模型

修改 `src/config/config.py` 文件中的默认配置。

│   ├── validators/            # 验证器模块```text

### 3. 部署方式

│   │   └── validation_manager.py    # 验证管理器DocuPrism/

#### 🐳 Docker Compose 部署（推荐）

│   ├── config/               # 配置管理├── main.py                     # 应用入口

```bash

# 一键部署│   │   └── config.py         # 系统配置├── src/                        # 核心源码

docker compose up -d

│   └── utils/                # 工具类│   ├── api/                    # API层

# 查看服务状态

docker compose ps│       ├── unified_logger.py  # 统一日志系统│   │   ├── app.py             # FastAPI应用定义



# 查看日志│       └── text_utils.py     # 文本处理工具│   │   └── service.py         # 核心业务服务

docker compose logs -f

```├── backend/                   # 文档预处理模块│   ├── core/                  # 核心处理模块



#### 🐍 Python 本地部署│   ├── processors/           # 文档解析器│   │   ├── document_processor.py    # 文档处理器



```bash│   ├── services/             # OCR等服务│   │   └── clustering_manager.py    # 聚类管理器

# 安装依赖

pip install -r requirements.txt│   └── models/               # 数据模型│   ├── detectors/             # 检测器模块



# 启动服务├── frontend/                  # Web前端界面│   │   └── llm_duplicate_detector.py # 大模型重复检测

python main.py

```│   ├── src/components/       # React组件│   ├── models/                # 数据模型



#### ⚡ 多进程生产部署│   ├── src/services/         # API服务│   │   ├── api_models.py      # API数据模型



```bash│   └── src/hooks/            # React Hooks│   │   └── data_models.py     # 内部数据模型

# 使用部署脚本

./scripts/deploy.sh├── scripts/                   # 运维脚本│   ├── validators/            # 验证器模块



# 手动配置多进程│   └── aggregate_logs.py     # 日志聚合工具│   │   └── validation_manager.py    # 验证管理器

export WORKERS=4

export ENV_MODE=production└── docs/                     # 文档│   ├── config/               # 配置管理

python main.py

```    └── MULTIPROCESS_DEPLOYMENT.md  # 多进程部署指南│   │   └── config.py         # 系统配置



### 4. 验证部署```│   └── utils/                # 工具类



访问以下端点验证服务状态：│       ├── unified_logger.py  # 统一日志系统



- **服务状态**: http://localhost:8000/## 🚀 快速开始│       └── text_utils.py     # 文本处理工具

- **健康检查**: http://localhost:8000/health

- **API文档**: http://localhost:8000/docs├── backend/                   # 文档预处理模块

- **前端界面**: http://localhost:3000/ (如果启动了前端)

### 环境要求│   ├── processors/           # 文档解析器

## 📖 API 使用指南

│   ├── services/             # OCR等服务

### 核心接口：文档智能比对

- Python 3.12+│   └── models/               # 数据模型

**端点**: `POST /api/v2/analyze`

- Node.js 16+ (用于前端开发)├── frontend/                  # Web前端界面

**请求格式**:

```json- Docker 20+ (可选)│   ├── src/components/       # React组件

[

  {- Docker Compose 2+ (可选)│   ├── src/services/         # API服务

    "documentId": 1,

    "page": 1,│   └── src/hooks/            # React Hooks

    "content": "文档内容..."

  },### 1. 克隆项目├── scripts/                   # 运维脚本

  {

    "documentId": 2,│   └── aggregate_logs.py     # 日志聚合工具

    "page": 1,

    "content": "另一个文档内容..."```bash└── docs/                     # 文档

  }

]git clone https://github.com/zhihh/DocuPrism.git    └── MULTIPROCESS_DEPLOYMENT.md  # 多进程部署指南

```

cd DocuPrism```

**响应格式**:

```json```

{

  "success": true,## 🚀 快速开始

  "message": "分析完成，发现 2 对问题内容",

  "data": [### 2. 环境配置

    {

      "documentId1": 1,### 环境要求

      "page1": 1,

      "chunkId1": 0,#### 方式一：通过环境变量配置

      "content1": "登陆系统进行操作",

      "prefix1": "登陆系统进行",- Python 3.12

      "suffix1": "系统进行操作",

      "documentId2": 2,创建 `.env` 文件：- Docker 28.3.2

      "page2": 1,

      "chunkId2": 0,- Docker Compose 2.39.1

      "content2": "登陆系统完成任务",

      "prefix2": "登陆系统完成",```bash

      "suffix2": "系统完成任务",

      "reason": "两个文档都将'登录'错误地写成了'登陆'",# 复制配置模板### 1. 克隆项目

      "score": 0.85,

      "category": 2cp .env.example .env

    }

  ],```bash

  "total_count": 2,

  "processing_time": 3.45# 编辑配置文件git clone https://github.com/zhihh/DocuPrism.git

}

```nano .envcd DocuPrism



**字段说明**:``````

- `category`: 问题类别

  - `1`: 语义相似/重复内容

  - `2`: 错误一致（如相同的错别字）

  - `3`: 报价异常（如等差、等比数列）必要配置项：### 2. 环境配置

- `prefix1/prefix2`: 内容前缀预览（默认前10字）

- `suffix1/suffix2`: 内容后缀预览（默认后10字）```bash



### 使用示例# OpenAI API配置#### 通过 config.py 配置



```pythonOPENAI_API_KEY=your_api_key_here

import requests

import jsonOPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1修改 `src/config/config.py` 文件中的默认配置：



# 准备测试数据

documents = [

    {# 模型配置```python

        "documentId": 1,

        "page": 1,LLM_MODEL_NAME=qwen-max

        "content": "人工智能是计算机科学的一个分支..."

    },EMBEDDING_MODEL_NAME=text-embedding-v4        os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")

    {

        "documentId": 2,        os.environ["OPENAI_BASE_URL"] = os.getenv("OPENAI_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")

        "page": 1,

        "content": "AI是计算机科学的重要领域..."# 运行环境        

    }

]ENVIRONMENT=production        # 模型配置



# 发送请求WORKERS=4        os.environ["LLM_MODEL_NAME"] = os.getenv("LLM_MODEL_NAME", "qwen-turbo")

response = requests.post(

    "http://localhost:8000/api/v2/analyze",```        os.environ["EMBEDDING_MODEL_NAME"] = os.getenv("EMBEDDING_MODEL_NAME", "text-embedding-v4")

    json=documents,

    headers={"Content-Type": "application/json"}```

)

#### 方式二：通过代码配置

# 处理响应

result = response.json()或手动设置环境变量。

print(f"发现 {result['total_count']} 对重复内容")

```修改 `src/config/config.py` 文件中的默认配置。



## 🔧 配置说明#### 通过`.env`文件配置



### 模型配置### 3. 部署方式



系统支持多种大模型，通过环境变量配置：创建 `.env` 文件并配置以下环境变量：



- `LLM_MODEL_NAME`: 用于智能比对检测的大模型（默认: qwen-turbo）#### 🐳 方式一：Docker Compose（推荐）

- `EMBEDDING_MODEL_NAME`: 用于向量化的嵌入模型（默认: text-embedding-v4）

```bash

**支持的模型**:

- **通义千问**: qwen-max, qwen-plus, qwen-turbo```bash# OpenAI API配置

- **OpenAI**: gpt-4, gpt-3.5-turbo

- **自定义模型**: 通过兼容OpenAI API的服务# 一键部署OPENAI_API_KEY=your_api_key_here



### 性能调优docker compose up -dOPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1



- **文档分割**: 在 `document_processor.py` 中调整 `chunk_size` 和 `chunk_overlap`

- **聚类参数**: 在 `clustering_manager.py` 中调整 HDBSCAN 参数

- **并发控制**: 系统自动管理并发，避免资源冲突# 查看服务状态# 模型配置



## 📊 监控与日志docker compose psLLM_MODEL_NAME=qwen-turbo



### 日志系统EMBEDDING_MODEL_NAME=text-embedding-v4



#### 开发模式（单进程）# 查看日志

- 完整的实时日志输出

- 详细的调试信息docker compose logs -f```

- 支持热重载

```

```bash

# 查看实时日志### 3. 部署方式

tail -f logs/main.log

```#### 🐍 方式二：Python本地部署



#### 生产模式（多进程）#### 方式一：Docker Compose（推荐）

- 进程级别的日志分离

- 高性能日志写入```bash

- 日志聚合工具

# 创建虚拟环境```bash

```bash

# 实时聚合查看所有进程日志conda create -n DocuPrism python=3.12# 快速部署

python scripts/aggregate_logs.py --real-time

conda activate DocuPrism./scripts/deploy.sh

# 生成聚合日志文件

python scripts/aggregate_logs.py --type main --output aggregated.log

```

# 安装依赖# 或者手动部署

### LangSmith 追踪

pip install -r requirements.txtdocker compose up -d

系统集成 LangSmith 链路追踪，提供：

- 详细的执行时间分析```

- 模型调用链路可视化

- 性能瓶颈识别# 启动后端服务



## 🧪 测试python main.py#### 方式二：本地开发



### 运行测试



```bash# 另开终端启动前端（可选）```bash

# 运行复杂数据测试

python test/test_complex_data.pycd frontend# 安装依赖



# 使用Jupyter进行交互式测试npm installpip install -r requirements.txt

jupyter notebook notebook/test.ipynb

```npm run dev



### 测试场景```# 启动服务



- 学术论文重复检测python main.py

- 技术文档相似性分析

- 多语言内容检测#### ⚡ 方式三：多进程生产部署```

- 大规模文档处理



## 🐳 容器化部署

```bash### 4. 验证部署

### 构建镜像

# 设置多进程模式

```bash

# 构建生产镜像export WORKERS=4访问以下端点验证服务状态：

docker build -t zhihh/docuprism-ai:latest .

export ENV_MODE=production

# 推送到仓库（可选）

docker push zhihh/docuprism-ai:latest- 服务状态: <http://localhost:8000/>

```

# 启动服务- 健康检查: <http://localhost:8000/health>

### 生产部署

python main.py- API文档: <http://localhost:8000/docs>

```bash

# 生产环境部署

./scripts/deploy.sh --prod

# 使用日志聚合工具监控## 📖 API使用指南

# 开发环境部署

./scripts/deploy.sh --devpython scripts/aggregate_logs.py --real-time --type main

```

```### 文档智能比对接口

## 🔒 安全说明



- API密钥通过环境变量配置，避免硬编码

- 支持CORS配置，可根据需要限制访问源### 4. 验证部署**端点**: `POST /api/v2/analyze`

- 容器化运行，与主机环境隔离

- 支持HTTPS部署（需配置反向代理）



## 📈 性能指标访问以下端点验证服务状态：**请求格式**:



- **处理速度**: 单文档分析通常在2-5秒内完成

- **并发支持**: 支持多请求并发处理

- **内存使用**: 优化的内存管理，支持大文档处理- **API服务**: http://localhost:8000/```json

- **准确率**: 基于大模型的语义分析，准确率>90%

- **健康检查**: http://localhost:8000/health[

## 📄 许可证

- **API文档**: http://localhost:8000/docs  {

本项目采用 **Creative Commons Attribution-NonCommercial 4.0 International License** 许可证。

- **前端界面**: http://localhost:3000/ (如果启动了前端)    "documentId": 1,

### ⚠️ 重要声明：本项目禁止用于商业用途

    "page": 1,

**您可以**:

- ✅ **分享** — 在任何媒介或格式下复制并重新分发该项目## 📖 API使用指南    "content": "文档内容..."

- ✅ **改编** — 重新编译、转换和基于该项目进行创作

  },

**但必须遵循以下条件**:

- 📝 **署名** — 您必须给予适当的署名，提供指向许可协议的链接### 主要API端点  {

- 🚫 **非商业性使用** — 您不得将该项目用于商业目的

    "documentId": 2,

如需商业使用授权，请通过 GitHub Issues 联系项目维护者。

#### 1. 文档智能比对接口    "page": 1,

详情请参阅 [LICENSE](LICENSE) 文件。

    "content": "另一个文档内容..."

## 🤝 贡献指南

**端点**: `POST /api/v2/analyze`  }

1. Fork 项目

2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)]

3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)

4. 推送到分支 (`git push origin feature/AmazingFeature`)**请求格式**:```

5. 打开 Pull Request

```json

## 🆘 技术支持

[**响应格式**:

如有问题或建议，请通过以下方式联系：

  {

- 📝 [创建 Issue](https://github.com/zhihh/DocuPrism/issues)

- 📧 发送邮件至项目维护者    "documentId": 1,```json

- 📚 查看项目文档和示例

    "page": 1,{

### 相关文档

    "content": "文档内容..."  "success": true,

- [多进程部署指南](MULTIPROCESS_DEPLOYMENT.md)

- [API详细文档](http://localhost:8000/docs)  },  "message": "分析完成，发现 2 对问题内容",



---  {  "data": [



<div align="center">    "documentId": 2,    {



**DocuPrism AI - 让文档比对更智能** 🚀    "page": 1,      "documentId1": 1,



⭐ 如果这个项目对您有帮助，请给个Star支持！    "content": "另一个文档内容..."      "page1": 1,



</div>  }      "chunkId1": 0,

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
