# DocuPrism Deploy 分支使用说明

## 概述

Deploy分支是专门为GitHub Pages部署设计的分支，支持动态配置外部API服务器地址，实现完整的前后端功能。

## 功能特性

### 🚀 GitHub Pages部署
- 自动构建和部署到GitHub Pages
- 只在deploy分支推送时触发CI/CD
- 生成优化的静态资源文件

### 🔧 动态API配置
- 运行时配置API服务器地址
- 支持预设常用地址
- 保存历史记录到localStorage
- 连接状态实时检测

### 📦 完整功能支持
- 文档上传和分析
- AI语义相似度比较
- 结果可视化展示
- 多种文档格式支持

## 部署架构

```
GitHub Pages (静态前端)
    ↓ HTTPS API调用
外部API服务器 (FastAPI后端)
    ↓ 处理请求
AI模型服务 (文档分析)
```

## 使用步骤

### 1. 部署前端到GitHub Pages

1. 推送代码到deploy分支：
```bash
git checkout deploy
git push origin deploy
```

2. 在GitHub仓库设置中启用Pages：
   - 进入 Settings > Pages
   - Source选择 "GitHub Actions"
   - 等待部署完成

3. 访问部署的网站：
   - URL: `https://zhihh.github.io/DocuPrism/`

### 2. 配置API服务器

#### 方式一：本地开发服务器
```bash
# 在项目根目录启动后端服务
python main.py
# 前端配置API地址为: http://localhost:8000
```

#### 方式二：云服务器部署
```bash
# 在云服务器上部署API服务
# 前端配置API地址为: https://your-server.com:8000
```

### 3. 配置前端API地址

1. 打开部署的网站
2. 点击右上角的"设置"图标
3. 在API配置面板中：
   - 输入你的API服务器地址
   - 或选择预设地址
   - 点击"测试"验证连接
   - 点击"保存"应用配置

## API服务器要求

### 必需的接口

```
GET  /health          # 健康检查
GET  /                # 服务状态
POST /upload          # 文件上传
POST /analyze         # 文档分析
```

### CORS配置

API服务器需要配置CORS以允许GitHub Pages访问：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://zhihh.github.io"],  # GitHub Pages域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### SSL证书

推荐使用HTTPS以确保安全性，特别是在生产环境中。

## 预设API地址

系统内置以下预设地址：

- `http://localhost:8000` - 本地开发
- `http://127.0.0.1:8000` - 本地开发(备用)
- `https://api.docuprism.com` - 生产API(示例)
- `https://your-server.com:8000` - 自定义服务器(示例)

## 配置持久化

- API配置自动保存到浏览器localStorage
- 支持多个历史地址记录
- 页面刷新后配置保持

## 故障排除

### 1. API连接失败
- 检查API服务器是否正常运行
- 验证API地址格式是否正确
- 确认CORS配置是否正确
- 检查防火墙和网络设置

### 2. 部署失败
- 检查GitHub Actions日志
- 确认deploy分支代码无误
- 验证构建过程是否成功

### 3. 功能异常
- 确认API服务器所有接口正常
- 检查浏览器控制台错误信息
- 验证文件格式是否支持

## 开发说明

### 分支管理
- `main`: 主开发分支
- `deploy`: 部署专用分支，仅用于GitHub Pages

### 工作流程
1. 在main分支进行开发
2. 功能完成后合并到deploy分支
3. 推送deploy分支触发自动部署

### 本地测试
```bash
# 前端开发服务器
cd frontend
npm run dev

# 后端API服务器
python main.py
```

## 安全注意事项

1. **API密钥管理**: 不要在前端代码中硬编码API密钥
2. **HTTPS使用**: 生产环境必须使用HTTPS
3. **CORS限制**: 严格限制允许的源域名
4. **输入验证**: API服务器必须验证所有输入

## 支持

如遇问题，请检查：
1. GitHub Actions构建日志
2. 浏览器开发者工具
3. API服务器日志
4. 网络连接状态

更多技术支持，请参考项目文档或提交Issue。Deploy branch ready for GitHub Pages deployment with dynamic API configuration
