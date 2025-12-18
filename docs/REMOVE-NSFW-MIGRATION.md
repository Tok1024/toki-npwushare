# 🔓 移除 NSFW/SFW 内容分级 - 数据库迁移指南

> 完成代码移除后的数据库字段清理

## ✅ 已完成的代码清理

### 1. **删除的文件**
- ❌ `components/kun/top-bar/NSFWSwitcher.tsx` - NSFW 切换组件
- ❌ `store/settingStore.ts` - 设置状态管理 (仅包含 NSFW 设置)
- ❌ `app/api/utils/getNSFWHeader.ts` - NSFW 请求头获取工具
- ❌ `utils/actions/getNSFWHeader.ts` - NSFW 请求头获取工具 (Server Actions)

### 2. **修改的文件**

#### **前端组件简化**
- ✅ `components/kun/top-bar/UserDropdown.tsx`
  - 移除 NSFWSwitcher 组件引用
  - 从用户下拉菜单中删除 NSFW 切换选项

- ✅ `components/kun/top-bar/_SettingsDropdown.tsx`
  - 移除 NSFWSwitcher 组件
  - 仅保留主题切换功能

#### **API 路由简化**
- ✅ `app/api/user/profile/resource/route.ts`
  - 移除 `nsfwEnable` 参数
  - 简化数据库查询,不再过滤 NSFW 内容

- ✅ `app/user/[id]/resource/actions.ts`
  - 移除 `getNSFWHeader` 调用
  - 简化函数参数传递

- ✅ `app/api/admin/galgame/route.ts`
  - 移除 `getNSFWHeader` 导入
  - 移除 `nsfwEnable` 参数
  - 简化 `where` 查询条件

- ✅ `app/api/admin/resource/get.ts`
  - 移除 `nsfwEnable` 参数
  - 简化数据库查询逻辑

- ✅ `app/api/admin/resource/route.ts`
  - 移除 `getNSFWHeader` 调用
  - 简化 GET 请求处理

- ✅ `app/api/user/profile/favorite/route.ts`
  - 移除 `getNSFWHeader` 调用
  - 移除 `nsfwEnable` 参数

- ✅ `app/api/tag/galgame/route.ts`
  - 移除 `getNSFWHeader` 导入
  - 移除 `nsfwEnable` 参数
  - 简化标签查询逻辑

#### **内容创建和更新逻辑**
- ✅ `app/api/edit/create.ts`
  - 移除 `contentLimit` 参数
  - 移除 `content_limit` 字段设置
  - 移除 `if (contentLimit === 'sfw')` 检查
  - **现在所有新创建的内容都会提交到 IndexNow (搜索引擎索引)**

- ✅ `app/api/edit/update.ts`
  - 移除 `contentLimit` 参数
  - 从数据库更新中移除 `content_limit` 字段

#### **验证 Schemas**
- ✅ `validations/edit.ts`
  - 从 `patchCreateSchema` 中移除 `contentLimit` 字段
  - 从 `patchUpdateSchema` 中移除 `contentLimit` 字段

#### **数据库 Schema**
- ✅ `prisma/schema/patch.prisma`
  - 移除 `content_limit` 字段

---

## 🗄️ 数据库迁移步骤

### **重要提示**

⚠️ **在执行数据库迁移前,请务必备份数据库！**

```bash
# PostgreSQL 备份命令
pg_dump -U username -h localhost database_name > backup_$(date +%Y%m%d).sql

# 或使用 Prisma 的数据导出
# (如果配置了相关工具)
```

---

### **方法 1: 使用 Prisma Migrate (推荐)**

适用于开发环境和生产环境。Prisma 会生成迁移脚本。

```bash
# 1. 生成迁移文件
pnpm prisma migrate dev --name remove-content-limit-field

# 这会:
# - 生成 SQL 迁移文件
# - 自动应用到数据库
# - 更新 Prisma Client

# 2. 查看生成的迁移 SQL
cat prisma/migrations/[timestamp]_remove-content-limit-field/migration.sql

# 应该包含类似这样的 SQL:
# ALTER TABLE "patch" DROP COLUMN "content_limit";
```

#### **生产环境部署**

```bash
# 在生产服务器上应用迁移
pnpm prisma migrate deploy
```

---

### **方法 2: 手动执行 SQL (仅供紧急情况)**

如果 Prisma Migrate 出现问题,可以手动执行 SQL。

```bash
# 连接到数据库
psql -U your_username -d your_database

# 或使用 GUI 工具如 pgAdmin, TablePlus 等
```

**执行以下 SQL:**

```sql
-- 删除 content_limit 字段
ALTER TABLE "patch" DROP COLUMN IF EXISTS "content_limit";

-- 验证字段已删除
\d "patch"
-- 或
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'patch'
AND column_name = 'content_limit';
```

**应该返回空结果,表示字段已删除。**

---

### **方法 3: Prisma Studio 可视化操作 (不推荐用于生产)**

⚠️ 仅用于开发环境学习和测试。

```bash
# 1. 打开 Prisma Studio
pnpm prisma studio

# 2. 手动编辑 Schema 不会自动删除字段
# 3. 必须使用 Prisma Migrate 或手动 SQL
```

---

## ✅ 迁移后验证

### **1. 检查数据库字段**

```bash
# 连接数据库
psql -U your_username -d your_database

# 查看 patch 表结构
\d "patch"

# 确认 content_limit 字段已不存在
```

### **2. 重新生成 Prisma Client**

```bash
pnpm prisma generate
```

### **3. 测试内容创建和查看流程**

```bash
# 启动开发服务器
pnpm dev

# 测试以下功能:
# 1. 创建新内容 ✓
# 2. 更新现有内容 ✓
# 3. 查看内容列表 ✓
# 4. 搜索内容 ✓
# 5. 管理员查看内容 ✓
```

### **4. 检查 TypeScript 类型**

```bash
# 运行类型检查
pnpm typecheck

# 应该没有 content_limit 相关的类型错误
```

---

## 🔍 潜在问题排查

### **问题 1: 迁移失败**

```
Error: Column "content_limit" does not exist
```

**原因:** 字段可能已经被删除,或表名不正确。

**解决方法:**
```bash
# 检查当前表结构
psql -U username -d database -c "\d patch"

# 如果字段确实不存在,可以忽略该错误
# 继续执行 prisma generate
pnpm prisma generate
```

---

### **问题 2: Prisma Client 类型错误**

```
Property 'content_limit' does not exist on type 'patch'
```

**原因:** 代码中还有残留的 content_limit 字段引用。

**解决方法:**
```bash
# 全局搜索残留引用
grep -r "content_limit\|contentLimit" --include="*.ts" --include="*.tsx" \
  app/ components/ lib/ validations/

# 删除或注释掉这些引用
```

---

### **问题 3: 运行时错误**

```
PrismaClientValidationError: Invalid `prisma.patch.findFirst()` invocation:
Unknown arg `content_limit` in select
```

**原因:** 某些查询中还在选择 content_limit 字段。

**解决方法:**
```bash
# 搜索 Prisma 查询中的 content_limit 字段
grep -r "content_limit" --include="*.ts" app/api/

# 从 select 和 where 子句中移除这个字段
```

---

## 📊 迁移前后对比

### **内容创建流程对比**

**迁移前 (有 NSFW 过滤):**
```
用户创建内容
    ↓
选择内容分级 (SFW/NSFW)
    ↓
保存到数据库 (content_limit: 'sfw' | 'nsfw')
    ↓
如果是 SFW → 提交到 IndexNow (搜索引擎索引)
如果是 NSFW → 不提交到搜索引擎
```

**迁移后 (无 NSFW 过滤):**
```
用户创建内容
    ↓
保存到数据库 (无 content_limit 字段)
    ↓
自动提交到 IndexNow (所有内容都索引)
```

### **内容查看流程对比**

**迁移前 (有 NSFW 过滤):**
```
用户访问内容列表
    ↓
检查用户 NSFW 设置 (从 Cookie 或默认值)
    ↓
查询数据库: WHERE content_limit = 用户设置
    ↓
返回过滤后的内容
```

**迁移后 (无 NSFW 过滤):**
```
用户访问内容列表
    ↓
查询数据库 (无过滤条件)
    ↓
返回所有内容
```

### **数据库字段对比**

| 迁移前 | 迁移后 | 说明 |
|--------|--------|------|
| `content_limit: String @default("") @db.VarChar(107)` | ❌ 已删除 | 内容分级标识 ('sfw' 或 'nsfw') |

---

## 🚀 部署到生产环境

### **部署检查清单**

- [ ] ✅ 已备份生产数据库
- [ ] ✅ 在测试环境验证迁移脚本
- [ ] ✅ 通知用户内容分级功能已移除
- [ ] ✅ 设置维护窗口 (建议 5-10 分钟)
- [ ] ✅ 准备回滚方案

### **部署步骤**

```bash
# 1. 备份生产数据库
pg_dump -U prod_user -h prod_host prod_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 部署新代码
git pull origin master

# 3. 安装依赖
pnpm install

# 4. 应用数据库迁移
pnpm prisma migrate deploy

# 5. 重新生成 Prisma Client
pnpm prisma generate

# 6. 重启应用
pm2 restart nwpushare

# 7. 验证服务
curl https://your-domain.com/api/health
```

### **回滚方案 (如果出现问题)**

```bash
# 1. 恢复数据库备份
psql -U prod_user -h prod_host prod_db < backup_[timestamp].sql

# 2. 回滚代码
git revert HEAD
git push origin master

# 3. 重启应用
pm2 restart nwpushare
```

---

## 📝 迁移日志示例

记录迁移过程,便于问题排查:

```
=== NSFW 移除迁移日志 ===

开始时间: 2024-XX-XX 10:00:00
执行人: Admin

1. 备份数据库: ✅
   - 备份文件: backup_20241218.sql
   - 文件大小: 234 MB

2. 代码部署: ✅
   - Commit: abc1234
   - Branch: master

3. 数据库迁移: ✅
   - 迁移文件: 20241218_remove_content_limit_field
   - 执行时间: 1.2 秒
   - 影响行数: 0 (结构变更)

4. 服务验证: ✅
   - 创建内容功能: 正常
   - 查看内容列表: 正常
   - 搜索功能: 正常
   - 管理员功能: 正常
   - API 响应: 正常

完成时间: 2024-XX-XX 10:05:30
总耗时: 5 分 30 秒

备注: 迁移顺利,无异常。所有内容现在都会自动提交到搜索引擎索引。
```

---

## 🎯 总结

### **完成的工作**

1. ✅ 删除所有 NSFW 相关的 UI 组件
2. ✅ 简化内容查看流程,移除 NSFW 过滤
3. ✅ 删除前端 NSFW 切换组件
4. ✅ 清理验证 Schemas
5. ✅ 更新数据库 Schema (删除 1 个字段)
6. ✅ 简化内容创建逻辑 (所有内容都提交到 IndexNow)

### **用户体验改进**

- 🚀 内容查看更快 (无需过滤)
- 🎯 界面更简洁 (移除 NSFW 切换选项)
- 🔍 所有内容都会被搜索引擎索引
- 🔧 维护更简单 (减少代码复杂度)

### **技术改进**

- 📉 减少数据库字段 (1 个字段)
- 📉 减少前端组件 (2 个组件)
- 📉 减少工具函数 (2 个文件)
- 📉 简化 API 查询逻辑 (7 个 API 路由)
- 📉 减少验证 Schema 字段 (2 个 schema)

### **功能变更**

- 🔄 **IndexNow 提交:** 从"仅 SFW 内容提交"变为"所有内容提交"
- 🔄 **内容查看:** 从"基于用户设置过滤"变为"显示所有内容"
- 🔄 **内容管理:** 管理员查看和管理所有内容,无需考虑分级

---

## 🆘 需要帮助?

如果在迁移过程中遇到任何问题:

1. 检查本文档的"潜在问题排查"部分
2. 查看 Prisma 文档: https://www.prisma.io/docs/
3. 查看项目日志: `pm2 logs nwpushare`
4. 回滚到迁移前的状态

---

*Generated with NWPUShare - 简化分级,提升体验*
