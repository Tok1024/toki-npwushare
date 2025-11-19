# Toki Learning Hub 系统架构说明（2025-11-19）

> 目标：给已经会跑项目、懂一点 Next.js/Prisma 的你，一份**完整的「系统地图」**——从目录结构、技术栈到关键数据模型与请求链路，让你知道「代码都长在哪、谁跟谁说话、以后要改去哪动」。

本说明配合以下文档一起看效果最好：

- 根目录：`11-11.md`（项目现状与指南）
- 文档：`docs/improvement-guide.md`（迭代路线）
- 学习笔记：`11-19-codex.md`（后端深入 + 学习路线）

---

## 1. 整体概览：这是一个什么样的系统？

关键定位：

- 品牌：**Toki Learning Hub**（从 TouchGal 迁移而来）。
- 功能：面向「课程资料 / 经验分享 / 讨论」的学习社区。
- 核心能力：
  - 课程索引与详情：按学院/课程浏览。
  - 课程资源：仅保存外链（网盘、Docs 等），支持上传、审核。
  - 经验贴/讨论帖：课程下的帖子/评论。
  - 课程反馈：红心 + 难度投票 + 短评。
  - 用户系统：登录、基本个人信息、部分旧 patch 功能仍在。

技术栈：

- 前端框架：Next.js 15（App Router） + React 19。
- UI：HeroUI + Tailwind（不再手写 CSS，主要在 JSX 写 className）。
- 数据层：Prisma + PostgreSQL。
- 缓存与会话：Redis（自研 JWT + Redis 登录态）。
- 存储：S3 对象存储，用于图片/视频等文件（课程资源当前仅存链接）。
- 任务调度：Node + `server` 下的定时任务（多数为旧 TouchGal 逻辑）。

高层分层图（逻辑上）：

1. **前端层（UI / 交互）**
   - Next.js App Router 页面 `app/**`
   - 复用组件 `components/**`
   - 全局状态 `store/**`
2. **服务层（API / 鉴权 / 中间件）**
   - Route Handlers：`app/api/**/route.ts`
   - 中间件：`middleware.ts` + `middleware/**`
   - 公共工具：`utils/**`
3. **数据层（数据库 / 缓存 / 存储）**
   - Prisma schema：`prisma/schema/*.prisma`
   - Prisma Client：`prisma/index.ts`
   - Redis：`lib/redis.ts`
   - S3：`lib/s3.ts`
4. **周边（脚本 / 部署 / 归档）**
   - Seed 与部署脚本：`scripts/**`
   - 旧 TouchGal 归档：`archive/touchgal/**`
   - PM2 / Docker 配置：`ecosystem.config.cjs`、`docker-compose.yml`

---

## 2. 目录结构：重要文件都在哪里？

这里只列出对「理解架构」最关键的目录，更多细节可以在编辑器配合搜索查看。

### 2.1 应用入口：`app/`

- `app/layout.tsx`  
  - 全局布局（头部导航、主题 Provider 等）。
- `app/page.tsx`  
  - 首页（Hero 区 + 简介 + 推荐课程/资源）。
- `app/course/page.tsx`  
  - 课程索引：搜索 + 列表。
- `app/course/[dept]/[slug]/page.tsx`  
  - 课程详情页 Server Component。
  - 调用 `/api/course/[dept]/[slug]` 聚合课程 + 教师信息。
- `app/edit/create/page.tsx`  
  - 资源上传入口（选择学院/课程 + 填写资源信息）。
- `app/login/**`、`app/register/**`  
  - 登录注册页面，调用 `app/api/auth/**`。
- `app/api/**`  
  - 所有后端接口，按业务域分目录（详见第 4 节）。

### 2.2 UI 组件：`components/`

- `components/home/**`
  - 首页与课程列表相关组件（课程卡片、Hero 区等）。
- `components/course/**`
  - 课程详情页的 Header、Tabs、资源列表、评论、反馈、上传表单等。
- `components/login/Login.tsx`
  - 登录表单，使用 React Hook Form + Zod + `kunFetchPost`。
- `components/kun/**`
  - 通用组件（导航栏、文本分割线、空态、Loading、浮动用户卡等）。

### 2.3 数据与 ORM：`prisma/`

- `prisma/schema/schema.prisma`
  - Prisma 总入口，指定 `provider = "postgresql"`，`url = env("KUN_DATABASE_URL")`。
- `prisma/schema/course.prisma`
  - 课程相关模型：department / course / teacher / course_teacher / resource / post / comment / course_feedback / resource_rating / resource_interaction / badge / user_badge 等。
- `prisma/schema/user.prisma`
  - 用户模型及与旧 patch 业务的关联（后续会逐步精简）。
- 其他 `patch-*.prisma`  
  - 旧 TouchGal 补丁站相关模型，当前仍存在但主要被归档/渐退。
- `prisma/index.ts`
  - 导出单例 `prisma` 客户端，避免热重载重复实例化。
- `prisma.config.ts`
  - 使用 `defineConfig` 指定 schema 路径与 migrations 路径。

### 2.4 工具与服务封装

- `utils/kunFetch.ts`
  - 前端统一 fetch 工具：
    - 自动拼接 `NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV/PROD + /api/...`。
    - 统一 `credentials: 'include'` 带 cookie。
    - 做超时控制与重试。
- `utils/cookies.ts`
  - 字符串解析 cookie（中间件和 API 里常用）。
- `lib/redis.ts`
  - Redis 客户端封装：
    - 前缀 `kun:touchgal`（后续计划改名）。
    - 提供 `setKv / getKv / delKv`。
- `lib/s3.ts`
  - AWS S3 客户端封装：
    - 用于图片/视频等文件上传/删除（当前课程资源主要用链接，不强依赖）。

### 2.5 中间件与鉴权

- `middleware.ts`
  - Next.js 中间件入口。
  - `matcher`：`/admin/:path*`、`/user/:path*`、`/comment/:path*`、`/edit/:path*` 需要登录。
- `middleware/auth.ts`
  - `kunAuthMiddleware`：
    - 检查 cookie 中是否有 `kun-galgame-patch-moe-token`。
    - 没有则重定向到 `/login`。
- `middleware/_verifyHeaderCookie.ts`
  - 在 API 中使用，根据 cookie 验证 JWT，有效则返回 payload。

### 2.6 任务与脚本

- `scripts/seedCourses.ts`
  - 一次性写入多学院、多课程、资源、帖子、反馈及评论的种子数据。
- `server/**`
  - 与图片/任务相关的脚本与素材，多数为旧 TouchGal 逻辑（清理上传目录、每日任务等）。

### 2.7 文档与改造辅助

- `project.md`  
  - 项目说明 + 快速上手 + BetterAuth 计划。
- `docs/improvement-guide.md`  
  - 自主迭代路线图（前后端分阶段任务）。
- `improve/schema.prisma`  
  - 为教程/lab 准备的「教学版 schema」，描述了一个精简的课程平台模型（与主项目 schema 部分重合）。
- `11-11.md`  
  - 2025-11-11 项目现状与 TODO。
- `11-19-codex.md`  
  - 针对后端学习路线与 TODO 的详细说明。

---

## 3. 技术栈与运行环境

### 3.1 运行环境

核心依赖：

- Node 18+（建议 20+）
- pnpm（包管理器）
- PostgreSQL（主数据库）
- Redis（KV 缓存 / 登录态）

主要环境变量（见 `.env.example` / `11-11.md`）：

- `KUN_DATABASE_URL`：Postgres 连接字符串（主项目）。
- `NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV` / `PROD`：
  - 前端 `kunFetch` 用来拼接 API 地址。
  - 本地推荐使用 `http://127.0.0.1:3000`，并用同样地址访问，以避免跨域。
- `JWT_SECRET`、`JWT_ISS`、`JWT_AUD`：
  - 自研 JWT 生成与验签使用。
- `REDIS_HOST`、`REDIS_PORT`：
  - Redis 连接。
- 若使用 S3：`KUN_VISUAL_NOVEL_S3_STORAGE_*` 一组配置。

### 3.2 启动流程（开发环境）

1. 准备 `.env`：
   ```bash
   cp .env.example .env
   # 填好至少：
   # KUN_DATABASE_URL / REDIS_HOST / REDIS_PORT
   # NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV=http://127.0.0.1:3000
   # NEXT_PUBLIC_DISABLE_CAPTCHA=true
   ```
2. 安装依赖：
   ```bash
   pnpm install
   ```
3. 生成 Prisma Client + 推送 schema：
   ```bash
   pnpm prisma:generate
   pnpm prisma:push
   ```
4. 可选：seed 示例课程数据：
   ```bash
   pnpm run seed:courses
   ```
5. 启动 dev server：
   ```bash
   pnpm dev
   # 默认监听 127.0.0.1:3000
   ```
6. 浏览器访问 `http://127.0.0.1:3000`，使用 `seed@example.com / 123` 登录。

---

## 4. 后端架构：API、鉴权与数据访问

这一节聚焦服务端（Route Handlers + 中间件 + Prisma）。

### 4.1 Route Handlers：`app/api/**`

Next.js App Router 下的 API 写法：

- 路径：`app/api/.../route.ts`
- 导出方法：`export const GET/POST/PUT/DELETE = (req, ctx) => { ... }`
- ctx 参数里常见：`params: Promise<{ dept: string; slug: string }>`.

项目中重要的后端模块：

#### 4.1.1 课程域 API：`app/api/course/**`

- `app/api/course/list/route.ts`
  - 课程列表，支持分页、按学院 slug / 关键字模糊搜索。
  - 用 `kunParseGetQuery` + Zod 做 query 校验。
- `app/api/course/[dept]/[slug]/route.ts`
  - 课程详情（基础信息 + 参与教师）。
- `app/api/course/[dept]/[slug]/resources/route.ts`
  - `GET`：获取课程资源列表（只返回 `status='published'` 的资源）。
  - `POST`：创建资源：
    - 校验 body（`courseResourceCreateSchema`）。
    - 确认/创建学院、课程。
    - 资源初始为 `pending`，等待后台审核。
- `app/api/course/[dept]/[slug]/posts/route.ts`
  - 获取课程帖子列表（按 teacher/term 过滤），后续将扩展创建/编辑。
- `app/api/course/[dept]/[slug]/comment/route.ts`
  - 评论 CRUD：
    - 依赖 `comment` 模型 + `course_comment_like` 等。
    - 使用 `_helpers.ts` 中的 `nestCourseComments` 把平铺的评论变成树。
- `app/api/course/[dept]/[slug]/rating/route.ts`
  - 课程反馈：
    - 支持创建、修改、删除反馈。
    - 使用 `refreshCourseStats` 聚合更新 `course.heart_count` / `difficulty_avg` / `difficulty_votes`。

#### 4.1.2 鉴权与用户：`app/api/auth/**`、`app/api/user/**`

- 登录：`app/api/auth/login/route.ts`
  - 解析并校验登录表单（`loginSchema`）。
  - 验证密码 → 生成 JWT → 写 cookie：`kun-galgame-patch-moe-token`。
  - 使用 Redis 存储 access token，用于后续校验。
- 注册：`app/api/auth/register/route.ts`
  - 校验用户名/邮箱唯一性。
  - 验证邮箱验证码。
  - 创建用户并登录。
- 用户状态/资料：`app/api/user/status/info/route.ts` 等
  - 当前仍带有旧 patch 统计，未来会改造为课程域统计。

#### 4.1.3 管理端 API：`app/api/admin/**`

- 设置、统计、资源审核等接口多数为旧补丁站逻辑：
  - `admin/resource`、`admin/galgame`、`admin/stats/*` 等。
- 课程资源审核未来会有新接口，例如 `/api/admin/course-resource`（目前尚未实现，已在 TODO 中）。

### 4.2 参数解析与校验：`app/api/utils/parseQuery.ts` + `validations/**`

- `kunParseGetQuery(req, schema)`：
  - 从 URL 中读取 search params，使用 Zod schema 校验。
  - 返回校验后的数据或错误信息字符串。
- `kunParsePostBody(req, schema)` / `kunParsePutBody`：
  - 读取 `req.json()`，用 Zod 做校验。
- `kunParseDeleteQuery` / `kunParseFormData`：
  - DELETE 时的 query 解析、表单上传的解析。

常见 validations：

- `validations/course.ts`
  - `courseCommentCreateSchema` / `courseCommentUpdateSchema`
  - `courseFeedbackCreateSchema` / `courseFeedbackUpdateSchema`
  - `courseResourceCreateSchema` + `RESOURCE_TYPES`
- `validations/auth.ts`
  - 登录、注册的字段校验。

### 4.3 鉴权：JWT + Redis + 中间件

登录态核心流程：

1. 用户在前端发起登录（`LoginForm` 调用 `/api/auth/login`）。
2. 后端 `login`：
   - 查库找到用户，验证密码。
   - 生成 JWT：`generateKunToken(uid, name, role, '30d')`。
   - 写入 Redis：`access:token:${uid}` → token。
   - 写 cookie：`kun-galgame-patch-moe-token`（httpOnly）。
3. 后续接口需要登录时：
   - 中间件 `kunAuthMiddleware` 根据 cookie 判断是否放行受保护页面。
   - API 内使用 `verifyHeaderCookie(req)` 调用 `verifyKunToken(token)`：
     - 首先 `jwt.verify` 解签。
     - 然后对比 Redis 中的 access token 是否存在。
4. 注销/失效：
   - 删除 Redis 中对应 key，就能让 JWT 虽然未过期，但变为「无效会话」。

未来方向：

- 按 `project.md` 规划，会接入 BetterAuth 替代自研 JWT + Redis。
- 中间件会改用 BetterAuth 提供的 `verifyRequest` 接口。

### 4.4 数据访问：Prisma + PostgreSQL

所有对数据库的读写都通过 `prisma` 进行：

- 引用：`import { prisma } from '~/prisma'`
- 常用 API：
  - `findUnique / findMany / create / update / delete / count / aggregate`。

课程域常见查询示例：

- 课程列表（`app/api/course/list/route.ts`）：
  - 按学院、关键字过滤，分页，`include: { department: true }`。
- 课程详情：
  - `prisma.course.findUnique({ where: { department_id_slug: { department_id, slug } } })`
- 课程资源：
  - 根据 `course_id` + `status='published'` + `type/teacherId/term` 过滤。
- 课程反馈：
  - `course_feedback.aggregate` 计算 difficulty 平均值与投票数。

---

## 5. 前端架构：页面、组件与状态管理

### 5.1 页面与路由：Next.js App Router

主要页面：

- `/` → `app/page.tsx`
  - 首页：站点简介 + 部分课程/资源推荐。
- `/course` → `app/course/page.tsx`
  - 搜索与浏览课程列表。
- `/course/[dept]/[slug]` → `app/course/[dept]/[slug]/page.tsx`
  - 课程详情（Tabs：课程信息 / 课程资源 / 讨论版 / 课程反馈）。
- `/edit/create` → `app/edit/create/page.tsx`
  - 上传资源入口：选择学院/课程 → 填写资源信息 → 提交。
- `/login` / `/register`
  - 登录注册页面。
- `/user/**`、`/admin/**`
  - 用户中心、管理后台（部分功能仍是旧 patch 逻辑，逐步迁移中）。

Server vs Client 组件：

- 默认：Server Component，用于数据聚合、SEO、更安全。
- 需要交互 / 浏览器 API 的组件加 `'use client'` 声明：
  - 如 `components/course/ResourceList.tsx`、`components/login/Login.tsx`。

### 5.2 课程详情页组件结构：`components/course/**`

核心组件：

- `Header.tsx`
  - 显示课程标题、学院、标签、评分等。
  - 渲染 Tabs 并传递 `dept`、`slug`、`courseId` 等参数。
- `ResourceList.tsx`
  - Client 组件，调用 `kunFetchGet('/course/[dept]/[slug]/resources')` 获取资源列表。
  - 渲染为可点击卡片（后续可接资源详情页）。
- `PostList.tsx`
  - 课程帖子列表（经验贴），将接入 `Milkdown` 编辑器和 `posts` API。
- 评论相关：
  - `comment/Comments.tsx`：评论树渲染。
  - `comment/Publish.tsx`：发表评论表单。
  - `comment/Like.tsx`、`comment/Dropdown.tsx`：点赞和操作菜单。
- 反馈相关：
  - `feedback/FeedbackSection.tsx`：汇总统计 + 列表 + 打开反馈对话框。
  - `feedback/FeedbackModal.tsx`：创建/编辑反馈表单。
  - `feedback/FeedbackCard.tsx`：单条反馈渲染。
- 上传相关：
  - `upload/UploadResourceForm.tsx`：资源上传表单。
  - `upload/DepartmentCoursePicker.tsx`：学院/课程选择器。

### 5.3 通用组件与状态：`components/kun/**` + `store/**`

- `components/kun/top-bar/TopBar.tsx`
  - 全局导航栏（浏览课程 / 浏览资源 / 学院 / 帮助 / 上传资源）。
- `components/kun/Null.tsx`、`KunLoading` 等
  - 空状态/加载状态组件。
- `store/userStore.ts`
  - 使用 Zustand 存储当前用户信息（登录后由 LoginForm 设置）。
- 其他 store：
  - 比如搜索设置、全局 UI 状态等。

---

## 6. 典型请求链路示例

这一节给几个「从前端到后端再到数据库」的典型路径，帮助你串起来。

### 6.1 登录流程：`/login` → `/api/auth/login` → JWT + Redis

1. 用户在 `/login` 填写用户名/邮箱 + 密码。
2. `LoginForm`：
   - 用 React Hook Form + `loginSchema` 进行前端校验。
   - 调用 `kunFetchPost('/auth/login', body)`。
3. `app/api/auth/login/route.ts`：
   - `kunParsePostBody` + `loginSchema` 再次校验。
   - Prisma 查 `user` 表，验证密码。
   - 调用 `generateKunToken` 生成 JWT，写 Redis。
   - 通过 `cookies()` 写入 `kun-galgame-patch-moe-token`。
4. 前端收到响应：
   - 使用 `useUserStore` 更新全局用户状态。
   - 跳转到用户中心 `/user/[uid]/resource`。

### 6.2 课程详情：`/course/[dept]/[slug]`

1. `app/course/[dept]/[slug]/page.tsx`（Server Component）：
   - 调用 `fetch(base + '/api/course/[dept]/[slug]')` 获取课程详情。
2. `app/api/course/[dept]/[slug]/route.ts`：
   - 通过 `dept`、`slug` 找到对应 `department` 和 `course`。
   - 查 `course_teacher` + `teacher` 获取参与教师列表。
   - 返回 `{ course, teachers }`。
3. 页面渲染 `<CourseHeader />`：
   - 显示课程核心信息与 Tabs。
   - Tabs 中的内容（资源/帖子/评论/反馈）通过 Client 组件再调用对应 API 拉取。

### 6.3 上传课程资源：`/edit/create`

1. 用户在 `/edit/create` 选择学院/课程 + 填写资源信息。
2. `UploadResourceForm`：
   - 使用 Zod + React Hook Form 校验：
     - 至少一个链接、标题必填、类型为 `RESOURCE_TYPES` 中之一。
   - 调用 `kunFetchPost('/course/[dept]/[slug]/resources', body)`。
3. 后端 `POST /api/course/[dept]/[slug]/resources`：
   - `kunParsePostBody` + `courseResourceCreateSchema` 校验。
   - `verifyHeaderCookie` 确认登录。
   - 确保学院与课程存在，否则自动创建。
   - 创建 `resource` 记录，`status='pending'`，`visibility='public'`。
4. 后续（待完善）：
   - 管理员在审核后台将 `pending → published`。
   - 课程详情页的资源列表只显示 `published` 资源。

---

## 7. Legacy 与 TODO：你会看到哪些“怪名字”？

从 TouchGal 迁移过来后，系统里仍有不少「Galgame / Patch」命名或遗留逻辑，这些会逐步被迁移/删除。

### 7.1 命名遗留

- Cookie 名：`kun-galgame-patch-moe-token`。
- Redis 前缀：`kun:touchgal`。
- S3 key 前缀：`touchgal/galgame/...`。
- 类型名/文件名中 `patch`、`galgame`，例如：
  - `types/api/patch`（课程评论还在用 `PatchComment` 结构）。
  - `app/api/tag/galgame/route.ts` 等路由。

### 7.2 旧业务模型

- Prisma 中的 `patch-*.prisma`：
  - 旧补丁资源/标签/评分/公司等表。
- 用户模型与 patch 的大量关系：
  - `user_patch_favorite_folder`、`user_patch_comment_like_relation` 等。

短期策略：

- 不影响课程主功能的前提下，先在代码层面减少对这些模型的依赖。
- 新功能优先用课程域新模型（course/resource/post/comment/course_feedback）。

长期 TODO（见 `11-11.md` / `11-19-codex.md`）：

1. 统一品牌与命名（cookie/Redis/S3 前缀改名）。
2. 完整的课程资源审核后台：`/admin` 下新的页面 + API。
3. 课程帖子完善：
   - 创建/编辑/删除帖子的 API + 页面。
4. 用户中心从「补丁站」视角切换到「课程站」视角。
5. 接入 BetterAuth，替换自研 JWT/Redis 登录。

---

## 8. 如果你想进一步深入（学习路线总览）

你可以把这份架构说明当作地图，然后结合下面的路线逐步攻克：

1. **后端链路练习**（参考 `11-19-codex.md` 第 1～4 节）：
   - 先从 `/course/[dept]/[slug]` 链路开始看。
   - 再看课程资源、评论、反馈的 API 与前端调用。
2. **API 小改动练习**：
   - 给 `GET /api/course/list` 增加一个简单筛选条件。
   - 给课程评论加一个按点赞排序。
3. **实战功能**：
   - 补齐课程帖子 CRUD。
   - 实现课程资源审核 API。
4. **重构/清理**：
   - 把课程相关类型/工具从 `patch` 命名中独立出来。
   - 逐步清理 `galgame` 命名与不再使用的 API。
5. **鉴权升级**：
   - 在对系统足够熟悉后，再考虑按 `project.md` 集成 BetterAuth。

当你对「这份架构说明 + 11-19-codex.md」都很熟的时候，基本就已经具备了 **维护和扩展这个项目后端/全栈的能力**。之后遇到任何模块，只要能在这张地图上定位到它的位置，就可以比较从容地展开工作了。***
