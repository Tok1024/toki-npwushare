#!/bin/bash

# NWPUShare Docker 快速部署脚本
# 使用方法: ./deploy.sh [init|start|stop|restart|update|backup|logs]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker"
    fi

    if ! command -v docker compose &> /dev/null; then
        error "Docker Compose 未安装，请先安装 Docker Compose"
    fi

    info "Docker 环境检查通过"
}

# 检查环境变量文件
check_env() {
    if [ ! -f .env ]; then
        if [ -f .env.production ]; then
            warn ".env 文件不存在，从 .env.production 复制..."
            cp .env.production .env
            warn "请编辑 .env 文件，修改必要的配置项"
            warn "特别是数据库密码和JWT密钥！"
            read -p "按回车继续..."
        else
            error ".env 和 .env.production 文件都不存在"
        fi
    fi
    info "环境变量文件检查通过"
}

# 初始化部署
init_deploy() {
    info "开始初始化部署..."

    check_docker
    check_env

    # 启动数据库和Redis
    info "启动数据库和Redis..."
    docker compose up -d mysql redis

    # 等待数据库启动
    info "等待数据库启动..."
    sleep 10

    # 检查数据库状态
    if docker compose exec -T mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD:-root_password} > /dev/null 2>&1; then
        info "数据库已就绪"
    else
        error "数据库启动失败，请检查日志: docker compose logs mysql"
    fi

    # 提示用户运行数据库迁移
    warn "请手动运行数据库迁移："
    echo ""
    echo "docker run --rm \\"
    echo "  --network nwpushare_nwpushare-network \\"
    echo "  -v \$(pwd):/app \\"
    echo "  -w /app \\"
    echo "  -e KUN_DATABASE_URL=\"mysql://nwpushare:your_password@mysql:3306/nwpushare\" \\"
    echo "  node:20-alpine \\"
    echo "  sh -c \"corepack enable && corepack prepare pnpm@latest --activate && pnpm install && pnpm prisma db push\""
    echo ""
    read -p "数据库迁移完成后，按回车继续..."

    # 构建并启动应用
    info "构建并启动应用..."
    docker compose up -d --build app

    info "部署初始化完成！"
    info "访问 http://localhost:3000 查看应用"
    info "使用 ./deploy.sh logs 查看日志"
}

# 启动服务
start_services() {
    info "启动所有服务..."
    docker compose up -d
    info "服务已启动"
    docker compose ps
}

# 停止服务
stop_services() {
    info "停止所有服务..."
    docker compose down
    info "服务已停止"
}

# 重启服务
restart_services() {
    info "重启所有服务..."
    docker compose restart
    info "服务已重启"
    docker compose ps
}

# 更新应用
update_app() {
    info "更新应用..."

    # 拉取最新代码
    if [ -d .git ]; then
        info "拉取最新代码..."
        git pull
    fi

    # 重新构建并启动
    info "重新构建应用..."
    docker compose up -d --build app

    info "应用更新完成"
    docker compose logs --tail=50 app
}

# 备份数据库
backup_db() {
    BACKUP_DIR="./backups"
    DATE=$(date +%Y%m%d_%H%M%S)

    mkdir -p $BACKUP_DIR

    info "备份数据库..."
    docker compose exec -T mysql mysqldump -u nwpushare -p${MYSQL_PASSWORD:-nwpushare_password} nwpushare | gzip > $BACKUP_DIR/nwpushare_$DATE.sql.gz

    info "备份完成: $BACKUP_DIR/nwpushare_$DATE.sql.gz"

    # 保留最近7天的备份
    find $BACKUP_DIR -name "nwpushare_*.sql.gz" -mtime +7 -delete
    info "已清理7天前的旧备份"
}

# 查看日志
view_logs() {
    docker compose logs -f app
}

# 显示状态
show_status() {
    info "服务状态："
    docker compose ps
    echo ""
    info "资源使用："
    docker stats --no-stream nwpushare-app nwpushare-db nwpushare-redis
}

# 主函数
main() {
    case "${1:-help}" in
        init)
            init_deploy
            ;;
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        update)
            update_app
            ;;
        backup)
            backup_db
            ;;
        logs)
            view_logs
            ;;
        status)
            show_status
            ;;
        help|*)
            echo "NWPUShare Docker 部署脚本"
            echo ""
            echo "使用方法: $0 [命令]"
            echo ""
            echo "可用命令:"
            echo "  init     - 初始化部署（首次部署使用）"
            echo "  start    - 启动所有服务"
            echo "  stop     - 停止所有服务"
            echo "  restart  - 重启所有服务"
            echo "  update   - 更新应用代码并重新部署"
            echo "  backup   - 备份数据库"
            echo "  logs     - 查看应用日志"
            echo "  status   - 查看服务状态"
            echo "  help     - 显示此帮助信息"
            echo ""
            ;;
    esac
}

main "$@"
