# TouchGal Legacy Archive

本目录保存了旧 TouchGal 时代的代码与脚本，便于随时参考或对比。当前课程资源平台不会编译这些文件（`tsconfig.json` 已排除 `archive/**`），因此它们不会影响新版站点的打包与部署。

## 目录结构

| 路径              | 说明                                                    |
| ----------------- | ------------------------------------------------------- |
| `app/`            | 旧的页面与 API，例如 Galgame 列表、补丁后台、搜索页等。 |
| `components/`     | Galgame/Patch 相关的 UI、管理后台组件、搜索筛选器等。   |
| `prisma/schema`   | `patch*.prisma` 定义的补丁/公司/标签等模型。            |
| `scripts/`        | 动态路由与 sitemap 生成、补丁迁移脚本等。               |
| `server/`         | 定时任务与触发器（每日清零、同步补丁类别等）。          |
| `migration/`      | 旧库的数据修复脚本。                                    |
| `uploads/`        | 早期静态文件与示例资源。                                |
| `external-api.ts` | 触发外部补丁 API 同步的地址常量。                       |

## 使用方式

1. **查阅历史逻辑**：若需要参考旧的补丁上传/审核流程，可直接在 `archive/touchgal/app/api/patch/**` 或 `components/patch/**` 中查找。
2. **局部复制**：需要某个组件或脚本时，可以将文件复制回主目录（例如把 `components/patch/resource/Tabs.tsx` 拿出来重写）。
3. **恢复旧功能**：如果确实要恢复 TouchGal 模块，先把对应目录移回，随后执行 `pnpm prisma:generate` 以恢复相关模型。

> 提示：请勿直接在 `archive` 内修改代码并期望生产环境生效——这里的内容不会被 Next.js 编译，也不会随构建产出到 `.next/standalone`。
