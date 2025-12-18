# 🧹 需要清理的功能清单

> 根据项目现状分析，以下是可能需要清理的功能模块

---

## 📊 功能状态概览

| 功能模块 | 状态 | 优先级 | 预计工作量 |
|---------|------|--------|-----------|
| Patch/Galgame 系统 | 🔴 已废弃 | 高 | 4-6小时 |
| 收藏夹功能 | 🟡 部分禁用 | 中 | 2-3小时 |
| 评分系统 | 🟡 可能不需要 | 低 | 3-4小时 |
| 公司/厂商系统 | 🔴 已废弃 | 高 | 2-3小时 |
| 标签系统 (Patch) | 🔴 已废弃 | 高 | 2-3小时 |
| 评论系统 (Patch) | 🔴 已废弃 | 高 | 2-3小时 |

---

## 1️⃣ Patch/Galgame 系统 (已废弃) 🔴

### 描述
这是旧的视觉小说/Galgame 补丁管理系统，现在项目已转型为课程资源共享平台，该系统已完全废弃。

### 涉及的数据库模型
```prisma
// prisma/schema/patch.prisma
- model patch                      // 补丁主表
- model patch_alias                // 补丁别名

// prisma/schema/patch-resource.prisma
- model patch_resource             // 补丁资源
- model user_patch_resource_like_relation  // 资源点赞关系
```

### 涉及的 API 路由
```
app/api/admin/galgame/route.ts      ❌ 需删除
app/api/tag/galgame/route.ts        ❌ 需删除
app/api/user/profile/resource/      ⚠️  需评估 (可能被课程资源使用)
```

### 涉及的页面和组件
```
- 无专门的页面 (已在 archive/)
- 面包屑导航中有 Galgame 引用
```

### 清理步骤
1. **删除数据库模型** (⚠️ 需要数据迁移)
   ```bash
   # 1. 注释掉 prisma/schema/patch.prisma 中的模型
   # 2. 注释掉 prisma/schema/patch-resource.prisma 中的模型
   # 3. 生成迁移
   pnpm prisma migrate dev --name remove-patch-system
   ```

2. **删除 API 路由**
   ```bash
   rm -rf app/api/admin/galgame
   rm -rf app/api/tag/galgame
   ```

3. **清理常量引用**
   ```bash
   # 搜索并删除 galgame 相关常量
   grep -r "galgame\|Galgame" constants/
   ```

4. **更新面包屑导航**
   ```typescript
   // constants/routes/routes.ts
   // 删除 Galgame 相关的面包屑逻辑
   ```

---

## 2️⃣ 收藏夹功能 (已部分禁用) 🟡

### 描述
用户收藏 Patch 的功能，代码中已经被注释掉了，但数据库模型和 API 路由还在。

### 涉及的数据库模型
```prisma
// prisma/schema/user.prisma
- model user_patch_favorite_folder           // 收藏夹
- model user_patch_favorite_folder_relation  // 收藏关系
```

### 涉及的 API 路由
```
app/api/user/profile/favorite/route.ts        ⚠️  功能已注释
app/api/user/profile/favorite/folder/         ⚠️  整个目录
  - create.ts
  - delete.ts
  - get.ts
  - patch/route.ts
  - route.ts
  - update.ts
```

### 当前状态
```typescript
// app/api/user/profile/favorite/route.ts
export const getUserFavorite = async (input) => {
  // const [data, total] = await Promise.all([...])  // 已注释
  return { favorites: [], total: 0 }  // 返回空数据
}
```

### 清理建议

**选项 A: 完全删除** (推荐)
```bash
# 1. 删除 API 路由
rm -rf app/api/user/profile/favorite

# 2. 删除数据库模型
# 注释掉 prisma/schema/user.prisma 中的:
# - user_patch_favorite_folder
# - user_patch_favorite_folder_relation

# 3. 生成迁移
pnpm prisma migrate dev --name remove-favorite-system
```

**选项 B: 改造为课程收藏**
如果想保留收藏功能用于课程：
```prisma
// 重命名为课程收藏
model user_course_favorite_folder {
  // 重构为课程收藏夹
}
```

---

## 3️⃣ Patch 评分系统 (可能不需要) 🟡

### 描述
用户对 Patch 进行评分的功能，包括推荐度、游戏时长、简短评价等。现在项目是课程平台，可能不需要这么复杂的评分系统。

### 涉及的数据库模型
```prisma
// prisma/schema/patch-rating.prisma
- model patch_rating              // 评分表
- model patch_rating_like         // 评分点赞
- model patch_rating_stat         // 评分统计 (聚合表)
```

### 字段详情
```prisma
model patch_rating {
  recommend     String  // strong_no, no, neutral, yes, strong_yes
  overall       Int     // 1-10 评分
  play_status   String  // 游戏进度
  short_summary String  // 简短评价
  spoiler_level String  // 剧透级别
}
```

### 涉及的 API 路由
```
app/api/course/[dept]/[slug]/rating/route.ts  ⚠️  课程评分 (不要删除!)
```

### 清理建议

**⚠️ 注意:** 课程模块有自己的评分系统 `course_feedback`，不要删错！

**只删除 Patch 评分系统:**
```bash
# 1. 删除数据库模型
# 注释掉 prisma/schema/patch-rating.prisma 中的所有模型

# 2. 删除 API 路由 (如果有单独的 patch rating API)
# 注意: 不要删除 app/api/course/.../rating/

# 3. 生成迁移
pnpm prisma migrate dev --name remove-patch-rating-system
```

---

## 4️⃣ 公司/厂商系统 (已废弃) 🔴

### 描述
管理 Galgame 制作公司的功能，对课程平台完全无用。

### 涉及的数据库模型
```prisma
// prisma/schema/patch-company.prisma
- model patch_company              // 公司/厂商表
- model patch_company_relation     // Patch-公司关联表
```

### 字段详情
```prisma
model patch_company {
  name             String
  introduction     String
  primary_language String[]
  official_website String[]
  parent_brand     String[]
  alias            String[]
}
```

### 涉及的 API 路由
```
- 无单独的 API 路由 (已在 archive/)
```

### 清理步骤
```bash
# 1. 删除数据库模型
# 删除整个文件: prisma/schema/patch-company.prisma

# 2. 从 user 模型中删除关联
# 编辑 prisma/schema/user.prisma:
# 删除: patch_company patch_company[]

# 3. 生成迁移
pnpm prisma migrate dev --name remove-company-system
```

---

## 5️⃣ Patch 标签系统 (已废弃) 🔴

### 描述
Patch 的标签分类系统，类似于游戏的类型标签（如"恋爱"、"推理"等）。课程平台用不到。

### 涉及的数据库模型
```prisma
// prisma/schema/patch-tag.prisma
- model patch_tag                  // 标签表
- model patch_tag_relation         // Patch-标签关联表
```

### 涉及的 API 路由
```
app/api/tag/galgame/route.ts       ❌ 需删除
```

### 清理步骤
```bash
# 1. 删除 API 路由
rm -f app/api/tag/galgame/route.ts

# 2. 删除数据库模型
# 删除整个文件: prisma/schema/patch-tag.prisma

# 3. 从 user 模型中删除关联
# 编辑 prisma/schema/user.prisma:
# 删除: patch_tag patch_tag[]

# 4. 生成迁移
pnpm prisma migrate dev --name remove-patch-tag-system
```

---

## 6️⃣ Patch 评论系统 (已废弃) 🔴

### 描述
Patch 的评论功能，包括评论和点赞。**注意：课程有自己的评论系统 `comment` 模型，不要删错！**

### 涉及的数据库模型
```prisma
// prisma/schema/patch-comment.prisma
- model patch_comment                    // Patch 评论表
- model user_patch_comment_like_relation // 评论点赞关系表
```

### 字段详情
```prisma
model patch_comment {
  id         Int
  content    String
  edit       String       // 编辑历史
  reply      patch_comment[]  // 回复关系
  parent_id  Int?
  user_id    Int
  patch_id   Int          // ⚠️ 关联到 patch 表
}
```

### 涉及的 API 路由
```
app/api/comment/route.ts           ⚠️  需检查是否混用
```

### ⚠️ 重要区分

| 保留 (课程评论) | 删除 (Patch 评论) |
|----------------|------------------|
| `comment` (course.prisma) | `patch_comment` (patch-comment.prisma) |
| `course_comment_like` | `user_patch_comment_like_relation` |
| 关联到 `course_id` | 关联到 `patch_id` |

### 清理步骤
```bash
# 1. 删除数据库模型
# 删除整个文件: prisma/schema/patch-comment.prisma

# 2. 从 user 模型中删除关联
# 编辑 prisma/schema/user.prisma:
# 删除: patch_comment patch_comment[] @relation("user_patch_comment")
# 删除: patch_comment_like user_patch_comment_like_relation[]

# 3. 检查 API 路由是否混用
grep -r "patch_comment" app/api/

# 4. 生成迁移
pnpm prisma migrate dev --name remove-patch-comment-system
```

---

## 7️⃣ 其他需要清理的内容

### 7.1 常量文件中的 Galgame 引用

```bash
# 查找所有 Galgame 相关常量
grep -r "galgame\|Galgame\|GALGAME" constants/

# 涉及文件:
constants/routes/routes.ts          # 面包屑导航
constants/routes/constants.ts       # 路由常量
constants/history.ts                # 可能有历史记录相关
constants/resource.ts               # 资源类型定义
constants/admin.ts                  # 管理员相关
constants/api/select.ts             # API 查询字段
```

### 7.2 Email 模板中的旧品牌名

```bash
# 查看邮件模板
cat constants/email/templates/touchgal.ts

# 这个文件整个都是 TouchGAL 相关的邮件模板
# 需要重写或删除
```

### 7.3 配置文件清理

```bash
# 查看配置
cat config/nwpushare.ts

# 可能需要移除旧的 Galgame 相关配置
```

---

## 🚀 推荐清理顺序

### 阶段 1: 删除明确废弃的功能 (优先级: 高)

```bash
# 1. 公司/厂商系统
rm prisma/schema/patch-company.prisma

# 2. Patch 标签系统
rm prisma/schema/patch-tag.prisma
rm app/api/tag/galgame/route.ts

# 3. Patch 评论系统
rm prisma/schema/patch-comment.prisma
```

### 阶段 2: 删除核心 Patch 系统 (优先级: 高)

```bash
# 4. Patch 主表和资源
# 注释掉 prisma/schema/patch.prisma
# 注释掉 prisma/schema/patch-resource.prisma

# 5. 删除 Galgame 相关 API
rm -rf app/api/admin/galgame
```

### 阶段 3: 清理收藏和评分 (优先级: 中)

```bash
# 6. 收藏夹功能
rm -rf app/api/user/profile/favorite

# 7. Patch 评分系统
# 注释掉 prisma/schema/patch-rating.prisma
```

### 阶段 4: 清理常量和配置 (优先级: 低)

```bash
# 8. 清理常量中的 Galgame 引用
# 手动编辑 constants/ 目录下的文件

# 9. 清理邮件模板
# 删除或重写 constants/email/templates/touchgal.ts
```

---

## 📝 数据库迁移完整脚本

创建一个完整的迁移来删除所有 Patch 相关内容：

```sql
-- 1. 删除 Patch 评论系统
DROP TABLE IF EXISTS "user_patch_comment_like_relation" CASCADE;
DROP TABLE IF EXISTS "patch_comment" CASCADE;

-- 2. 删除 Patch 标签系统
DROP TABLE IF EXISTS "patch_tag_relation" CASCADE;
DROP TABLE IF EXISTS "patch_tag" CASCADE;

-- 3. 删除 Patch 公司系统
DROP TABLE IF EXISTS "patch_company_relation" CASCADE;
DROP TABLE IF EXISTS "patch_company" CASCADE;

-- 4. 删除 Patch 评分系统
DROP TABLE IF EXISTS "patch_rating_like" CASCADE;
DROP TABLE IF EXISTS "patch_rating_stat" CASCADE;
DROP TABLE IF EXISTS "patch_rating" CASCADE;

-- 5. 删除 Patch 资源系统
DROP TABLE IF EXISTS "user_patch_resource_like_relation" CASCADE;
DROP TABLE IF EXISTS "patch_resource" CASCADE;

-- 6. 删除收藏夹系统
DROP TABLE IF EXISTS "user_patch_favorite_folder_relation" CASCADE;
DROP TABLE IF EXISTS "user_patch_favorite_folder" CASCADE;

-- 7. 删除 Patch 主表
DROP TABLE IF EXISTS "patch_alias" CASCADE;
DROP TABLE IF EXISTS "patch" CASCADE;
```

---

## ⚠️ 注意事项

### 1. 数据备份
删除任何表之前，务必备份数据库：
```bash
pg_dump -U username -d database > backup_before_cleanup_$(date +%Y%m%d).sql
```

### 2. 不要删除课程相关的模型
保留以下模型（在 `prisma/schema/course.prisma`）：
- ✅ `department` - 学院
- ✅ `course` - 课程
- ✅ `course_feedback` - 课程反馈
- ✅ `resource` - 课程资源
- ✅ `resource_rating` - 资源评分
- ✅ `post` - 帖子
- ✅ `comment` - 评论（课程评论）
- ✅ `course_comment_like` - 评论点赞
- ✅ `teacher` - 教师
- ✅ `badge` - 徽章

### 3. 用户模型清理
清理 `prisma/schema/user.prisma` 中的关联：
```prisma
// 删除这些关联:
// patch_comment_like    user_patch_comment_like_relation[]
// patch_resource_like   user_patch_resource_like_relation[]
// patch_favorite_folder user_patch_favorite_folder[]
// patch_company         patch_company[]
// patch_rating          patch_rating[]
// patch_rating_like     patch_rating_like[]
// patch                 patch[] @relation("user_patch")
// patch_comment         patch_comment[] @relation("user_patch_comment")
// patch_resource        patch_resource[] @relation("user_patch_resource")

// 保留这些 (课程相关):
// course_resource       resource[] @relation("user_course_resource") ✅
// course_feedback       course_feedback[] ✅
// resource_ratings      resource_rating[] ✅
// posts                 post[] ✅
// comments              comment[] ✅
// course_comment_like   course_comment_like[] ✅
```

---

## ✅ 清理完成后的验证

### 1. 数据库检查
```bash
# 查看所有表
psql -U username -d database -c "\dt"

# 应该只看到课程相关的表，没有 patch_* 表
```

### 2. TypeScript 类型检查
```bash
pnpm prisma generate
pnpm typecheck
```

### 3. 功能测试
```bash
pnpm dev

# 测试:
# - 登录/注册 ✓
# - 浏览课程 ✓
# - 上传课程资源 ✓
# - 评论功能 ✓
# - 课程反馈 ✓
```

---

## 📊 预期效果

清理完成后，项目将：

### 数据库简化
- ❌ 删除 14 个 Patch 相关表
- ✅ 保留 15 个课程相关表
- 📉 减少约 40% 的数据库复杂度

### 代码简化
- ❌ 删除约 20+ 个废弃的 API 路由
- ❌ 删除约 50+ 个废弃的组件
- 📉 减少约 30% 的代码量

### 维护成本
- ✅ 减少模型之间的复杂关联
- ✅ 降低数据迁移风险
- ✅ 提高代码可读性

---

## 📚 相关文档

- `docs/CLEANUP-GUIDE.md` - TouchGAL 品牌清理指南
- `docs/REMOVE-2FA-MIGRATION.md` - 2FA 功能移除指南
- `docs/REMOVE-NSFW-MIGRATION.md` - NSFW 功能移除指南
- `docs/system-architecture.md` - 系统架构文档

---

*生成时间: 2025-12-18*
