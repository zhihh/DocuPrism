#!/usr/bin/env python3
"""
多进程日志聚合工具
将各个worker进程的日志合并为统一视图
"""

import os
import glob
import re
from datetime import datetime
from typing import List, Dict, Tuple
import argparse


class LogAggregator:
    """日志聚合器"""
    
    def __init__(self, logs_dir: str = "logs"):
        self.logs_dir = logs_dir
        self.timestamp_pattern = re.compile(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})')
    
    def parse_log_line(self, line: str) -> Tuple[datetime, str]:
        """解析日志行，提取时间戳"""
        match = self.timestamp_pattern.match(line.strip())
        if match:
            timestamp_str = match.group(1)
            timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
            return timestamp, line.strip()
        return datetime.min, line.strip()
    
    def collect_worker_logs(self, log_type: str = "main") -> List[Tuple[datetime, str]]:
        """收集所有worker的日志"""
        pattern = os.path.join(self.logs_dir, f"{log_type}_worker_*.log")
        log_files = glob.glob(pattern)
        
        if not log_files:
            print(f"⚠️ 没有找到匹配的日志文件: {pattern}")
            return []
        
        all_logs = []
        
        for log_file in log_files:
            worker_id = re.search(r'worker_(\d+)', log_file)
            worker_name = f"Worker-{worker_id.group(1)}" if worker_id else "Unknown"
            
            try:
                with open(log_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        if line.strip():
                            timestamp, content = self.parse_log_line(line)
                            # 在每行前添加worker标识
                            marked_content = content.replace(f"PID-{worker_id.group(1)}", worker_name) if worker_id else content
                            all_logs.append((timestamp, marked_content))
            except Exception as e:
                print(f"❌ 读取日志文件失败 {log_file}: {e}")
        
        # 按时间戳排序
        all_logs.sort(key=lambda x: x[0])
        return all_logs
    
    def aggregate_logs(self, log_type: str = "main", output_file: str = None):
        """聚合日志并输出"""
        print(f"🔄 开始聚合 {log_type} 日志...")
        
        logs = self.collect_worker_logs(log_type)
        
        if not logs:
            print("❌ 没有找到任何日志数据")
            return
        
        if output_file:
            output_path = os.path.join(self.logs_dir, output_file)
            with open(output_path, 'w', encoding='utf-8') as f:
                for timestamp, content in logs:
                    f.write(content + '\n')
            print(f"✅ 聚合日志已保存到: {output_path}")
        else:
            # 输出到控制台
            for timestamp, content in logs:
                print(content)
        
        print(f"📊 总计处理 {len(logs)} 条日志记录")
    
    def real_time_aggregate(self, log_type: str = "main"):
        """实时聚合日志（简化版本）"""
        import time
        
        print(f"🔄 开始实时监控 {log_type} 日志...")
        print("按 Ctrl+C 停止监控")
        
        last_positions = {}
        
        try:
            while True:
                pattern = os.path.join(self.logs_dir, f"{log_type}_worker_*.log")
                log_files = glob.glob(pattern)
                
                new_logs = []
                
                for log_file in log_files:
                    try:
                        # 记录上次读取位置
                        if log_file not in last_positions:
                            last_positions[log_file] = 0
                        
                        with open(log_file, 'r', encoding='utf-8') as f:
                            f.seek(last_positions[log_file])
                            new_lines = f.readlines()
                            last_positions[log_file] = f.tell()
                            
                            worker_id = re.search(r'worker_(\d+)', log_file)
                            worker_name = f"Worker-{worker_id.group(1)}" if worker_id else "Unknown"
                            
                            for line in new_lines:
                                if line.strip():
                                    timestamp, content = self.parse_log_line(line)
                                    marked_content = content.replace(f"PID-{worker_id.group(1)}", worker_name) if worker_id else content
                                    new_logs.append((timestamp, marked_content))
                    
                    except Exception as e:
                        print(f"❌ 读取日志文件失败 {log_file}: {e}")
                
                # 排序并输出新日志
                new_logs.sort(key=lambda x: x[0])
                for timestamp, content in new_logs:
                    print(content)
                
                time.sleep(1)  # 1秒检查一次
                
        except KeyboardInterrupt:
            print("\n✅ 停止实时监控")
    
    def list_available_logs(self):
        """列出可用的日志文件"""
        print("📋 可用的日志文件:")
        
        patterns = ["main_worker_*.log", "api_access_worker_*.log", "document_processing_worker_*.log", "error_worker_*.log"]
        
        for pattern in patterns:
            files = glob.glob(os.path.join(self.logs_dir, pattern))
            if files:
                log_type = pattern.replace("_worker_*.log", "")
                print(f"  📁 {log_type}: {len(files)} 个worker文件")
                for f in sorted(files):
                    size = os.path.getsize(f) / 1024  # KB
                    print(f"    - {os.path.basename(f)} ({size:.1f} KB)")
            else:
                log_type = pattern.replace("_worker_*.log", "")
                print(f"  📁 {log_type}: 无worker文件")


def main():
    parser = argparse.ArgumentParser(description='多进程日志聚合工具')
    parser.add_argument('--logs-dir', default='logs', help='日志目录路径')
    parser.add_argument('--type', default='main', choices=['main', 'api_access', 'document_processing', 'error'], 
                       help='日志类型')
    parser.add_argument('--output', help='输出文件名')
    parser.add_argument('--real-time', action='store_true', help='实时监控模式')
    parser.add_argument('--list', action='store_true', help='列出可用日志文件')
    
    args = parser.parse_args()
    
    aggregator = LogAggregator(args.logs_dir)
    
    if args.list:
        aggregator.list_available_logs()
    elif args.real_time:
        aggregator.real_time_aggregate(args.type)
    else:
        aggregator.aggregate_logs(args.type, args.output)


if __name__ == "__main__":
    main()