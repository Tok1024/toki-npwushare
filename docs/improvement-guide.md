# Toki Learning Hub 自主迭代路线图（Step-by-step）

> 目标：帮助你（全栈初学者）循序渐进地完善课程资源网站。每个阶段都附带明确的任务、涉及的文件以及验收方式，照着做就能稳步前进。

## 第 0 阶段：准备环境
1. `cp .env.example .env`，至少填好数据库、Redis、`NEXT_PUBLIC_DISABLE_CAPTCHA=true`。
2. `pnpm install && pnpm prisma:generate && pnpm prisma:push`。
3. `pnpm run seed:courses`（可选，快速获得示例课程）。
4. `pnpm dev` 启动，访问 `http://127.0.0.1:3000/`，用 `seed@example.com / 123` 登录确认一切正常。

## 第 1 阶段：核心页面梳理
| 任务 | 操作 | 验收 |
| --- | --- | --- |
| 首页 Hero 与导航 | 查看 `components/home/hero/HomeHero.tsx`、`components/kun/top-bar/TopBar.tsx`，确认菜单项已是“浏览课程 / 浏览资源 / 学院 / 帮助 / 上传资源”。 | 在浏览器中点击导航，确保跳转到 `/course` / `/resource` / `/department` / `/doc` / `/edit/create`。 |
| 课程索引页 | 阅读 `app/course/page.tsx` 与 `components/home/course/CourseCard.tsx`，理解列表如何渲染。 | 搜索框能输入关键词并更新 URL（`?q=`），课程卡片点击后进入详情。 |
| 课程详情页 | `app/course/[dept]/[slug]/page.tsx` + `components/course/Header.tsx`。Tabs 包含“课程信息 / 课程资源 / 讨论版 / 课程反馈”。 | 在 seed 数据课程页面，资源列表与反馈区能展示内容。 |

## 第 2 阶段：API 与数据库
1. **课程详情 API**：`app/api/course/[dept]/[slug]/route.ts` → 负责汇总 Course + Teacher。
2. **资源列表/上传**：`app/api/course/[dept]/[slug]/resources/route.ts` + `validations/course.ts` 的 `courseResourceCreateSchema`。
3. **评论/反馈**：`app/api/course/[dept]/[slug]/comment/**`、`app/api/course/[dept]/[slug]/rating/route.ts`（红心 + 难度）。
4. **Prisma 模型**：新增字段位于 `prisma/schema/course.prisma`（`heart_count`、`difficulty_avg` 等）。

> 建议：每次改模型都运行 `pnpm prisma:generate`，再执行 `pnpm prisma:push` 同步结构。

## 第 3 阶段：资源上传体验
1. 页面入口：`app/edit/create/page.tsx`。
2. 核心组件：`components/course/upload/UploadResourceForm.tsx`，包含“选择学院/课程 + 新建课程”流程。
3. 表单处理：React Hook Form + Zod，在 `UploadResourceForm` 内部已经封装好，照着例子可以扩展字段（如教师、学期）。
4. 提交 API：`POST /api/course/[dept]/[slug]/resources`，自动创建缺失的学院/课程并将资源置为 `pending`。

验收：在 `/edit/create` 选择 `计算机学院 -> 信号与系统`，填入一个网盘链接，提交后转到课程详情页能看到 Pending 资源。

## 第 4 阶段：数据库与归档
1. **新旧 schema**：课程相关模型保留在 `prisma/schema/course.prisma`/`user.prisma`；旧 TouchGal 模型移入 `archive/touchgal/prisma/schema/`，不再参与编译。
2. **脚本归档**：`archive/README.md` 列出了老的页面/API/脚本，随时可参考。
3. **添加/修改模型**：
   - 扩展 `course` 表时同步更新 `scripts/seedCourses.ts`，保持演示数据完整。
   - 资源互动统计可使用 `resource_interaction`（click/download）配合 Cron 或触发器更新。

## 第 5 阶段：建议的迭代顺序
1. **Department 视图**：在 `app/department/[slug]` 实现学院页，列出课程、教师和资源统计。
2. **资源审核后台**：新建 `/admin/resources`（Server Component + API），读取 `resource.status`，提供 `pending → published/rejected`。
3. **用户中心（课程版）**：重写 `app/user/**`，只显示课程资源/评论/反馈，剔除补丁相关字段。
4. **搜索**：替换旧的补丁搜索逻辑，使用 `prisma.resource` + `prisma.course` 做课程/资源联搜。
5. **BetterAuth**：参照 `project.md`/Quickstart，接入官方认证；完成后删除自研 JWT/Redis 逻辑。

## 第 6 阶段：部署与回归
1. `pnpm build`（确保没有编译报错）。
2. `pnpm prisma:generate`（CI/CD 中保持最新类型）。
3. 生成 `.next/standalone` 后按 `scripts/postbuild.ts` 描述拷贝 `public` 与 `.next/static`。
4. 使用 Docker 或 PM2 在服务器上运行。

---

> Tip：每完成一个阶段，记得写下“变更点 + 验证方式”。即使是自学，也要把过程记录下来，方便回滚与复盘。
