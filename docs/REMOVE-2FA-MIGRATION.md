# 🔓 移除 2FA 双因素认证 - 数据库迁移指南

> 完成代码移除后的数据库字段清理

## ✅ 已完成的代码清理

### 1. **删除的文件**
- ❌ `app/api/auth/verify-2fa/` - 2FA 验证 API
- ❌ `app/api/auth/check-temp-token/` - 临时 Token 检查 API
- ❌ `app/api/user/setting/2fa/` - 2FA 设置相关 API
  - `enable/route.ts` - 启用 2FA
  - `disable/route.ts` - 禁用 2FA
  - `status/route.ts` - 2FA 状态查询
  - `save-secret/route.ts` - 保存 2FA 密钥
- ❌ `app/api/utils/verify2FA.ts` - 2FA 验证工具
- ❌ `app/login/2fa/page.tsx` - 2FA 登录页面
- ❌ `components/login/2FA.tsx` - 2FA 登录组件
- ❌ `components/settings/user/TwoFactorAuth.tsx` - 2FA 设置组件

### 2. **修改的文件**

#### **登录流程简化**
- ✅ `app/api/auth/login/route.ts`
  - 移除 2FA 检查逻辑
  - 登录直接返回用户状态,不再有 `require2FA` 字段
  - 移除临时 Token 生成逻辑

#### **前端登录逻辑**
- ✅ `components/login/Login.tsx`
  - 移除 2FA 跳转逻辑
  - 登录成功直接跳转到用户页面

#### **用户设置页面**
- ✅ `components/settings/user/User.tsx`
  - 移除 TwoFactorAuth 组件引用

#### **JWT 工具简化**
- ✅ `app/api/utils/jwt.ts`
  - 移除 `generateKunStatelessToken` 函数
  - 移除 `NwpuShareStatelessPayload` 接口

#### **验证 Schemas**
- ✅ `validations/auth.ts`
  - 移除 `verifyLogin2FASchema`
- ✅ `validations/user.ts`
  - 移除 `saveUser2FASecretSchema`
  - 移除 `enableUser2FASchema`

#### **数据库 Schema**
- ✅ `prisma/schema/user.prisma`
  - 移除 `enable_2fa` 字段
  - 移除 `two_factor_secret` 字段
  - 移除 `two_factor_backup` 字段

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
pnpm prisma migrate dev --name remove-2fa-fields

# 这会:
# - 生成 SQL 迁移文件
# - 自动应用到数据库
# - 更新 Prisma Client

# 2. 查看生成的迁移 SQL
cat prisma/migrations/[timestamp]_remove-2fa-fields/migration.sql

# 应该包含类似这样的 SQL:
# ALTER TABLE "user" DROP COLUMN "enable_2fa";
# ALTER TABLE "user" DROP COLUMN "two_factor_secret";
# ALTER TABLE "user" DROP COLUMN "two_factor_backup";
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
-- 删除 2FA 相关字段
ALTER TABLE "user" DROP COLUMN IF EXISTS "enable_2fa";
ALTER TABLE "user" DROP COLUMN IF EXISTS "two_factor_secret";
ALTER TABLE "user" DROP COLUMN IF EXISTS "two_factor_backup";

-- 验证字段已删除
\d "user"
-- 或
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'user'
AND column_name LIKE '%2fa%' OR column_name LIKE '%two_factor%';
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

# 查看 user 表结构
\d "user"

# 确认这些字段已不存在:
# - enable_2fa
# - two_factor_secret
# - two_factor_backup
```

### **2. 重新生成 Prisma Client**

```bash
pnpm prisma generate
```

### **3. 测试登录流程**

```bash
# 启动开发服务器
pnpm dev

# 测试以下功能:
# 1. 用户注册 ✓
# 2. 用户登录 ✓
# 3. 登录后访问个人页面 ✓
# 4. 访问设置页面 (应该不再有 2FA 选项) ✓
```

### **4. 检查 TypeScript 类型**

```bash
# 运行类型检查
pnpm typecheck

# 应该没有 2FA 相关的类型错误
```

---

## 🔍 潜在问题排查

### **问题 1: 迁移失败**

```
Error: Column "enable_2fa" does not exist
```

**原因:** 字段可能已经被删除,或表名不正确。

**解决方法:**
```bash
# 检查当前表结构
psql -U username -d database -c "\d user"

# 如果字段确实不存在,可以忽略该错误
# 继续执行 prisma generate
pnpm prisma generate
```

---

### **问题 2: Prisma Client 类型错误**

```
Property 'enable_2fa' does not exist on type 'user'
```

**原因:** 代码中还有残留的 2FA 字段引用。

**解决方法:**
```bash
# 全局搜索残留引用
grep -r "enable_2fa\|two_factor" --include="*.ts" --include="*.tsx" \
  app/ components/ lib/

# 删除或注释掉这些引用
```

---

### **问题 3: 运行时错误**

```
PrismaClientValidationError: Invalid `prisma.user.findFirst()` invocation:
Unknown arg `enable_2fa` in select
```

**原因:** 某些查询中还在选择 2FA 字段。

**解决方法:**
```bash
# 搜索 Prisma 查询中的 2FA 字段
grep -r "enable_2fa\|two_factor_secret\|two_factor_backup" \
  --include="*.ts" app/api/

# 从 select 和 where 子句中移除这些字段
```

---

## 📊 迁移前后对比

### **登录流程对比**

**迁移前 (有 2FA):**
```
用户输入账号密码
    ↓
验证通过 → 检查 enable_2fa
    ↓               ↓
  False            True
    ↓               ↓
直接登录        跳转到 2FA 页面
                    ↓
              输入 6 位验证码
                    ↓
              验证 TOTP / 备用码
                    ↓
                登录成功
```

**迁移后 (无 2FA):**
```
用户输入账号密码
    ↓
验证通过
    ↓
直接登录成功
```

### **数据库字段对比**

| 迁移前 | 迁移后 | 说明 |
|--------|--------|------|
| `enable_2fa: Boolean` | ❌ 已删除 | 2FA 启用状态 |
| `two_factor_secret: String` | ❌ 已删除 | TOTP 密钥 |
| `two_factor_backup: String[]` | ❌ 已删除 | 备用恢复码 |

---

## 🚀 部署到生产环境

### **部署检查清单**

- [ ] ✅ 已备份生产数据库
- [ ] ✅ 在测试环境验证迁移脚本
- [ ] ✅ 通知用户 2FA 功能已移除
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
=== 2FA 移除迁移日志 ===

开始时间: 2024-XX-XX 10:00:00
执行人: Admin

1. 备份数据库: ✅
   - 备份文件: backup_20241215.sql
   - 文件大小: 234 MB

2. 代码部署: ✅
   - Commit: abc1234
   - Branch: master

3. 数据库迁移: ✅
   - 迁移文件: 20241215_remove_2fa_fields
   - 执行时间: 2.3 秒
   - 影响行数: 0 (结构变更)

4. 服务验证: ✅
   - 登录功能: 正常
   - 注册功能: 正常
   - API 响应: 正常

完成时间: 2024-XX-XX 10:05:30
总耗时: 5 分 30 秒

备注: 迁移顺利,无异常。
```

---

## 🎯 总结

### **完成的工作**

1. ✅ 删除所有 2FA 相关的 API 路由和工具函数
2. ✅ 简化登录流程,移除 2FA 检查
3. ✅ 删除前端 2FA 组件和页面
4. ✅ 清理验证 Schemas
5. ✅ 更新数据库 Schema (删除 3 个字段)
6. ✅ 简化 JWT 工具

### **用户体验改进**

- 🚀 登录流程更快 (减少一个步骤)
- 🎯 界面更简洁 (设置页面移除 2FA 选项)
- 🔧 维护更简单 (减少代码复杂度)

### **技术改进**

- 📉 减少数据库字段 (3 个字段)
- 📉 减少 API 路由 (6 个路由)
- 📉 减少前端页面/组件 (3 个)
- 📉 减少验证 Schema (3 个)

---

## 🆘 需要帮助?

如果在迁移过程中遇到任何问题:

1. 检查本文档的"潜在问题排查"部分
2. 查看 Prisma 文档: https://www.prisma.io/docs/
3. 查看项目日志: `pm2 logs nwpushare`
4. 回滚到迁移前的状态

---

*Generated with NWPUShare - 简化认证,提升体验*
