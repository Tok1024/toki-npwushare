![toki-learning-hub](./public/touchgal.avif)

# Toki Learning Hub

Toki Learning Hub 是一个面向校园与自学场景的资料共享站。课程页面聚合了课件、链接、经验帖与讨论，为“信号与系统 / 数据结构”等课程提供统一的上载、浏览与互动能力。所有资源都只保存外链信息，作者可以自由选择自己的网盘或仓库承载文件。

## 功能概览

- 课程中心：以 `学院 + 课程` 为核心实体，整合课程信息、资源、经验帖与教师统计。
- 资源链接：复用对象存储/自定义链接表单，只保留链接与元信息，不做二次存储。
- 讨论与评分：课程页内置评论、点赞与评分 Tab，方便记录学习心得。
- 管理后台（WIP）：预留资源审核、用户管理、日志审计接口，便于未来部署在校园网。

## 快速启动

1. 安装依赖  
   ```bash
   pnpm install
   ```
2. 配置 `.env`（可参考 `.env.example`，常用变量如下）
   ```env
   KUN_DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/toki?schema=public
   NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV=http://127.0.0.1:3000
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   JWT_SECRET=please-change-me
   ```
3. 同步数据库并生成 Prisma Client  
   ```bash
   pnpm prisma:generate
   pnpm prisma:push
   pnpm run seed:courses   # 可选：导入示例学院/课程/资源
   ```
4. 启动开发服务器  
   ```bash
   pnpm dev
   ```

## 贡献说明

- 新增/修改功能前，请保证 `pnpm lint` 与 `pnpm typecheck` 通过。
- 所有 PR 需要附带：需求背景、测试方式、可回滚方案。
- UI/文案默认以“学习资料”与“Toki”品牌为准，避免混入旧的 Galgame 语境。

## 许可证

项目基于 `AGPL-3.0` 发行。二次分发请注明来源，并对外开放修改后的源码。
