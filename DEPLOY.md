# NWPUShare Docker 部署指南

> 本文档提供基于 Docker 的生产环境部署方案，包含完整的步骤说明和持续更新流程。

## 📋 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [数据库初始化](#数据库初始化)
- [反向代理配置](#反向代理配置)
- [持续更新](#持续更新)
- [常见问题](#常见问题)

---

## 环境要求

### 服务器配置
- **CPU**: 2核心以上
- **内存**: 4GB 以上（推荐 8GB）
- **磁盘**: 20GB 以上可用空间
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### 软件依赖
- Docker 20.10+
- Docker Compose 2.0+

---

## 快速开始

```bash
# 1. 克隆项目
git clone <your-repo-url> nwpushare
cd nwpushare

# 2. 配置环境变量
cp .env.example .env
nano .env  # 修改配置

# 3. 启动服务
docker-compose up -d

# 4. 初始化数据库
docker-compose exec app pnpm prisma db push

# 5. 创建管理员
docker-compose exec app pnpm grant:admin
```

访问 `http://your-server-ip:3000` 即可看到网站。

---

## 详细部署步骤

### 步骤 1：安装 Docker 和 Docker Compose

**Ubuntu/Debian:**
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo apt install docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

**CentOS/RHEL:**
```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 步骤 2：克隆项目

```bash
# 克隆到服务器
cd /opt  # 或其他你喜欢的目录
git clone <your-repo-url> nwpushare
cd nwpushare
```

### 步骤 3：配置环境变量

```bash
# 复制配置文件
cp .env.example .env

# 编辑配置
nano .env  # 或使用 vim
```

#### 必须修改的配置项

```bash
# ===== 数据库配置 =====
TOKI_DATABASE_URL="mysql://nwpushare:your_password@mysql:3306/nwpushare"

# ===== JWT 密钥（必须修改！）=====
# 使用以下命令生成随机密钥
# openssl rand -base64 32
JWT_SECRET="YOUR_RANDOM_JWT_SECRET_HERE"

# ===== 站点地址 =====
NEXT_PUBLIC_NWPUSHARE_ADDRESS_PROD="https://your-domain.com"
TOKI_NWPUSHARE_SITE_URL="https://your-domain.com"

# ===== 邮件配置（必需，使用 Resend）=====
RESEND_API_KEY="re_your_api_key_here"
# 开发环境可用: onboarding@resend.dev
# 生产环境需要自己的域名，并在 Resend 中验证域名
RESEND_FROM_EMAIL="NWPUShare <noreply@your-domain.com>"

# ===== S3 存储配置（必需）=====
TOKI_NWPUSHARE_S3_STORAGE_ACCESS_KEY_ID="your-access-key"
TOKI_NWPUSHARE_S3_STORAGE_SECRET_ACCESS_KEY="your-secret-key"
TOKI_NWPUSHARE_S3_STORAGE_BUCKET_NAME="your-bucket"
TOKI_NWPUSHARE_S3_STORAGE_ENDPOINT="s3.amazonaws.com"
TOKI_NWPUSHARE_S3_STORAGE_REGION="us-east-1"
NEXT_PUBLIC_TOKI_NWPUSHARE_S3_STORAGE_URL="https://your-cdn.com"

# ===== 图床配置（必需）=====
TOKI_NWPUSHARE_IMAGE_BED_HOST="your-image-cdn.com"
TOKI_NWPUSHARE_IMAGE_BED_URL="https://your-image-cdn.com"

# ===== 运行环境 =====
NODE_ENV="production"
```

#### Docker Compose 专用配置

编辑 `.env` 文件，添加 Docker Compose 需要的变量：

```bash
# MySQL 数据库配置（docker-compose.yml 使用）
MYSQL_DATABASE=nwpushare
MYSQL_USER=nwpushare
MYSQL_PASSWORD=your_strong_password_here
MYSQL_ROOT_PASSWORD=your_root_password_here

# Redis 端口
REDIS_PORT=6379

# 应用端口
APP_PORT=3000
```

### 步骤 4：生成 JWT 密钥

```bash
# 生成强随机密钥
openssl rand -base64 32

# 将生成的密钥复制到 .env 文件的 JWT_SECRET
```

### 步骤 5：启动服务

```bash
# 构建并启动所有容器（首次部署）
docker-compose up -d --build

# 查看启动日志
docker-compose logs -f app

# 检查容器状态
docker-compose ps
```

**预期输出：**
```
NAME                  STATUS          PORTS
nwpushare-app         Up 2 minutes    0.0.0.0:3000->3000/tcp
nwpushare-db          Up 2 minutes    0.0.0.0:3306->3306/tcp
nwpushare-redis       Up 2 minutes    0.0.0.0:6379->6379/tcp
```

---

## 数据库初始化

### 方法 1：使用 Prisma Push（推荐）

```bash
# 推送数据库结构
docker-compose exec app pnpm prisma db push

# 查看数据库状态
docker-compose exec app pnpm prisma db pull
```

### 方法 2：使用 Prisma Migrate

```bash
# 生成迁移文件
docker-compose exec app pnpm prisma migrate deploy
```

### 创建管理员账号

```bash
# 交互式创建管理员
docker-compose exec app pnpm grant:admin

# 按提示输入：
# - 邮箱地址
# - 角色等级（通常选 4 = 超级管理员）
```

### 导入课程数据（可选）

```bash
# 如果你有课程种子数据
docker-compose exec app pnpm seed:courses
```

---

## 反向代理配置

### 使用 Nginx

安装 Nginx：
```bash
sudo apt install nginx
```

创建配置文件 `/etc/nginx/sites-available/nwpushare`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 强制 HTTPS（可选）
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书（Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 客户端上传限制
    client_max_body_size 50M;

    # 代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # 图片资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

启用配置：
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/nwpushare /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 申请 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 自动配置 SSL
sudo certbot --nginx -d your-domain.com

# 自动续期（测试）
sudo certbot renew --dry-run
```

---

## 持续更新

### 方法 1：标准更新流程（推荐）

```bash
# 1. 进入项目目录
cd /opt/nwpushare

# 2. 备份当前配置和数据库
cp .env .env.backup.$(date +%Y%m%d)
docker-compose exec mysql mysqldump -u nwpushare -p nwpushare > backup_$(date +%Y%m%d).sql

# 3. 拉取最新代码
git pull origin master

# 4. 停止服务
docker-compose down

# 5. 重新构建镜像
docker-compose build --no-cache

# 6. 启动服务
docker-compose up -d

# 7. 数据库迁移（如有新字段）
docker-compose exec app pnpm prisma db push

# 8. 查看日志确认无误
docker-compose logs -f app
```

### 方法 2：无停机更新（零宕机）

```bash
# 1. 拉取代码
cd /opt/nwpushare
git pull origin master

# 2. 构建新镜像
docker-compose build app

# 3. 滚动更新
docker-compose up -d --no-deps --build app

# 4. 数据库迁移
docker-compose exec app pnpm prisma db push
```

### 方法 3：一键更新脚本

创建 `update.sh`：

```bash
#!/bin/bash
set -e

echo "🚀 开始更新 NWPUShare..."

# 备份
echo "📦 备份配置和数据库..."
cp .env .env.backup.$(date +%Y%m%d)
docker-compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} nwpushare > backup_$(date +%Y%m%d).sql

# 拉取代码
echo "📥 拉取最新代码..."
git pull origin master

# 重新构建
echo "🔨 重新构建镜像..."
docker-compose build --no-cache

# 重启服务
echo "🔄 重启服务..."
docker-compose down
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 数据库迁移
echo "🗄️ 执行数据库迁移..."
docker-compose exec -T app pnpm prisma db push

# 检查状态
echo "✅ 检查服务状态..."
docker-compose ps

echo "🎉 更新完成！"
```

使用方法：
```bash
# 赋予执行权限
chmod +x update.sh

# 执行更新
./update.sh
```

---

## 日常维护

### 查看日志

```bash
# 查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f mysql

# 查看 Redis 日志
docker-compose logs -f redis

# 查看最近 100 行日志
docker-compose logs --tail=100 app
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启单个服务
docker-compose restart app

# 完全停止并重新启动
docker-compose down && docker-compose up -d
```

### 进入容器

```bash
# 进入应用容器
docker-compose exec app sh

# 进入数据库容器
docker-compose exec mysql mysql -u root -p

# 进入 Redis 容器
docker-compose exec redis redis-cli
```

### 数据库备份

**手动备份：**
```bash
# 备份数据库
docker-compose exec mysql mysqldump -u root -p nwpushare > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker-compose exec -T mysql mysql -u root -p nwpushare < backup_20250101.sql
```

**自动备份脚本 `backup.sh`：**
```bash
#!/bin/bash
BACKUP_DIR="/opt/nwpushare/backups"
mkdir -p $BACKUP_DIR

# 备份数据库
cd /opt/nwpushare
docker-compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} nwpushare | gzip > $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz

# 保留最近 7 天的备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz"
```

**设置定时备份（crontab）：**
```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * /opt/nwpushare/backup.sh >> /var/log/nwpushare-backup.log 2>&1
```

### 清理空间

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 一键清理所有
docker system prune -a --volumes
```

---

## 常见问题

### 1. 容器启动失败

**检查日志：**
```bash
docker-compose logs app
```

**常见原因：**
- 环境变量配置错误（检查 `.env` 文件）
- 端口被占用（修改 `docker-compose.yml` 中的端口）
- 数据库未就绪（等待 MySQL 健康检查通过）

### 2. 数据库连接失败

**检查数据库状态：**
```bash
docker-compose exec mysql mysql -u root -p -e "SELECT 1"
```

**解决方法：**
- 确认 `TOKI_DATABASE_URL` 格式正确
- 确认数据库用户名密码正确
- 检查 MySQL 容器是否正常运行：`docker-compose ps mysql`

### 3. Redis 连接失败

**检查 Redis 状态：**
```bash
docker-compose exec redis redis-cli ping
```

**解决方法：**
- 确认 `REDIS_HOST=redis`（不是 127.0.0.1）
- 确认 Redis 容器正常运行

### 4. 图片或静态资源无法访问

**检查配置：**
- 确认 `TOKI_NWPUSHARE_IMAGE_BED_HOST` 已配置
- 确认 `next.config.ts` 中的 `images.remotePatterns` 正确

### 5. 邮件发送失败

**检查日志：**
```bash
docker-compose logs app | grep -i email
```

**常见原因：**
- SMTP 配置错误
- Gmail 需要开启"应用专用密码"
- 防火墙阻止 SMTP 端口（587/465）

**解决方法：**
- 开发环境可设置 `KUN_DISABLE_EMAIL=true` 跳过邮件
- 使用 Resend 等第三方服务替代 SMTP

### 6. 构建镜像失败

**清理缓存重试：**
```bash
docker-compose build --no-cache
```

**检查磁盘空间：**
```bash
df -h
```

### 7. 应用内存溢出

**调整 PM2 配置：**

编辑 `ecosystem.config.cjs`：
```javascript
max_memory_restart: '2G',  // 改为 2GB
instances: 5,  // 减少实例数
```

**重新构建：**
```bash
docker-compose down
docker-compose up -d --build
```

---

## 性能优化

### 1. 数据库优化

编辑 `docker-compose.yml`，为 MySQL 添加配置：

```yaml
mysql:
  command: >
    --default-authentication-plugin=mysql_native_password
    --character-set-server=utf8mb4
    --collation-server=utf8mb4_unicode_ci
    --innodb-buffer-pool-size=512M
    --max-connections=200
```

### 2. Redis 持久化优化

```yaml
redis:
  command: redis-server --appendonly yes --appendfsync everysec --maxmemory 256mb
```

### 3. 应用并发优化

修改 `ecosystem.config.cjs`：
```javascript
instances: 'max',  // 使用所有 CPU 核心
max_memory_restart: '1G',
```

---

## 监控和告警

### 使用 Portainer（推荐）

```bash
# 安装 Portainer
docker volume create portainer_data
docker run -d -p 9000:9000 -p 9443:9443 --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

访问 `http://your-server-ip:9000` 即可管理 Docker 容器。

---

## 安全加固

### 1. 防火墙配置

```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. 限制数据库访问

修改 `docker-compose.yml`，移除 MySQL 端口暴露：
```yaml
mysql:
  # ports:  # 注释掉，不对外暴露
  #   - "3306:3306"
```

### 3. 定期更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 回滚到之前版本

```bash
# 1. 查看提交历史
git log --oneline

# 2. 回滚到指定版本
git checkout <commit-hash>

# 3. 重新构建
docker-compose down
docker-compose up -d --build

# 4. 恢复数据库（如需要）
docker-compose exec -T mysql mysql -u root -p nwpushare < backup_20250101.sql
```

---

## 技术支持

- **Issues**: https://github.com/your-repo/issues
- **文档**: https://your-docs-site.com
- **邮箱**: admin@nwpushare.com

---

**最后更新**: 2025-12-20
