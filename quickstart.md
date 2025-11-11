# Quickstart：Toki Learning Hub 新手实践指北

> 目标：让刚接触 React / Next.js 的你，能在一小时内理解项目结构，并完成“为课程新增一条资源链接”这一小任务。

## 1. 熟悉基本术语
- **Next.js App Router**：每个 `app/**/page.tsx` 就是一页，`app/**/route.ts` 是该路径的 API。
- **Server Component / Client Component**：不写 `'use client'` 的组件在服务器渲染，可直接 `await` 数据；带 `'use client'` 的组件可以使用 hooks 与浏览器 API。
- **Prisma**：数据库 ORM，模型拆分在 `prisma/schema/*.prisma`，入口 `prisma/index.ts`。
- **HeroUI**：组件库（Button、Card、Tabs 等），配合 Tailwind 类名使用。

## 2. 浏览器 ↔ API ↔ 服务器的路由
```
浏览器触发事件（Client Component）
    ↓ fetch (utils/kunFetch 或 window.fetch)
/api/... Route Handler（app/api/**/route.ts）
    ↓ Prisma 调用数据库（prisma/index.ts）
PostgreSQL 存储结果
```
例：课程资源 Tab
1. `components/course/tabs/CourseResourceTab.tsx`（Client）用 `kunFetchGet('/course/{dept}/{slug}/resources')` 请求数据。
2. 对应的 API 在 `app/api/course/[dept]/[slug]/resources/route.ts`，从 Prisma 拿资源列表并返回 JSON。
3. Client Component 拿到 JSON 后映射成补丁的 `ResourceTabs` UI。

## 3. 学习路线（建议）
1. **跑起来**：  
   ```bash
   pnpm install
   pnpm prisma:generate
   pnpm prisma:push
   pnpm run seed:courses   # 示例数据（学院/课程/资源）
   pnpm dev
   ```
   打开 `http://127.0.0.1:3000/`，seed 用户 `seed@example.com / 123` 登录。
2. **看文件位置**：  
   - `app/course/[dept]/[slug]/page.tsx`：课程详情页入口。  
   - `components/course/Header.tsx`：课程信息 + Tabs。  
   - `components/course/comment/*`、`components/course/rating/*`：评论/评分。  
   - `app/api/course/**`：课程相关 API。  
   - `scripts/seedCourses.ts`：示例数据脚本。
3. **理解函数流**：从页面进入对应组件 -> 组件调用 API -> API 查询 Prisma -> 返回 JSON -> 组件渲染 UI。

## 4. 练手任务：为课程新增一条资源链接
### 4.1 观察现状
- 页面：访问 `/course/cs/signal-and-system`，切到「课程资源」Tab。  
- API：`GET /api/course/cs/signal-and-system/resources`（可通过浏览器 Network 或 curl 查看）。  
- 数据：Prisma `resource` 模型（`prisma/schema/course.prisma`）只保留 `links[]`、`author_id` 等信息。

### 4.2 创建 API（POST）
1. 新建 `app/api/course/[dept]/[slug]/resources/create/route.ts`（或直接扩展现有 route.ts 的 `POST` 方法）。  
2. 校验输入（课程 ID、title、type、links）。可以参考 `courseRatingCreateSchema`，在 `validations/course.ts` 新增 `courseResourceCreateSchema`。  
3. 逻辑：和 GET 同样先找 department 与 course，校验登录用户后 `prisma.resource.create`。

### 4.3 前端按钮（Client Component）
1. 在 `components/course/tabs/CourseResourceTab.tsx` 添加一个 “上传资源” 按钮（只有登录用户可见）。  
2. 使用 HeroUI Modal + React Hook Form（或简单 `useState`）收集 `title/type/links`。  
3. 点击提交时调用 `kunFetchPost('/course/${dept}/${slug}/resources', body)`，成功后刷新列表或本地 `setResources([...resources, newResource])`。

### 4.4 联调验证
1. 确保 `.env` 中 `NEXT_PUBLIC_DISABLE_CAPTCHA=true`，使用 seed 用户登录。  
2. 在课程页点击上传，填写标题、选择类型（`constants/resource.ts` 中已有分类），填入任意网盘链接。  
3. 刷新页面，确认新资源出现在列表。  
4. 打开 `/api/course/cs/signal-and-system/resources?page=1&pageSize=20`，能看到新记录。

## 5. 常见问题
- **`Failed to fetch`**：多半是 `NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV` 与当前 host 不一致；`kunFetch` 已 fallback `window.location.origin`，但最好在 `.env.local` 中显式设置。
- **登录一直失败**：seed 用户的密码必须用 `hashPassword` 写入。运行 `pnpm run seed:courses` 会生成 `seed@example.com / 123`。
- **样式不生效**：HeroUI 组件大多需要配合 Tailwind 类名（例如 `className="space-y-4"`）使用，记得观察已有代码风格。

## 6. 下一步建议
- 重构 `components/kun/top-bar/*`，加入“浏览课程 / 浏览资源/ 学院 / 帮助 / 上传资源”菜单。
- 实现 `/course` 列表、`/department/[slug]` 学院视图。
- 资源审核流：`resource.status` 已具备 `pending/published/rejected`，可以在 `/admin` 区域复用。

> 不要怕文件多，按照“页面 → 组件 → API → Prisma 模型”的顺序去找，就能清楚每个功能的上下游。如果遇到不懂的 TS/React 用法，先看现有组件怎么写，再动手模仿一遍，会进步得更快。
