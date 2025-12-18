# 2025-11-19 后端学习与改造指南（Codex 版）

> 适用对象：已经看过 `11-11.md`、`AGENTS.md`，大致知道这是一个「课程资料 / 经验分享」网站，但还不太会**完整地跟踪一条请求从浏览器到数据库**，也不太清楚接下来该怎么一步步把后端写扎实的同学。
>
> 目标：帮你从「知道架构」走到「能读懂、能改、能自己加功能」，特别是课程相关的后端部分。

---

## 0. 读这份文档之前，你最好已经做到：

- 能本地跑起来项目（参考 `project.md` 和 `docs/improvement-guide.md`）：
  - `.env` 填好 `KUN_DATABASE_URL`、`REDIS_HOST`、`REDIS_PORT` 等。
  - `pnpm install && pnpm prisma:generate && pnpm prisma:push`
  - `pnpm run seed:courses`（可选，但强烈建议，方便你测试课程功能）
  - `pnpm dev` 打开 `http://127.0.0.1:3000`，用 `seed@example.com / 123` 登录。
- 粗略了解：
  - Next.js App Router（`app/**`）、Route Handlers（`app/api/**/route.ts`）。
  - Prisma 是怎么连 PostgreSQL 的（`prisma/schema/*.prisma`）。
  - 这项目里用 Redis 做登录态缓存（`lib/redis.ts` + JWT）。

如果这些还没做，建议先回到：

- `project.md`
- `docs/improvement-guide.md`
- `11-11.md`

照着启动一遍，把「能跑通 + 能登录」当成后端学习的第 0 步。

---

## 1. 先走一条完整链路：课程详情页（从浏览器到数据库）

这一步的目标：你要能**不查任何人**，自己从浏览器点进一个课程详情页，然后顺着代码一路跟到数据库查询，搞清楚「谁在什么时候做了什么」。

我们以一个路径为例：

> `/course/[dept]/[slug]`，比如 `/course/cs/signal-and-system`

### 1.1 页面 Server 组件：谁在发请求？

打开：`app/course/[dept]/[slug]/page.tsx:1`

关注点：

1. `getCourseDetail` 函数：
   - 根据 `NODE_ENV` 选择 `NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV/PROD`。
   - 用原生 `fetch` 请求：`GET /api/course/[dept]/[slug]`。
2. `Page` 组件：
   - 从 `params` 里拿到 `dept`、`slug`。
   - 调用 `getCourseDetail`，拿到 `{ course, teachers }`。
   - 渲染 `<CourseHeader dept slug course teachers />`。

**练习 A：**

- 在 `getCourseDetail` 里 `console.log('fetch course detail', dept, slug)`。
- 刷新浏览器，观察终端（Next.js dev server）的输出。
  - 体会：**Server Component 是在 Node.js 端执行的**。

### 1.2 课程详情 API：怎么查数据库？

打开：`app/api/course/[dept]/[slug]/route.ts:1`

逻辑拆解：

1. 从 `params` 拿到 `{ dept, slug }`。
2. 用 Prisma 查 `department`：
   - `prisma.department.findUnique({ where: { slug: dept } })`
3. 再查 `course`：
   - `prisma.course.findUnique({ where: { department_id_slug: { department_id: department.id, slug } } })`
   - 注意这里用的是 **复合唯一键** `@@unique([department_id, slug])`，定义在 `prisma/schema/course.prisma:36`。
4. 再查参与教师：
   - 从 `course_teacher` 表查，include `teacher`。
5. 返回 JSON：
   - `{ course, teachers: teachers.map((t) => t.teacher) }`

**练习 B：**

- 在 `GET` 里加一行 `console.log('hit course detail api', dept, slug)`。
- 刷新课程详情页，看终端的日志是不是和 `page.tsx` 中你打印的一致。
- 体会：**Server Component 和 API Route Handler 之间，是一次 HTTP 请求**。

### 1.3 Prisma 模型：course / department / teacher 是怎么长出来的？

打开：`prisma/schema/course.prisma:1`

重点模型：

- `department`：学院 / 部门。
- `course`：课程，`@@unique([department_id, slug])` 保证「同学院下课程 slug 唯一」。
- `teacher` + `course_teacher`：教师，及其与课程的多对多关联。

建议你把这几个模型**画在纸上**，标出：

- 一对多：`department` → `course`。
- 多对多：`course` ↔ `teacher` 通过 `course_teacher` 。

**练习 C：**

- 在 `app/api/course/list/route.ts` 里找到查询逻辑：
  - `prisma.course.findMany({ where, include: { department: true } ... })`
- 对照 `course.prisma` 看看每个字段从哪里来。

### 1.4 从列表到详情：/course 页面如何调用 /api/course/list

打开两个文件：

- 列表页：`app/course/page.tsx:1`
- 列表 API：`app/api/course/list/route.ts:1`

你会看到：

- 列表页是 **Server Component**，直接在服务器上调用 `prisma.course.findMany`（没有通过 `/api`）。
- `/api/course/list` 是给 **客户端** 用的（比如未来无限滚动等）。

**这两个模式你都要熟悉：**

- Server Component 直接 Prisma（更简单、更高性能）。
- Client Component 用 `kunFetchGet` 去打 `/api/*`（适合用户交互很多的地方）。

---

## 2. 基础语法补全清单（你若哪块不熟，就针对性补一下）

建议你在正式改代码之前，对下面这些点做到「看代码不犯怵」即可，不要求精通：

### 2.1 TypeScript / JavaScript

- 函数声明、箭头函数、async/await。
- 基本类型：`number` / `string` / `boolean` / `Record<string, T>`。
- 数组/对象的 map/filter/reduce。

### 2.2 Next.js App Router

- `app/**/page.tsx`：页面组件（Server/Client）。
- `app/api/**/route.ts`：Route Handler 导出 `GET/POST/PUT/DELETE`。
- `params` 与 `searchParams` 的用法。
- `notFound()`、`redirect()` 等辅助函数。

### 2.3 Prisma

- 基本 CRUD 调用：`findUnique / findMany / create / update / delete / count / aggregate`。
- `where`、`orderBy`、`include` / `select` 的用法。
- 如何在 schema 里定义 `@@unique`、`@@index`，它们在查询中的意义。

### 2.4 Zod 验证

- `z.object({ ... })`，`safeParse` 与错误处理。
- 在 API 里用 `kunParseGetQuery` / `kunParsePostBody` 去解析请求。

### 2.5 JWT + Redis

- JWT 结构（header + payload + signature）的基本概念。
- Redis 的 KV 读写（`setKv/getKv/delKv`）。
- 项目中的使用方式：`app/api/utils/jwt.ts` + `lib/redis.ts`。

如果某一块不熟，可以边看代码边查文档，不需要提前一次性啃完。

---

## 3. 后端架构总览：文件怎么组织、数据怎么流动？

从后端视角看，这个项目大致分成几层：

### 3.1 API 层：`app/api/**`

- 功能：
  - 接收 HTTP 请求（JSON / Query / FormData）。
  - 用 Zod 校验参数。
  - 调用 Prisma/Redis/S3 等服务。
  - 返回 JSON 数据给前端。
- 工具：
  - `app/api/utils/parseQuery.ts`：
    - `kunParseGetQuery`：解析 `?page=1&pageSize=20`。
    - `kunParsePostBody` / `kunParsePutBody`：解析 JSON body。
    - `kunParseDeleteQuery` / `kunParseFormData` 等。

**建议阅读顺序（后端）**：

1. 课程相关：
   - `app/api/course/list/route.ts`
   - `app/api/course/[dept]/[slug]/route.ts`
   - `app/api/course/[dept]/[slug]/resources/route.ts`
   - `app/api/course/[dept]/[slug]/rating/route.ts`
   - `app/api/course/[dept]/[slug]/comment/route.ts`
   - `app/api/course/[dept]/[slug]/posts/route.ts`
2. 登录与注册：
   - `app/api/auth/login/route.ts`
   - `app/api/auth/register/route.ts`
3. 用户状态：
   - `app/api/user/status/info/route.ts`（目前还保留很多补丁站字段）。
4. 管理端：
   - `app/api/admin/**`（很多仍是 TouchGal 补丁相关逻辑）。

### 3.2 中间件层：`middleware.ts` + `middleware/auth.ts` + `_verifyHeaderCookie.ts`

- `middleware.ts:1`：
  - 配置 `matcher`，保护 `/admin/*`、`/user/*`、`/comment/*`、`/edit/*`。
  - 调用 `kunAuthMiddleware`。
- `middleware/auth.ts:1`：
  - 用 `parseCookies` 从请求头里拿 cookie。
  - 判断是否存在 `toki-nwpushare-access-token`：
    - 有：放行。
    - 无：重定向到 `/login`。
- `middleware/_verifyHeaderCookie.ts:1`：
  - 从 cookie 中取出 `toki-nwpushare-access-token`。
  - 调用 `verifyKunToken` → JWT + Redis 校验。

### 3.3 数据层：Prisma + Redis + S3

- Prisma Client：`prisma/index.ts:1`
  - 解决了 dev 模式多实例问题（挂在 `global` 上）。
- 数据模型：`prisma/schema/*.prisma`
  - 课程域：`course.prisma`
  - 用户与消息：`user.prisma`
  - 旧补丁站模型：`patch*.prisma`（未来逐步退出主功能）。
- Redis：`lib/redis.ts:1`
  - KV 前缀：`kun:touchgal`（这是一个明显的命名 Technical Debt）。
  - 用途：
    - 存储 access token：`access:token:${uid}`。
- S3：`lib/s3.ts:1`
  - 目前主要为补丁站视频/图片使用，Bucket key 仍是 `touchgal/galgame/...`，未来如要用于课程资源，需要改造命名。

### 3.4 通用工具层：`utils/**`

- `utils/kunFetch.ts:1`：
  - 客户端请求 `/api` 的统一入口，自动带 cookie。
  - 设置了超时与重试逻辑。
- `utils/cookies.ts:1`：
  - 字符串解析 cookie。
- 其他如 `formatDistanceToNow`、`markdownToText` 等更多偏前端/展示层。

---

## 4. 核心模块 Deep Dive（附实操练习）

这一节我们按模块梳理，并给你「建议阅读顺序 + 小练习」。真正读完一遍，你基本就能自己改和加新功能了。

### 4.1 鉴权与用户：自研 JWT + Redis

相关文件：

- 登录：`app/api/auth/login/route.ts:1`
- 注册：`app/api/auth/register/route.ts:1`
- JWT 与 Redis：
  - `app/api/utils/jwt.ts:1`
  - `lib/redis.ts:1`
- Cookie 与中间件：
  - `utils/cookies.ts:1`
  - `middleware.ts:1`
  - `middleware/auth.ts:1`
  - `middleware/_verifyHeaderCookie.ts:1`
- 用户模型：`prisma/schema/user.prisma:1`

核心流程（登录）：

1. `POST /api/auth/login`：
   - `kunParsePostBody(req, loginSchema)` 解析并校验入参。
   - 查 `prisma.user.findFirst`，对 email / name 做不区分大小写匹配。
   - `verifyPassword` 校验密码。
   - 2FA 开启的话，生成临时 token 写 cookie（`kun-galgame-patch-moe-2fa-token`）。
   - 否则生成正式 JWT：`generateKunToken(uid, name, role, '30d')`。
2. `generateKunToken`：
   - `jwt.sign` 生成 token。
   - `setKv('access:token:uid', token, 30 * 24 * 60 * 60)` 写入 Redis。
   - 返回 token，路由里通过 `cookies().set('toki-nwpushare-access-token', token, ...)` 写 cookie。
3. 之后任意需要登录的接口：
   - 通过 `verifyHeaderCookie(req)` 解析 cookie → 调用 `verifyKunToken(token)`：
     - 用 `jwt.verify` 解出 payload。
     - 再从 Redis 读 `access:token:uid` 对比，做一次「服务器侧会话有效性校验」。

**练习 D：画出状态图**

- 画一个简单状态机，表示用户从「未登录」→「登录成功」→「JWT 失效或 Redis 被清空」时，前后端会发生什么。
- 顺手把相关文件路径写在纸上，作为之后 debug 的索引。

**未来改造 TODO（鉴权部分）：**

1. 使用 BetterAuth 替换自研 JWT + Redis（详见 `project.md` 第 7 节）：
   - 在 `lib/auth.ts` 中实现 BetterAuth 实例。
   - 新增 `app/api/auth/[...betterauth]/route.ts`。
   - 中间件从手动解析 cookie 改为调用 BetterAuth 的 `verifyRequest`。
2. 统一 cookie 与 Redis key 命名：
   - 将 `toki-nwpushare-access-token` → 更通用的 `toki-auth-token`（示例）。
   - 将 Redis 前缀 `kun:touchgal` → 如 `toki:learning-hub`。

> 这部分改造比较重，不建议你作为第一次实战就上；可以作为「中后期」的重构目标。

---

### 4.2 课程域模型与 API：课程 / 资源 / 帖子 / 评论 / 反馈

**数据模型（Prisma）：**

- 文件：`prisma/schema/course.prisma:1`
- 关键模型：
  - `department`：学院。
  - `course`：课程（包含 `resource_count`、`post_count`、`heart_count`、`difficulty_avg` 等聚合字段）。
  - `teacher` + `course_teacher`：教师及授课历史。
  - `resource`：课程资源，仅存链接 `links String[]`。
  - `post`：课程帖子（经验贴 / 笔记）。
  - `comment` + `course_comment_like`：评论与点赞。
  - `course_feedback`：课程反馈（红心 + 难度 + 短评）。
  - `resource_rating` / `resource_interaction`：资源评分 + 点击/下载行为。

**课程 API 路由：**

1. 列表：
   - `app/api/course/list/route.ts:1`
   - 入参：`page`、`pageSize`、`dept`、`keyword`（Zod 验证）。
   - 输出：分页后的课程列表，包含学院 slug、tags、统计字段等。
2. 详情：
   - `app/api/course/[dept]/[slug]/route.ts:1`
   - 上面在 1.2 已经分析。
3. 资源列表 + 上传：
   - `app/api/course/[dept]/[slug]/resources/route.ts:1`
   - `GET`：
     - 解析 Query（分页 / `type` / `teacherId` / `term`）。
     - 查 `resource` 表，过滤 `status = 'published'`。
   - `POST`：
     - 解析 body（`courseResourceCreateSchema`，见 `validations/course.ts:28`）。
     - 保证学院与课程存在（不存在时自动创建）。
     - 创建 `resource`，初始 `status = 'pending'`，`visibility = 'public'`。
4. 帖子列表：
   - `app/api/course/[dept]/[slug]/posts/route.ts:1`
   - 目前只有 `GET`，根据 `teacherId`、`term`、分页查 `post`。
5. 课程反馈（红心 + 难度 + 短评）：
   - `app/api/course/[dept]/[slug]/rating/route.ts:1`
   - `GET`：返回 `stats + feedbacks + mine`。
   - `POST`：新建反馈，限制一个用户对一个课程只能提交一次。
   - `PUT` / `DELETE`：修改/删除反馈，并通过 `refreshCourseStats` 更新聚合字段。
6. 评论：
   - `app/api/course/[dept]/[slug]/comment/route.ts:1`
   - 复用旧补丁站的 `PatchComment` 类型与树形嵌套逻辑（见下一小节）。

**实操练习 E：扩展课程列表 API 的查询条件**

> 难度：低。目的：熟悉 Zod + Prisma where 拼装。

1. 在 `app/api/course/list/route.ts` 的 `QuerySchema` 中新增可选字段，比如：
   - `minHeart: z.coerce.number().int().optional()`
2. 在 `where` 对象里加入条件：
   - 如果 `minHeart` 存在，增加 `heart_count: { gte: minHeart }`。
3. 用浏览器或 `curl` 调试：
   - 打开 `/api/course/list?minHeart=10` 观察返回结果是否过滤正确。

把这一步做熟了，后面改任何列表 API 都会顺手很多。

---

### 4.3 资源上传与审核：从表单到 pending 状态

相关文件：

- 页面入口：`app/edit/create/page.tsx`
- 表单组件：
  - `components/course/upload/UploadResourceForm.tsx`
  - `components/course/upload/DepartmentCoursePicker.tsx`
- 校验：
  - `validations/course.ts:28` 中的 `courseResourceCreateSchema`
- API：
  - `app/api/course/[dept]/[slug]/resources/route.ts` 的 `POST`

基本流程：

1. 用户在 `/edit/create` 页面中：
   - 选择学院/课程（如不存在，可以新建）。
   - 填写资源标题、类型（`RESOURCE_TYPES`）、链接列表等。
2. 表单提交时：
   - 用 Zod 校验前端字段。
   - 调用 `kunFetchPost('/course/[dept]/[slug]/resources', body)`。
3. 后端 `POST`：
   - `kunParsePostBody` 校验 body。
   - `verifyHeaderCookie` 确保已登录。
   - 确认 / 创建学院和课程。
   - 创建 `resource` 记录，`status = 'pending'`。

**当前缺失：后台审核流**

根据 `11-11.md` 和 `AGENTS.md`：

- 已有 `resource.status = pending/published/rejected` 模型。
- 但现在后台审核还用的是**补丁资源的接口**：`app/api/admin/resource/route.ts`。
- 新的课程资源审核接口尚未实现。

**TODO：实现课程资源审核 API（推荐作为你中等难度的第一个完整功能）**

设计建议：

1. 新建路由：
   - `app/api/admin/course-resource/route.ts`
2. 支持方法：
   - `GET`：分页读取 `resource`，默认只看 `status = 'pending'`。
   - `PUT`：修改 `status` 为 `published` 或 `rejected`，并在 `course` 上同步 `resource_count`。
3. 权限：
   - 复用 `verifyHeaderCookie`，限制 `payload.role >= 3`。

前端可以在之后再做（比如 `/admin/resources` 页），后端先完成接口并用 `curl / Thunder Client / Postman` 自测。

---

### 4.4 评论系统：从 PatchComment 到课程评论

相关文件：

- API：
  - `app/api/course/[dept]/[slug]/comment/route.ts`
  - `app/api/course/[dept]/[slug]/comment/_helpers.ts`
- 模型：
  - `prisma/schema/course.prisma` 中的 `comment` / `course_comment_like`
- 前端：
  - `components/course/comment/Comments.tsx`
  - `components/course/comment/Publish.tsx`
  - `components/course/comment/Like.tsx`
- 校验：
  - `validations/course.ts:1` 中的 `courseCommentCreateSchema` / `courseCommentUpdateSchema`

当前实现特点：

- 复用旧补丁站评论类型 `PatchComment`（`~/types/api/patch`）。
- 用 `_helpers.ts` 中的 `nestCourseComments` 把 flat 列表转成树。
- `GET` 接口要求已登录（`verifyHeaderCookie`），否则直接返回「用户登陆失效」。
- 支持：
  - 发表评论（可选 parentId → 楼中楼）。
  - 修改/删除自己或管理员的评论。
  - 点赞逻辑暂时仍在旧 patch 代码中（还未完全移植到课程 comment like）。

**TODO（结构与命名相关）：**

1. 在 `types/course.ts` 中定义更贴切的类型（例如 `CourseComment`），避免继续依赖 `PatchComment`。
2. 把 `nestCourseComments` 从 `course/[dept]/[slug]/comment/_helpers.ts` 抽象成课程域专用 helper（比如 `utils/course/comments.ts`），减少「patch」语义。
3. 考虑是否开放「未登录用户可读评论，但不能发表」：
   - 可以将 `GET` 中对 `verifyHeaderCookie` 的依赖改为「有则记录当前用户 id 用于 isLike，无则 payload 为 null」。

**实操练习 F：为课程评论加一个「按点赞数排序」选项**

1. 在前端 `CourseComments` 中增加一个 sort 选项（目前已有按时间正序/倒序）。
2. 在后端 `GET` 中：
   - 支持 `order=like` 的 Query 参数。
   - Prisma 查询时 `orderBy: { like_by: { _count: 'desc' } }`（可参考 Prisma 聚合文档）。

---

### 4.5 课程反馈系统：红心 + 难度投票

相关文件：

- 数据模型：`course_feedback`（`prisma/schema/course.prisma`）。
- 校验：
  - `courseFeedbackCreateSchema` / `courseFeedbackUpdateSchema`（`validations/course.ts:16`）。
- API：
  - `app/api/course/[dept]/[slug]/rating/route.ts`
- 前端：
  - `components/course/feedback/FeedbackSection.tsx`
  - `components/course/feedback/FeedbackModal.tsx`
  - `components/course/feedback/FeedbackCard.tsx`

流程梳理：

1. 页面加载时：
   - `FeedbackSection` 在 `useEffect` 中调用 `/course/[dept]/[slug]/rating`。
   - 后端 `GET`：
     - 通过 `getCourse` 查课程。
     - `prisma.course_feedback.findMany` 查所有反馈。
     - `mapped = feedbacks.map(mapFeedback(dept, slug))`。
     - 选出当前用户的反馈 `mine`（如果有）。
2. 提交反馈：
   - 前端打开 `FeedbackModal`，用 Zod schema 做校验。
   - `POST`：
     - 校验 body。
     - 限制一个用户只能对一门课提交一次（`@@unique([course_id, user_id])`）。
     - 写入 `course_feedback`。
     - 调用 `refreshCourseStats` 聚合统计到 `course` 表。
3. 修改/删除：
   - `PUT` / `DELETE` 按 `feedbackId` 操作。
   - 权限：作者或管理员（`role >= 3`）。

**实操练习 G：为课程反馈增加「仅自己可见的笔记」字段**

> 这是一个比较综合的小改动（模型 + Prisma + API + 前端）。

1. Prisma：
   - 在 `course_feedback` 模型中增加字段，如：
     - `private_note String? @db.VarChar(1000)`
   - `pnpm prisma:generate && pnpm prisma:push`。
2. API：
   - 在 `courseFeedbackCreateSchema` / `UpdateSchema` 中增加可选字段 `privateNote`。
   - 在 `POST` / `PUT` 中读写该字段。
   - 注意：`GET` 时只在 `mine` 中返回该字段，`feedbacks` 列表中不返回。
3. 前端：
   - 在 `FeedbackModal` 中增加 textarea。
   - 向后端传参时带上 `privateNote`。

做完这一步，你就完整体验了一次「从模型到 API 再到 UI」的闭环。

---

### 4.6 Legacy Patch/Galgame 模块：认识、隔离、逐步告别

虽然 `11-11.md` 里说旧 TouchGal 代码已经迁入 `archive/touchgal/**`，但在当前仓库中：

- Prisma 仍保留大量 `patch_*` 模型（`prisma/schema/patch*.prisma`）。
- API 仍存在补丁相关路由：
  - `app/api/tag/galgame/route.ts`
  - `app/api/company/galgame/route.ts`
  - `app/api/admin/galgame/route.ts`
  - `app/api/admin/resource/route.ts` 等。
- 用户模型字段与关联仍大量使用 `patch_*` 命名。
- S3、Redis 等基础设施前缀仍是 `touchgal` / `kun:touchgal`。

这些代码**短期内仍在跑**，但长期目标是：

- 让主站完全面向「课程学习」，不再暴露补丁/Galgame 语义。
- 将旧业务彻底隔离到 `archive`，甚至迁移到独立服务。

**TODO（长期重构方向）：**

1. 清点所有 `galgame` / `patch` 路由与类型：
   - 用 `rg "galgame" -n`、`rg "patch_" -n` 搜索。
   - 记录哪些是线上还在用的（可以通过访问 UI 或看日志确认）。
2. 为课程域实现完整的替代功能后：
   - 管理后台：用新的课程资源审核、课程反馈管理等接口替换旧 patch admin 页面。
   - 用户中心：改造 `/user/**`，去掉 patch 收藏、补丁评论等统计，改用课程资源/评论/反馈。
3. 最终：
   - 将 patch 相关 API 路由迁移到 `archive/touchgal/app/api/**` 或完全从主站路由树中移除。

---

## 5. 当前后端存在的主要问题与坑（Backend 视角）

这一节给你列出目前代码层面存在的明显问题/遗留点，方便你在阅读和改造时有个「雷区清单」。

### 5.1 命名与语义不统一

- Cookie 名仍为 `toki-nwpushare-access-token`。
- Redis key 前缀为 `kun:touchgal`（见 `lib/redis.ts`）。
- S3 存储路径中仍包含 `touchgal/galgame` 等字样（`lib/s3.ts`）。
- 课程评论类型仍复用 `PatchComment`（`types/api/patch`），而不是课程专用类型。
- 部分 API 路由仍带 `galgame` 前缀，如：
  - `app/api/tag/galgame/route.ts`
  - `app/api/company/galgame/route.ts`
  - `app/api/admin/galgame/route.ts`

### 5.2 功能缺口 / 半完成状态

- 课程帖子 `post`：
  - 仅有 `GET /api/course/[dept]/[slug]/posts`，缺少创建 / 修改 / 删除接口。
  - 前端 `components/course/PostList.tsx` 尚未完全接入编辑器（Milkdown）与 API。
- 课程资源详情页：
  - `components/course/ResourceList.tsx` 中的链接是 `/course/${dept}/${slug}/r/${id}`。
  - 但目前 `app/course` 下没有对应 `r/[id]` 路由，资源详情页尚未实现。
- 课程资源审核流：
  - 新的 `resource.status` 已支持 `pending/published/rejected`。
  - 但后台审核仍依赖旧 `app/api/admin/resource/route.ts`。
- 评论与点赞：
  - 课程评论的点赞模型 `course_comment_like` 已存在，但点赞 API 尚未完全落地。
  - 旧的 patch 评论点赞逻辑与课程评论混用，需明确边界。

### 5.3 风险点

- 自研 JWT + Redis：
  - 登录逻辑集中在自研实现上，一旦逻辑出错（如 Redis 连接异常）可能导致全站登录态异常。
  - 与未来接入 BetterAuth 的目标存在技术债。
- 嵌套模型复杂：
  - `user` 模型同时承担旧补丁站与新课程站的所有关系，字段极多。
  - 新手在 debug 用户相关问题时容易被大量 patch 关联干扰。

> 这些问题本身并不意味着系统不能用，只是告诉你「哪里以后需要重构」，避免你在一开始就被它们搞得心态崩。

---

## 6. 推荐学习与实战路线（后端版 Roadmap）

下面是一条「从语法到实战」的路线图，全部都是围绕本项目后端来设计的。你可以当成一个长期的 TODO 列表来执行。

### 阶段 0：环境与基础（已完成可跳过）

- 跑通项目，能登录。
- 读完：
  - `project.md`
  - `docs/improvement-guide.md`
  - `11-11.md`
  - `AGENTS.md`
- 能说出：
  - 课程域有哪些模型：department / course / resource / post / comment / course_feedback 等。
  - API 大致分布在哪些目录：`app/api/course/**`、`app/api/auth/**` 等。

### 阶段 1：一条链路走通（课程详情页）

目标：可以手写或口述从浏览器访问 `/course/[dept]/[slug]` 时发生了什么。

任务：

1. 按本文件第 1 节的步骤，完整阅读：
   - `app/course/[dept]/[slug]/page.tsx`
   - `components/course/Header.tsx`
   - 相关 Tabs（特别是资源、评论、反馈）。
   - `app/api/course/[dept]/[slug]/route.ts`
   - `prisma/schema/course.prisma` 中 `course` / `department` / `course_teacher`。
2. 在关键节点加 `console.log`：
   - 页面获取数据时。
   - API 被调用时。
   - Prisma 查库时。
3. 用 seed 出来的课程做实际访问，确认每个日志都打出来。

验收标准：

- 你能够在纸上画出这条链路，并写明每一步是哪个文件在做哪件事。

### 阶段 2：改造课程列表 API（简单改造练手）

目标：熟悉 Zod + Prisma + Route Handler 的组合。

任务：

1. 在 `app/api/course/list/route.ts` 中：
   - 为 Query 增加一两个过滤条件（如最小红心数、最小资源数）。
   - 在 `where` 中拼装对应条件。
2. 在前端 `/course` 页面中：
   - 在搜索表单中增加一个简单的筛选项（比如「只看有资源的课程」）。
   - 把参数传入 URL 的 Query 中。
3. 用浏览器和 `curl` 测试：
   - 确保过滤条件生效。

验收标准：

- 当你修改 Query Schema 或 Prisma where 时，不再紧张，看得懂错误信息。

### 阶段 3：补齐课程帖子 API 与前端（中等难度）

目标：让「经验贴」真正成为课程详情页的一个可用 Tab。

任务（后端部分）：

1. 在 `app/api/course/[dept]/[slug]/posts/route.ts` 中：
   - 保留现有 `GET`。
   - 新增 `POST`（创建帖子）：
     - 请求体字段：`title`、`content`（Markdown / HTML）、`term`、`teacherId` 等。
     - 通过 `verifyHeaderCookie` 确保登录。
     - 写入 `post` 表。
     - 同步更新 `course.post_count`。
   - 视需要新增 `PUT` / `DELETE`：
     - 权限控制：作者或管理员。
2. 新建对应的 Zod 校验文件：
   - `validations/post.ts`（或把 schema 先放进 `validations/course.ts` 也可以，后续再拆）。

任务（前端部分，略）：

- 复用 Milkdown 编辑器组件（可参考旧补丁站的帖子编辑）。
- 在 `components/course/PostList.tsx` 中调用新建/修改帖子 API。

验收标准：

- 对一个课程，你可以从「没有帖子」到「创建一篇帖子 → 列表展示 → 修改/删除」全链路地操作一遍。

### 阶段 4：实现课程资源审核 API（中等偏上）

目标：建立起课程资源从 `pending` → `published/rejected` 的后端流程。

任务：

1. 新建 `app/api/admin/course-resource/route.ts`：
   - `GET`：
     - 读取分页参数与筛选条件（如 `status`、`dept`、`courseId`）。
     - 只允许 `role >= 3` 的用户访问。
     - 返回 pending 资源列表，包含投稿者与课程信息。
   - `PUT`：
     - 接收 `resourceId` 和 `status` (`published` / `rejected`)。
     - 校验权限。
     - 更新 `resource` 记录。
     - 对 `published` 的资源，更新对应 `course.resource_count`。
2. 为新接口编写 Zod schema（`validations/admin-course-resource.ts` 等）。
3. 使用 `curl` / Thunder Client 手动调用接口，完成从 pending → published 的变更。

验收标准：

- seed 后上传一个课程资源，能看到它在 admin 接口中的 pending 状态。
- 修改状态后，对应课程的 `resource_count` 有变化（可直接用 Prisma Studio 或 `psql` 查询验证）。

### 阶段 5：清理命名与 Legacy（长期任务）

目标：让项目从命名上彻底告别「Galgame / Patch」语境，变成真正的「NWPUShare」。

任务：

1. 统一命名（分多次小步完成）：
   - Cookie 名、Redis 前缀、S3 Bucket Key 中逐步替换掉 `galgame` / `touchgal`。
   - 注意：这一步可能影响线上环境，需要在本地充分验证后再改。
2. 提炼课程域类型：
   - 把 `PatchComment` 替换为课程专用类型 `CourseComment`。
   - 把 patch 相关的工具/类型迁移到 `archive`。
3. 用户中心与 admin 页面改造：
   - 从「补丁资源」统计改为「课程资源 + 课程评论 + 课程反馈」统计。

验收标准：

- 你能做到**新增一段代码时不再出现「patch/galgame」字样**，旧代码则逐步归档或改名。

### 阶段 6：鉴权体系升级（BetterAuth，进阶）

> 这一阶段适合你对项目整体已经比较熟悉时再做。

任务（简略版）：

1. 按 `project.md` 第 7 节所述：
   - 在 `prisma/schema/user.prisma` 中增加 BetterAuth 所需的 `User/Account/Session` 模型。
   - `pnpm prisma:generate && pnpm prisma:push`。
2. 新建 `lib/auth.ts`，用 `createBetterAuth` 与 `prismaAdapter` 创建实例。
3. 新增 `app/api/auth/[...betterauth]/route.ts` 接管认证路由。
4. 调整中间件：
   - 使用 BetterAuth 的 `verifyRequest` 替代手动解析 JWT。
5. 前端：
   - 替换现有登录流程为 BetterAuth 提供的登录方式（如邮箱登录）。

验收标准：

- 你可以关闭旧的 JWT 登录接口，而整个站点仍然能正常登录、访问受保护页面。

---

## 7. 小结：如何高效地「看明白 + 实战」？

- 不要试图一次读完所有文件。
  - 优先从一条完整链路入手（课程详情页），再向两边扩展（资源、评论、反馈、帖子）。
- 每读一个模块，都给自己设计一个**小练习**：
  - 加一个查询条件、加一个字段、改一个排序。
  - 成功跑通以后，把「改前/改后 + 验证方法」记在 `improve/` 或你自己的笔记里。
- 保持对「问题清单」的敏感：
  - 看到 `galgame` / `patch` 字样不要立刻删，先确定它是否还被使用。
  - 逐步替换为课程语义，而不是一把梭。

只要你按这份文档的路线走，从课程详情链路开始，逐步完成几个实战 TODO，你就不仅是「看懂了这个项目」，而是「真正对它有掌控力」了——可以自信地说：这是我能维护、也能迭代的后端。

如果你走到某一步卡住了，可以在注释或单独文档里记下「卡住点 + 大致思路」，之后我们可以一起把那一块拆得更细，甚至具体到每一行代码地讲。\*\*\*
