# NWPUShare

> 🎓 西北工业大学课程资源共享平台 

NWPUShare 是一个致力于促进校园学习资源共享的开源项目。它为学生提供了一个集中的平台，用于分享课程资料、交流学习经验、撰写课程评价，并建立了一个互助的学习社区。

🌐 **在线访问**: [study.toki.codes](https://study.toki.codes)

## 🛠 技术栈 

本项目采用现代化的全栈开发架构，确保高性能与良好的开发体验：

- **核心框架**: [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **编程语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 组件库**: [HeroUI (NextUI)](https://www.heroui.com/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **数据库 & ORM**: [MySQL 8.0](https://www.mysql.com/) + [Prisma ORM](https://www.prisma.io/)
- **缓存 & 队列**: [Redis](https://redis.io/)
- **编辑器**: [Milkdown](https://milkdown.dev/) (所见即所得 Markdown 编辑器)
- **部署 & 容器化**: Docker Compose + PM2

## 📂 目录结构 

```bash
.
├── app/                # Next.js App Router 路由与页面逻辑
│   ├── api/            # 后端 API 路由定义
│   ├── admin/          # 管理员后台页面
│   └── ...             # 其他业务页面
├── components/         # React UI 组件
│   ├── kun/            # 通用基础组件 (UI Kit)
│   └── ...             # 业务特定组件
├── config/             # 站点与环境配置
├── constants/          # 常量定义
├── prisma/             # 数据库模型与迁移文件
│   ├── schema/         # 拆分的 Prisma Schema 定义
│   └── seed.ts         # 数据库种子数据脚本
├── public/             # 静态资源 (图片、图标等)
├── store/              # Zustand 全局状态管理
├── styles/             # 全局样式与 Tailwind 配置
├── types/              # TypeScript 类型定义
├── utils/              # 通用工具函数
└── validations/        # Zod 数据验证 Schema
```

## 🚀 快速开始 

### 1. 环境准备

确保你的开发环境已安装：
- Node.js (v20+)
- pnpm
- Docker & Docker Compose

### 2. 数据库构建

本项目使用 Docker Compose 快速启动 MySQL 和 Redis 服务。

```bash
# 1. 启动数据库容器
docker-compose up -d

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，确保数据库连接信息 (DATABASE_URL) 与 docker-compose.yml 一致

# 3. 同步数据库结构
pnpm prisma:push

# 4. (可选) 填充初始数据
pnpm seed:courses
```

> **💡 提示**: 数据库 Schema 定义位于 `prisma/schema/` 目录下。如果修改了模型，请运行 `pnpm prisma:generate` 更新客户端，并使用 `pnpm prisma:push` 同步到数据库。

### 3. 启动开发服务器

```bash
# 安装依赖
pnpm install

# 启动开发服务 (TurboPack)
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 📦 部署 (Deployment)

项目支持多种部署方式，推荐使用 Docker 或 PM2。

### 构建
```bash
pnpm build
```

### 启动 (PM2)
```bash
pnpm start
```

### 数据库备份
```bash
# 导出 SQL 备份文件
docker exec nwpushare-db mysqldump -uroot -prootpass tokidb > backup_$(date +%Y%m%d).sql
```

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进本项目。在提交代码前，请确保通过了类型检查和 Lint 校验。

## 📄 许可证

AGPL-3.0-only

## 致谢

本项目基于 [KUN1007/kun-touchgal-next](https://github.com/KUN1007/kun-touchgal-next) 项目二次开发。

感谢 TouchGAL 开发组的卓越工作。
