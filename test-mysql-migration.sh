#!/bin/bash

# 本地测试 MySQL 迁移脚本
# 使用方法: ./test-mysql-migration.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "=========================================="
echo "  本地 MySQL 迁移测试"
echo "=========================================="
echo ""

# 1. 停止旧服务
info "1. 停止现有服务..."
docker compose down
echo ""

# 2. 清理旧数据（可选）
read -p "是否删除旧的PostgreSQL数据？[y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    warn "删除旧数据卷..."
    docker volume rm nwpushare_postgres_data 2>/dev/null || true
    info "已删除PostgreSQL数据"
fi
echo ""

# 3. 检查环境变量
info "3. 检查环境变量文件..."
if [ ! -f .env ]; then
    warn ".env 不存在，从 .env.production 复制..."
    cp .env.production .env
    warn "请编辑 .env 文件，设置MySQL密码"
    read -p "按回车继续..."
else
    info ".env 文件已存在"
fi
echo ""

# 4. 启动MySQL和Redis
info "4. 启动MySQL和Redis..."
docker compose up -d mysql redis
info "等待MySQL启动（15秒）..."
sleep 15
echo ""

# 5. 检查MySQL状态
info "5. 检查MySQL状态..."
if docker compose exec -T mysql mysqladmin ping -h localhost -u root -proot_password &>/dev/null; then
    info "✅ MySQL已就绪"
else
    error "❌ MySQL启动失败"
    docker compose logs mysql
    exit 1
fi
echo ""

# 6. 运行Prisma迁移
info "6. 生成Prisma客户端..."
pnpm prisma generate
echo ""

info "7. 推送数据库模式..."
pnpm prisma db push --accept-data-loss
echo ""

# 7. 构建并启动应用
info "8. 构建并启动应用..."
docker compose up -d --build app
echo ""

# 8. 等待应用启动
info "等待应用启动（10秒）..."
sleep 10
echo ""

# 9. 检查服务状态
info "9. 检查服务状态..."
docker compose ps
echo ""

# 10. 测试健康检查
info "10. 测试应用健康检查..."
if curl -f http://localhost:3000/api/health &>/dev/null; then
    info "✅ 应用健康检查通过"
else
    warn "⚠️  健康检查失败，查看日志..."
    docker compose logs --tail=20 app
fi
echo ""

# 11. 测试数据库连接
info "11. 测试数据库连接..."
if docker compose exec -T mysql mysql -u nwpushare -pnwpushare_password -e "USE nwpushare; SELECT 1;" &>/dev/null; then
    info "✅ 数据库连接成功"
else
    error "❌ 数据库连接失败"
fi
echo ""

# 12. 验证表结构
info "12. 验证表结构..."
docker compose exec -T mysql mysql -u nwpushare -pnwpushare_password -e "USE nwpushare; SHOW TABLES;" 2>/dev/null | grep -q "course" && info "✅ 数据库表已创建" || warn "⚠️  未找到表"
echo ""

echo "=========================================="
echo "  测试完成！"
echo "=========================================="
echo ""
echo "访问: http://localhost:3000"
echo ""
echo "常用命令:"
echo "  docker compose logs -f app    # 查看应用日志"
echo "  docker compose ps             # 查看服务状态"
echo "  docker compose down           # 停止所有服务"
echo ""
