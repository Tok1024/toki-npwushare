# Repository Guidelines

## 当前定位
- 仓库已由 TouchGal 迁移为 **Toki Learning Hub**：面向课程资料/经验分享/讨论的学习平台。
- Next.js App Router + Prisma + PostgreSQL + Redis；客户端复用 HeroUI/Tailwind。
- 关键目录：`app/`（页面、API Route）、`components/`（课程、资源、评论、评分组件）、`prisma/schema`（课程实体拆分）、`scripts/`（seed/部署脚本）。

## 最新进展（2025-11-11）
- 顶部导航已替换为 “浏览课程 / 浏览资源 / 学院 / 帮助 / 上传资源”，但品牌 Logo 与主题色仍保留 TouchGal 风格。
- 课程详情页完全复用原 Galgame 详情视图并接入 `/api/course/[dept]/[slug]`，Tabs 中的资源、评论、评分均已与课程数据对齐。
- `/edit/create` 支持“先选学院/课程，缺失时再新建”流程，资源仅保存外链并自动落入 `pending` 审核状态。
- `scripts/seedCourses.ts` 现可一次写入多学院、多课程、资源、帖子、评分及评论，默认账号 `seed/alice/bob/carol@example.com` 密码均为 `123`。

## 代办与方向
1. **TopBar / 品牌**：菜单项已更新，但 `KunTopBarBrand` 与 TouchGal Logo、Hero 图、配色仍未替换，需要新的视觉稿与 favicon。
2. **彻底清理 Galgame 命名**  
   - 组件：`components/galgame`, `components/patch` 等仍包含游戏命名和内容；需逐步替换或迁移到 `course/*`。
   - 类型常量：`constants/galgame.ts`, `constants/resource.ts` 已部分改名，但仍有 patch/galgame 语义；后续根据需求裁剪。
3. **课程索引与学院视图**  
   - `/course`（列表 + 搜索 + 筛学院）。
   - `/department/[slug]`（学院视图，列出所有课程、教师、资源）。
4. **资源发布与审核流**  
   - 受保护 API：`POST /api/course/[dept]/[slug]/resources`（pending → published），后台审核页面 `/admin`.
   - 模型：`resource.status` 已具备 pending/published/rejected，可直接利用。
5. **课程笔记/帖子**  
   - 当前 `post` 模型/接口尚未绑定到页面；需复用 markdown 编辑器（Milkdown）实现 “经验贴” Tab。
6. **Brand 与视觉**  
   - Logo/配色仍是 TouchGal；需要替换 favicon、Hero 图、色彩文案。
7. **登录体验**  
   - 临时关闭了 captcha + 密码格式校验。未来恢复时记得重新启用 `loginSchema` 和 `checkKunCaptchaExist`。

## 环境 & 启动
1. `.env`（示例）  
   ```
   KUN_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/toki?schema=public
   NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV=http://127.0.0.1:3000
   NEXT_PUBLIC_DISABLE_CAPTCHA=true
   JWT_SECRET=please-change-me
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   ```
2. 初始化  
   ```bash
   pnpm install
   pnpm prisma:generate
   pnpm prisma:push
   pnpm run seed:courses # 可选：导入示例学院/课程/资源
   pnpm dev
   ```
3. Seed 用户  
   - `seed@example.com / 123`（管理员角色），用于测试评论/评分/上传资源。

## 架构概览
- **课程域**  
  - Prisma 模型：`department`、`teacher`、`course`、`course_teacher`、`resource`、`post`、`comment`、`course_rating`。
  - API：`/api/course/**`（详情、资源、帖子、评论、评分、列表）。
  - 前端：`components/course/*`（Header/Tabs/ResourceList/Comments/Ratings），`components/home/*`（课程列表）。
- **登录/鉴权**  
  - 现用自研 JWT + Redis；BetterAuth 尚未接入。
  - 登录表单在 `components/login/Login.tsx`，暂时关闭 captcha/密码格式校验，仅校验数据库哈希。

## 工作流 & 代码风格
- TypeScript + ESLint/Prettier；Tailwind 风格在 JSX 中使用 `className="..."`。
- 服务端逻辑放在 Server Components、Route Handler 或 `app/**/actions.ts`。
- 状态管理：`store/*`（Zustand），例如用户/搜索设置。
- 依赖：HeroUI 组件库、Milkdown（富文本）、React Hook Form + Zod。

## 测试与提交流程
- 目前无自动化测试，依赖 `pnpm lint`、`pnpm typecheck` 及手动验证。
- Commit 风格：`feat: ...` / `fix: ...` / `mod: ...`。
- PR 需注明变更点与测试方式，附截图或日志（尤其是 UI/数据层变更）。
