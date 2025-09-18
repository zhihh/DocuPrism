"""
Backend文档预处理模块测试脚本
"""

import sys
import os
from pathlib import Path
import tempfile
import json

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# 确保backend模块在路径中
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

def test_text_processing():
    """测试文本文件处理"""
    print("🧪 测试文本文件处理...")
    
    try:
        from backend.processors.document_processor import DocumentProcessor
        
        # 创建测试文件
        test_content = """这是第一段测试内容。
包含多行文本。

这是第二段测试内容。
用于验证段落分割功能。

第三段包含一些专业术语，如人工智能、机器学习、深度学习等。"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write(test_content)
            temp_path = f.name
        
        # 初始化处理器（不启用OCR）
        processor = DocumentProcessor(enable_ocr=False)
        
        # 处理文档
        result = processor.process_file(temp_path)
        
        print(f"✅ 文本处理成功:")
        print(f"   - 文档ID: {result.document_id}")
        print(f"   - 文档类型: {result.document_type.value}")
        print(f"   - 总页数: {result.total_pages}")
        print(f"   - 总字符数: {result.total_text_length}")
        print(f"   - 文本块数量: {len(result.all_text_blocks)}")
        print(f"   - 处理耗时: {result.processing_time:.3f}秒")
        
        # 显示文本块
        for i, block in enumerate(result.all_text_blocks[:3]):  # 只显示前3个
            print(f"   - 块{i+1}: {block.text[:50]}...")
        
        # 清理临时文件
        os.unlink(temp_path)
        
        return True
        
    except Exception as e:
        print(f"❌ 文本处理测试失败: {e}")
        return False

def test_json_processing():
    """测试JSON文件处理"""
    print("\n🧪 测试JSON文件处理...")
    
    try:
        from backend.processors.document_processor import DocumentProcessor
        
        # 创建测试JSON
        test_data = {
            "title": "测试文档",
            "content": "这是JSON格式的测试内容",
            "metadata": {
                "author": "测试用户",
                "created": "2025-01-01"
            },
            "items": [
                {"name": "项目1", "description": "第一个测试项目"},
                {"name": "项目2", "description": "第二个测试项目"}
            ]
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
            json.dump(test_data, f, ensure_ascii=False, indent=2)
            temp_path = f.name
        
        # 处理JSON文档
        processor = DocumentProcessor(enable_ocr=False)
        result = processor.process_file(temp_path)
        
        print(f"✅ JSON处理成功:")
        print(f"   - 文档类型: {result.document_type.value}")
        print(f"   - 字符数: {result.total_text_length}")
        print(f"   - 处理耗时: {result.processing_time:.3f}秒")
        
        # 清理临时文件
        os.unlink(temp_path)
        
        return True
        
    except Exception as e:
        print(f"❌ JSON处理测试失败: {e}")
        return False

def test_api_integration():
    """测试API集成"""
    print("\n🧪 测试API集成...")
    
    try:
        from fastapi import FastAPI
        from backend.integration import integrate_document_processing
        
        # 创建测试应用
        app = FastAPI()
        
        # 集成文档处理功能
        doc_api = integrate_document_processing(app, enable_ocr=False)
        
        if doc_api:
            print("✅ API集成成功")
            return True
        else:
            print("⚠️ API集成跳过（依赖缺失）")
            return False
            
    except Exception as e:
        print(f"❌ API集成测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 Backend文档预处理模块测试")
    print("=" * 50)
    
    results = []
    
    # 运行各项测试
    results.append(test_text_processing())
    results.append(test_json_processing())
    results.append(test_api_integration())
    
    print("\n" + "=" * 50)
    print("📊 测试结果汇总:")
    
    passed = sum(results)
    total = len(results)
    
    print(f"   通过: {passed}/{total}")
    
    if passed == total:
        print("🎉 所有测试通过！")
        print("\n📋 下一步操作:")
        print("1. 安装依赖包: pip install -r backend/requirements.txt")
        print("2. 在main.py中集成backend模块")
        print("3. 测试完整功能")
    else:
        print("⚠️ 部分测试失败，请检查依赖安装")
        print("\n🔧 安装命令:")
        print("pip install pdfplumber PyPDF2 python-docx paddleocr paddlepaddle Pillow")

if __name__ == "__main__":
    main()