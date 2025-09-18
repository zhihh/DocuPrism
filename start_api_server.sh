#!/bin/bash

# DocuPrism API服务器启动脚本
# 用于配合GitHub Pages前端部署使用

echo "🚀 启动DocuPrism API服务器..."

# 检查Python环境
if ! command -v python &> /dev/null; then
    echo "❌ 错误: 未找到Python，请先安装Python 3.8+"
    exit 1
fi

# 检查依赖
if [ ! -f "requirements.txt" ]; then
    echo "❌ 错误: 未找到requirements.txt文件"
    exit 1
fi

# 安装依赖（可选）
if [ "$1" = "--install" ]; then
    echo "📦 安装Python依赖..."
    pip install -r requirements.txt
fi

# 检查主程序
if [ ! -f "main.py" ]; then
    echo "❌ 错误: 未找到main.py文件"
    exit 1
fi

# 设置环境变量
export PYTHONPATH=$(pwd):$PYTHONPATH

# 启动API服务器
echo "🌐 启动API服务器 (端口: 8000)"
echo "📋 健康检查: http://localhost:8000/health"
echo "🔍 API文档: http://localhost:8000/docs"
echo "⏹️  停止服务: Ctrl+C"
echo ""
echo "🎯 前端配置: 在GitHub Pages中将API地址设置为 http://localhost:8000"
echo ""

# 启动服务
python main.py

echo ""
echo "👋 API服务器已停止"