# DocuPrism AI 前端使用指南

## ✅ 升级完成状态

### Node.js 环境
- **旧版本**: Node.js v12.22.9 (不支持现代前端工具)
- **新版本**: Node.js v20.19.5 + npm 10.8.2 ✅
- **升级方式**: 使用 NodeSource 官方源

### 前端状态
- **框架**: React 18.2.0 + TypeScript + Vite 5.4.20 ✅
- **UI库**: Tailwind CSS 3.3.6 + Lucide React + Headless UI ✅
- **开发服务器**: 运行在 http://localhost:3001/ ✅
- **API代理**: 配置代理到 http://localhost:8000 ✅

## 🚀 前端功能特性

### 核心功能
1. **文件上传**
   - 支持拖拽上传
   - 支持格式: TXT, MD, JSON
   - 文件大小限制: 10MB
   - 最多上传: 10个文件

2. **实时状态检测**
   - API连接状态监控
   - 自动重连机制
   - 健康检查显示

3. **分析功能**
   - 智能文档重复检测
   - 实时进度显示
   - 详细结果展示

4. **用户体验**
   - 响应式设计
   - 加载动画
   - 错误提示
   - 结果导出

### 技术架构
```
frontend/
├── src/
│   ├── components/          # UI组件
│   │   ├── FileUploader.tsx # 文件上传组件
│   │   ├── AnalysisResults.tsx # 结果展示
│   │   ├── ProgressBar.tsx  # 进度条
│   │   └── ...
│   ├── hooks/              # React Hooks
│   │   └── useAnalysis.ts  # 分析状态管理
│   ├── services/           # API服务
│   │   └── api.ts          # API客户端
│   ├── types/              # TypeScript类型
│   │   └── api.ts          # API数据类型
│   └── utils/              # 工具函数
│       ├── helpers.ts      # 通用工具
│       ├── validation.ts   # 验证函数
│       └── formatters.ts   # 格式化函数
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # Tailwind配置
└── package.json            # 依赖管理
```

## 🛠️ 使用方法

### 1. 启动前端服务器
```bash
cd /home/zhihh/dev/DocuPrism/frontend
npm run dev
```
- 服务地址: http://localhost:3001/
- 自动热重载 ✅
- 开发工具支持 ✅

### 2. 启动后端API服务器
```bash
cd /home/zhihh/dev/DocuPrism
source activate DocuPrism
python -m uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
```
- API地址: http://localhost:8000/
- 自动代理配置 ✅

### 3. 完整工作流程
1. **检查连接**: 前端自动检测API状态
2. **上传文档**: 拖拽或点击上传文件
3. **开始分析**: 点击"开始分析"按钮
4. **查看结果**: 实时显示分析进度和结果
5. **导出结果**: 可导出分析报告

## 🎯 API集成

### 健康检查
- **端点**: `GET /health`
- **用途**: 检测API服务状态
- **频率**: 页面加载时自动检查

### 文档分析
- **端点**: `POST /api/v2/analyze`
- **格式**: JSON数组格式
- **超时**: 5分钟
- **代理**: 前端自动代理到后端

### 错误处理
- 网络错误自动重试
- 用户友好的错误提示
- 详细的日志记录

## 📊 性能优化

### 前端优化
- **代码分割**: vendor/ui chunks
- **懒加载**: 组件按需加载
- **缓存**: 浏览器缓存优化
- **压缩**: 生产版本自动压缩

### 开发体验
- **TypeScript**: 完整类型支持
- **ESLint**: 代码质量检查
- **热重载**: 快速开发反馈
- **Source Maps**: 调试支持

## 🔧 配置说明

### 环境变量
```env
VITE_API_BASE_URL=http://localhost:8000  # API基础地址
```

### 代理配置 (vite.config.ts)
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

## ✅ 验证清单

- [x] Node.js 20.19.5 安装成功
- [x] npm 10.8.2 正常工作
- [x] 前端依赖安装完成
- [x] 开发服务器启动成功 (端口3001)
- [x] TypeScript 编译正常
- [x] Tailwind CSS 样式加载
- [x] API代理配置正确
- [x] React组件渲染正常
- [x] 文件上传功能就绪
- [x] API连接检测工作

## 🎉 总结

前端已经完全可用！现在可以：

1. **正常开发**: 使用现代前端工具链
2. **完整功能**: 文件上传、分析、结果展示
3. **良好体验**: 响应式设计、实时反馈
4. **稳定运行**: 完整的错误处理和状态管理

前后端已经完全联通，可以进行端到端的文档查重分析！

---
生成时间: 2025-09-17 16:38
版本: Node.js 20.19.5 + React 18.2.0