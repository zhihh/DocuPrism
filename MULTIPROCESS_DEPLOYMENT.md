# DocuPrism 多进程部署指南

## 🚀 运行模式

### 1. 开发模式（单进程）
```bash
# 完整详细日志，实时输出
export WORKERS=1
export ENV_MODE=development
python main.py
```

**特点**：
- ✅ 完整的实时日志输出  
- ✅ 详细的调试信息
- ✅ 支持热重载
- ✅ 易于调试和开发

**日志文件**：
- `logs/main.log` - 主日志
- `logs/error.log` - 错误日志
- `logs/api_access.log` - API访问日志

### 2. 生产模式（多进程）
```bash
# 高性能多进程部署
export WORKERS=4
export ENV_MODE=production
python main.py
```

**特点**：
- 🚀 高并发处理能力
- 📊 每个进程独立日志
- 🔧 负载均衡
- 💪 容错性强

**日志文件**：
- `logs/main_worker_12345.log` - 进程12345的主日志
- `logs/main_worker_12346.log` - 进程12346的主日志
- `logs/api_access_worker_12345.log` - 进程12345的API日志
- `logs/error_worker_12345.log` - 进程12345的错误日志

## 📋 多进程日志管理

### 实时查看聚合日志
```bash
# 实时监控所有worker的主日志
cd scripts
python aggregate_logs.py --real-time --type main

# 实时监控API访问日志
python aggregate_logs.py --real-time --type api_access
```

### 生成聚合日志文件
```bash
# 聚合所有worker的主日志到一个文件
python aggregate_logs.py --type main --output aggregated_main.log

# 聚合错误日志
python aggregate_logs.py --type error --output aggregated_errors.log
```

### 查看可用日志文件
```bash
python aggregate_logs.py --list
```

## 🛠️ 生产环境部署建议

### 1. 使用 systemd 服务
创建 `/etc/systemd/system/docuprism.service`：
```ini
[Unit]
Description=DocuPrism AI Document Analysis Service
After=network.target

[Service]
Type=exec
User=docuprism
WorkingDirectory=/opt/docuprism
Environment=WORKERS=4
Environment=ENV_MODE=production
Environment=PYTHONPATH=/opt/docuprism
ExecStart=/opt/docuprism/venv/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### 2. 使用 Docker 部署
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

ENV WORKERS=4
ENV ENV_MODE=production

EXPOSE 8000
CMD ["python", "main.py"]
```

### 3. 使用 nginx 反向代理
```nginx
upstream docuprism {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://docuprism;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 日志监控与分析

### 1. 使用 ELK Stack
```yaml
# docker-compose.yml
version: '3'
services:
  elasticsearch:
    image: elastic/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
    
  logstash:
    image: elastic/logstash:7.14.0
    volumes:
      - ./logs:/logs:ro
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    
  kibana:
    image: elastic/kibana:7.14.0
    ports:
      - "5601:5601"
```

### 2. 使用 Grafana + Loki
```yaml
version: '3'
services:
  loki:
    image: grafana/loki:2.8.0
    command: -config.file=/etc/loki/local-config.yaml
    
  promtail:
    image: grafana/promtail:2.8.0
    volumes:
      - ./logs:/logs:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    
  grafana:
    image: grafana/grafana:9.5.0
    ports:
      - "3000:3000"
```

## 🔧 性能调优

### worker数量建议
```bash
# CPU密集型任务
export WORKERS=$(nproc)

# I/O密集型任务（推荐）
export WORKERS=$(($(nproc) * 2))

# 内存限制的情况
export WORKERS=2
```

### 日志轮转配置
```bash
# 配置 logrotate
cat > /etc/logrotate.d/docuprism << EOF
/opt/docuprism/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 docuprism docuprism
}
EOF
```

## 🚨 故障排查

### 1. 检查worker进程状态
```bash
ps aux | grep "python main.py"
```

### 2. 检查日志错误
```bash
# 查看最新错误
python scripts/aggregate_logs.py --type error | tail -50

# 查看特定worker的日志
tail -f logs/main_worker_*.log
```

### 3. 监控资源使用
```bash
# 监控内存使用
top -p $(pgrep -f "python main.py" | tr '\n' ',' | sed 's/,$//')

# 监控文件句柄
lsof -p $(pgrep -f "python main.py")
```