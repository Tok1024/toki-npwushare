# 项目说明 (project.md)

面向全栈初学者的循序渐进指南：带你从零跑通项目，读懂架构，再按部就班地改造成“校内学习资源 + 经验分享”的网站。

## 0. 我需要知道什么？（速通）

- 前端：Next.js App Router（Server/Client 组件）、React 基础、TailwindCSS。
- 后端：Next Route Handlers（`app/api/**/route.ts`）、Prisma 操作 PostgreSQL、Redis 缓存、Node 定时任务。
- 工具：pnpm、ESLint/Prettier、Docker 基础。

## 1. 架构一眼看懂

- 前端层（UI/交互）：`app/` 页面 + `components/` 组件，TailwindCSS + HeroUI。
- 服务层（API/鉴权）：`app/api/**` 处理请求；`middleware/` 做登录保护；`server/tasks` 跑 cron。
- 数据层（存储/缓存）：Prisma → PostgreSQL（`prisma/schema/*.prisma`），Redis 做 KV 缓存（`lib/redis.ts`）。
- 周边：S3 对象存储、脚本与部署（`scripts/`、PM2、Docker）。

## 2. 第一次启动（一步一步）

前置：Node 18+/20+、pnpm、Docker（可选）。

1. 准备环境变量：

```bash
cp .env.example .env
# 最少需要：
KUN_DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/touchgal?schema=public
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV=http://127.0.0.1:3000
NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD=http://127.0.0.1:3000
```

2. 启动依赖（可选）：`docker-compose up -d postgres redis`
3. 安装依赖：`pnpm install`
4. 生成与推送 Prisma：`pnpm prisma:generate && pnpm prisma:push`
5. 本地运行：`pnpm dev`（默认 http://127.0.0.1:3000）

## 3. Next.js 在本项目中的用法

- App Router：目录即路由，`app/page.tsx` 是首页，`app/resource/page.tsx` 是资源页。
- Server vs Client 组件：
  - 默认 Server 组件（更安全，能直接访问数据库）。
  - 需要浏览器 API/交互时在文件首行加 `'use client'`，放在 `components/**` 更清晰。
- API 路由：`app/api/**/route.ts` 导出 `GET/POST/PUT/DELETE` 函数，内部用 `prisma.*` 读写库。
- Server Actions：如 `app/actions.ts`，在服务器端执行任务或聚合数据（无需额外 API 跳转）。
- 中间件鉴权：`middleware.ts` 与 `middleware/auth.ts` 控制 `/admin`、`/user` 等受保护路径。

## 4. 目录逐一说明（如何快速定位）

- `app/`：页面与 API（如 `app/galgame`、`app/resource`、`app/api/**`）。
- `components/`：复用 UI（如 `components/resource/ResourceCard.tsx`）。
- `lib/`：外部服务封装（`redis.ts`、`s3.ts`）。
- `prisma/`：`index.ts` 暴露客户端；`schema/*.prisma` 按功能拆分模型；`schema/schema.prisma` 指定数据源。
- `server/`：定时任务（每日清零、清理上传目录等）。
- `store/`：Zustand 全局状态（面包屑、用户、搜索等）。
- `utils/`：工具函数（`kunFetch.ts` 封装 fetch 调用）。
- `config/`：站点常量与配置。

## 5. 数据与 Prisma（最小上手）

数据源位于 `prisma/schema/schema.prisma`：

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("KUN_DATABASE_URL") }
```

示例模型（建议为“学习资源”新增）：

```prisma
model Resource {
  id        String   @id @default(cuid())
  title     String
  type      String   // note/assignment/exam
  tags      String[]
  authorId  String
  createdAt DateTime @default(now())
}
```

常用查询：

```ts
import { prisma } from '~/prisma'
const list = await prisma.resource.findMany({ where: { type: 'note' } })
const created = await prisma.resource.create({
  data: { title, type, tags, authorId }
})
```

## 6. 从“游戏资源”到“学习资源”（最小改造）

1. 命名替换：目录/组件从 `galgame/patch` 改为 `resource/experience`，与数据库模型同步。
2. 页面调整：复制 `components/galgame/Card.tsx` → `components/resource/MaterialCard.tsx`，字段改为课程、年级、作者。
3. API 改造：在 `app/api/resource/route.ts` 增加 `GET/POST`，映射到新的 `prisma.resource` 模型。
4. 表单与校验：复用 `validations/*` 与 React Hook Form，字段简化为标题、类型、标签、附件。

## 7. BetterAuth 集成（详细）

安装：`pnpm add better-auth better-auth-prisma-adapter`

1. Prisma 模型追加到 `prisma/schema/user.prisma`（简化示例）：

```prisma
model User { id String @id @default(cuid()); email String @unique; name String? }
model Account { id String @id @default(cuid()); userId String; provider String; providerAccountId String; user User @relation(fields: [userId], references: [id]) }
model Session { id String @id @default(cuid()); userId String; expires DateTime; user User @relation(fields: [userId], references: [id]) }
```

执行：`pnpm prisma:generate && pnpm prisma:push`

2. 新建 `lib/auth.ts`：

```ts
import { createBetterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth-prisma-adapter'
import { prisma } from '~/prisma'
export const auth = createBetterAuth({
  adapter: prismaAdapter(prisma),
  session: { strategy: 'jwt', cookieName: 'kun-auth' },
  providers: { email: { magicLink: true } }
})
```

3. 新建 `app/api/auth/[...betterauth]/route.ts`：

```ts
import { auth } from '~/lib/auth'
export const GET = (req: Request) => auth.handle(req)
export const POST = (req: Request) => auth.handle(req)
```

4. 更新中间件 `middleware/auth.ts`（示意）：

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '~/lib/auth'
export const middleware = async (request: NextRequest) => {
  const session = await auth.verifyRequest(request)
  const needAuth = ['/admin', '/user'].some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )
  if (needAuth && !session)
    return NextResponse.redirect(new URL('/login', request.url))
  return NextResponse.next()
}
```

5. 前端读取用户：在 `components/kun/top-bar/TopBar.tsx` 使用 BetterAuth 的 hook 或调用 `/api/auth/session` 获取当前用户，替换自定义 cookie 解析。

环境变量：`.env` 增加 `BETTER_AUTH_URL=http://127.0.0.1:3000`、`BETTER_AUTH_SECRET=随机字符串`。

## 8. Docker 与部署（云端 PostgreSQL/Redis）

1. 若使用云服务（RDS/Aiven/Supabase），把连接串写到 `.env`。
2. 生产镜像：按文档准备 `Dockerfile`（利用 `.next/standalone`），`docker build -t myapp .`。
3. 编排示例（与依赖一并启动）：

```yaml
services:
  app:
    build: .
    env_file: .env
    ports: ['3000:3000']
    depends_on: [postgres, redis]
  postgres:
    image: postgres:15
    environment: { POSTGRES_PASSWORD: pass }
    volumes: ['pgdata:/var/lib/postgresql/data']
  redis: { image: redis:7 }
volumes: { pgdata: {} }
```

4. PM2 可选：保持 `pnpm start` 使用 `ecosystem.config.cjs`，或直接 `node server.js`。

## 9. 调试与排错（常见问题）

- 访问失败/跨域：检查 `NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV/PROD` 与实际地址一致。
- Prisma 报错：确认 `KUN_DATABASE_URL` 值、数据库已启动、`pnpm prisma:push` 已执行。
- 鉴权失效：清理浏览器 Cookie，检查 BetterAuth 环境变量与中间件逻辑。
- 样式不生效：确认已引入 `styles/index.css`，组件是否为 Client 组件。

## 10. 7 天学习计划（建议）

- Day1：跑通项目；读 `app/layout.tsx`, `app/page.tsx`。
- Day2：理解 Server/Client 组件区别；改写一个小组件（如 `ResourceCard`）。
- Day3：走通组件 → API → Prisma 的完整链路，打印日志理解数据流。
- Day4：新增 `Resource` 模型与 `app/api/resource`，渲染列表页。
- Day5：完成发布表单（React Hook Form + Zod）并写入数据库。
- Day6：接入 BetterAuth，替换登录态；保护 `/user` 页面。
- Day7：容器化并部署到云服务器，验证端到端功能。

有了以上清晰路线，你可以按模块逐一上手：先读懂、再复用、后改造。遇到不清楚的概念，回到对应小节查关键文件与命令即可。
