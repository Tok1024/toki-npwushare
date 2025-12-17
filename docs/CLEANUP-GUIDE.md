# 🧹 TouchGAL 遗留代码清理指南

> 系统性清理 TouchGAL/Galgame 品牌名称和无用代码

## 📋 清理概览

**清理目标：**
- ✓ 移除 TouchGAL/Galgame 品牌名称
- ✓ 统一为 NWPUShare 或通用名称
- ✓ 清理无用的 API 路由和组件
- ✓ 保留所有有用的核心功能

**预计耗时：** 2-3 小时
**难度：** ⭐⭐☆☆☆ (大部分是批量替换)

---

## 🎯 清理策略

### 原则 1: 渐进式清理，不要一次改完

✅ **正确做法：**
1. 先改用户可见的部分（UI 文案、页面标题）
2. 再改代码变量名（Cookie、Redis key）
3. 最后清理无用代码（旧 API、旧组件）

❌ **错误做法：**
- 一次性全局替换所有 "kun" → 可能破坏功能
- 先删除旧代码 → 可能影响现有功能

### 原则 2: 每改一批，测试一次

改完每个部分后，都要：
```bash
pnpm dev
# 测试登录、浏览课程、上传资源等核心功能
```

### 原则 3: 使用 Git 分支

```bash
# 创建清理分支
git checkout -b cleanup/touchgal-legacy

# 每完成一个部分，提交一次
git add .
git commit -m "清理: 修改网站标题和元数据"

# 全部完成后合并到主分支
git checkout master
git merge cleanup/touchgal-legacy
```

---

## 第一步: 清理用户可见部分 (1小时)

### 1.1 网站元数据和标题

#### `app/metadata.ts`

**当前：**
```typescript
title: 'Toki Learning Hub - 课程资源共享'
```

**修改为：**
```typescript
export const generateKunMetadata = () => ({
  metadataBase: new URL('https://nwpushare.com'), // 改为你的域名
  title: {
    default: 'NWPUShare - 西北工业大学资源共享平台',
    template: '%s | NWPUShare'
  },
  description: '西工大学生自发维护的课程资料共享站，汇集课件、笔记、考试资料和经验分享',
  keywords: [
    '西北工业大学',
    'NWPU',
    '课程资料',
    '学习笔记',
    '考试资料',
    '资源共享',
    '学习社区'
  ],
  authors: [{ name: 'NWPUShare Team' }],
  creator: 'NWPUShare',
  publisher: 'NWPUShare',
  // ... 其他配置保持不变
})
```

#### `README.md`

**修改内容：**
```markdown
# NWPUShare - 西北工业大学资源共享平台

西工大学生自发维护的课程资料共享站。课程页面聚合了课件、链接、经验帖与讨论，为"信号与系统 / 数据结构"等课程提供统一的上传、浏览与互动能力。

## 功能特性

- 📚 课程资源管理：按学院和课程组织资料
- 🔗 外链存储：不存储文件，仅保存链接（支持网盘、GitHub等）
- 💬 讨论社区：支持课程评论、经验分享
- ⭐ 课程反馈：难度评分、点赞系统
- 🔐 用户认证：注册、登录、邮箱验证

## 致谢

本项目基于 [KUN1007/kun-touchgal-next](https://github.com/KUN1007/kun-touchgal-next) 二次开发。
```

#### `package.json`

**修改：**
```json
{
  "name": "nwpushare",
  "version": "1.0.0",
  "description": "西北工业大学资源共享平台 - 面向校园的课程资料共享站",
  "author": {
    "name": "NWPUShare Team",
    "email": "admin@nwpushare.com"
  }
}
```

### 1.2 首页文案

#### `app/page.tsx`

找到并修改 Hero 区的文案：

```tsx
// 大标题
<h1>NWPUShare</h1>
<h2>西北工业大学资源共享平台</h2>

// 副标题
<p>汇集课程资料、学习笔记、考试经验，为西工大学子提供一站式学习资源</p>

// 特色介绍
- 📚 课程资源：课件、笔记、作业、考题
- 💬 经验分享：学长学姐的课程心得
- ⭐ 课程评价：难度评分、教师评价
```

### 1.3 导航栏和页脚

#### `components/kun/top-bar/TopBar.tsx`

**修改导航项：**
```tsx
const navItems = [
  { name: '首页', href: '/' },
  { name: '浏览课程', href: '/course' },
  { name: '浏览资源', href: '/resource' },  // 保持不变
  { name: '学院', href: '/department' },     // 改
  { name: '帮助', href: '/help' },           // 保持不变
  { name: '上传资源', href: '/edit/create' } // 保持不变
]
```

#### `components/kun/Footer.tsx`

**修改页脚信息：**
```tsx
<footer>
  <p>© 2025 NWPUShare - 西北工业大学资源共享平台</p>
  <p>本项目遵循 AGPL-3.0 开源协议</p>
  <div className="links">
    <a href="/about">关于我们</a>
    <a href="/terms">使用条款</a>
    <a href="/privacy">隐私政策</a>
    <a href="https://github.com/your-repo">GitHub</a>
  </div>
</footer>
```

### 1.4 页面标题

使用 VS Code 全局搜索替换：

**搜索：** `Toki Learning Hub`
**替换为：** `NWPUShare`

**涉及文件：**
- `app/**/page.tsx`（所有页面）
- `components/**/*.tsx`（组件中的标题）

### ✅ 测试第一步

```bash
pnpm dev
```

**检查清单：**
- [ ] 浏览器标签页标题是否为 "NWPUShare"
- [ ] 首页 Hero 区文案是否已修改
- [ ] 导航栏和页脚是否已修改
- [ ] SEO 元数据是否正确（查看页面源代码）

---

## 第二步: 清理代码变量名 (1小时)

### 2.1 Cookie 名称

#### 当前名称
```typescript
'kun-galgame-patch-moe-token'        // 主 token
'kun-galgame-patch-moe-2fa-token'    // 2FA token
```

#### 修改方案

**创建配置文件：** `config/cookies.ts`

```typescript
// config/cookies.ts
export const COOKIE_NAMES = {
  AUTH_TOKEN: process.env.NODE_ENV === 'production'
    ? 'nwpushare-auth-token'
    : 'nwpushare-dev-token',
  TWO_FA_TOKEN: 'nwpushare-2fa-token'
} as const

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 天
}
```

**修改使用 Cookie 的文件：**

**文件清单：**
1. `app/api/auth/login/route.ts`
2. `app/api/auth/register/route.ts`
3. `app/api/auth/verify-2fa/route.ts`
4. `middleware/auth.ts`
5. `middleware/_verifyHeaderCookie.ts`

**修改示例：**

```typescript
// 修改前
import { cookies } from 'next/headers'
const cookie = await cookies()
cookie.set('kun-galgame-patch-moe-token', token, {
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000
})

// 修改后
import { cookies } from 'next/headers'
import { COOKIE_NAMES, COOKIE_OPTIONS } from '~/config/cookies'

const cookie = await cookies()
cookie.set(COOKIE_NAMES.AUTH_TOKEN, token, COOKIE_OPTIONS)
```

**批量替换命令：**

```bash
# macOS/Linux
find . -type f -name "*.ts" -not -path "*/node_modules/*" \
  -exec sed -i '' 's/kun-galgame-patch-moe-token/nwpushare-auth-token/g' {} +

# Windows (PowerShell)
Get-ChildItem -Recurse -Filter *.ts |
  Where-Object { $_.FullName -notmatch 'node_modules' } |
  ForEach-Object {
    (Get-Content $_.FullName) -replace 'kun-galgame-patch-moe-token', 'nwpushare-auth-token' |
    Set-Content $_.FullName
  }
```

### 2.2 Redis Key 前缀

#### `lib/redis.ts`

**修改前：**
```typescript
const KUN_PATCH_REDIS_PREFIX = 'kun:touchgal'
```

**修改后：**
```typescript
const REDIS_PREFIX = process.env.REDIS_PREFIX || 'nwpushare'

export const redis = new Redis({
  port: parseInt(process.env.REDIS_PORT!),
  host: process.env.REDIS_HOST,
  keyPrefix: `${REDIS_PREFIX}:`
})

// 简化 KV 操作（不再需要手动拼接前缀）
export const setKv = async (key: string, value: string, time?: number) => {
  if (time) {
    await redis.setex(key, time, value)
  } else {
    await redis.set(key, value)
  }
}

export const getKv = async (key: string) => {
  return await redis.get(key)
}

export const delKv = async (key: string) => {
  await redis.del(key)
}
```

**注意：** 修改后需要清空 Redis 缓存

```bash
redis-cli
> FLUSHALL
> exit
```

### 2.3 环境变量重命名

#### `.env.example` 和 `.env.development`

**修改前缀：**
```env
# 修改前
KUN_DATABASE_URL="..."
KUN_VISUAL_NOVEL_EMAIL_HOST="..."

# 修改后
DATABASE_URL="..."  # Prisma 默认使用 DATABASE_URL
EMAIL_HOST="..."
EMAIL_PORT="..."
EMAIL_FROM="NWPUShare <noreply@nwpushare.com>"
```

**创建配置映射：** `config/env.ts`

```typescript
// config/env.ts
export const env = {
  database: {
    url: process.env.DATABASE_URL || process.env.KUN_DATABASE_URL!
  },
  redis: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!)
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    issuer: process.env.JWT_ISS || 'nwpushare',
    audience: process.env.JWT_AUD || 'nwpushare_users'
  },
  email: {
    host: process.env.EMAIL_HOST || process.env.KUN_VISUAL_NOVEL_EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || process.env.KUN_VISUAL_NOVEL_EMAIL_PORT || '587'),
    from: process.env.EMAIL_FROM || process.env.KUN_VISUAL_NOVEL_EMAIL_FROM || 'NWPUShare',
    account: process.env.EMAIL_ACCOUNT || process.env.KUN_VISUAL_NOVEL_EMAIL_ACCOUNT,
    password: process.env.EMAIL_PASSWORD || process.env.KUN_VISUAL_NOVEL_EMAIL_PASSWORD
  }
} as const
```

这样可以**兼容旧的环境变量**，不需要立即全部改完。

### ✅ 测试第二步

```bash
# 1. 清空 Redis
redis-cli FLUSHALL

# 2. 重启开发服务器
pnpm dev

# 3. 测试登录
# 访问 http://127.0.0.1:3000/login
# 登录成功后，检查浏览器 Cookie
# 应该看到 "nwpushare-auth-token" 而不是旧的 Cookie 名

# 4. 检查 Redis
redis-cli
> keys *
# 应该看到 nwpushare:access:token:1 等新的 key
```

---

## 第三步: 清理无用代码 (30分钟)

### 3.1 清理旧的 API 路由

#### 保留的 API（课程相关）
```
app/api/course/**          ✓ 保留
app/api/department/**      ✓ 保留
app/api/auth/**            ✓ 保留
app/api/user/**            ✓ 保留（部分清理）
app/api/admin/**           ⚠️ 部分保留，部分清理
```

#### 可以删除的 API（补丁站特定功能）

**创建清理清单：**

```bash
# 查找所有补丁相关的 API
find app/api -type f -name "*.ts" | grep -i "patch\|galgame"

# 常见的可删除路由：
app/api/patch/**                    # 旧补丁相关
app/api/galgame/**                  # Galgame 相关
app/api/tag/galgame/**              # Galgame 标签
app/api/admin/galgame/**            # Galgame 管理
```

**建议做法：**
1. 不要立即删除，先移动到 `archive/` 目录
2. 运行一周，确认没有引用
3. 再彻底删除

```bash
mkdir -p archive/old-api
mv app/api/patch archive/old-api/
mv app/api/galgame archive/old-api/
```

### 3.2 清理旧的组件

#### 可能不需要的组件

```bash
components/galgame/**        # Galgame 特定组件
components/patch/**          # 补丁特定组件
```

**检查方法：**

```bash
# 搜索组件引用
grep -r "import.*from.*galgame" app/ components/

# 如果没有引用，可以安全删除
rm -rf components/galgame
rm -rf components/patch
```

### 3.3 清理 Prisma 旧模型（慎重！）

**保留：**
```prisma
// prisma/schema/course.prisma
// 所有课程相关模型都保留 ✓

// prisma/schema/user.prisma
// 用户模型保留 ✓
```

**可能可以删除：**
```prisma
// prisma/schema/patch-*.prisma
// 旧补丁站的模型
```

**建议做法：**
1. **不要急着删除** Prisma 模型
2. 先注释掉不用的模型
3. 运行 `pnpm prisma:generate` 看是否有错误
4. 如果没有错误，可以安全删除

```prisma
// 注释掉旧模型
// model patch_resource {
//   ...
// }
```

### ✅ 测试第三步

```bash
# 1. 生成 Prisma Client
pnpm prisma:generate

# 2. 检查是否有编译错误
pnpm typecheck

# 3. 重启开发服务器
pnpm dev

# 4. 测试所有核心功能
- 登录 ✓
- 浏览课程 ✓
- 上传资源 ✓
- 评论 ✓
```

---

## 第四步: 清理文案和常量 (30分钟)

### 4.1 网站常量配置

#### `config/moyu-moe.ts`

**当前：**
```typescript
export const kunMoyuMoe = {
  titleShort: 'TouchGAL',
  titleLong: 'TouchGAL - Galgame 补丁站',
  // ...
}
```

**修改为：**
```typescript
export const siteConfig = {
  name: 'NWPUShare',
  shortName: 'NWPUShare',
  fullName: 'NWPUShare - 西北工业大学资源共享平台',
  description: '西工大课程资料共享站',
  url: 'https://nwpushare.com',
  author: 'NWPUShare Team',
  email: 'admin@nwpushare.com',
  github: 'https://github.com/your-repo/nwpushare'
} as const
```

**然后全局替换引用：**

```bash
# 搜索
kunMoyuMoe

# 替换为
siteConfig
```

### 4.2 邮件模板

#### `constants/email/verify-templates.ts`

**修改邮件模板：**

```typescript
export const createKunVerificationEmailTemplate = (
  type: 'register' | 'forgot' | 'reset',
  code: string
) => {
  const titles = {
    register: '欢迎注册 NWPUShare',
    forgot: '重置密码验证码',
    reset: '修改邮箱验证码'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${titles[type]}</title>
    </head>
    <body>
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>NWPUShare - 西北工业大学资源共享平台</h1>
        <h2>${titles[type]}</h2>
        <p>您的验证码是：</p>
        <div style="font-size: 32px; font-weight: bold; color: #3b82f6; margin: 20px 0;">
          ${code}
        </div>
        <p>验证码有效期为 10 分钟，请尽快使用。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          NWPUShare Team<br>
          西北工业大学资源共享平台
        </p>
      </div>
    </body>
    </html>
  `
}
```

### ✅ 测试第四步

```bash
# 测试邮件发送（如果配置了邮件服务）
# 注册一个新用户，查看邮件模板是否正确

# 检查所有文案
pnpm dev
# 浏览所有页面，检查是否还有 TouchGAL/Galgame 字样
```

---

## 批量替换命令总结

### 使用 VS Code 全局搜索替换

1. **打开搜索替换：** `Cmd/Ctrl + Shift + H`
2. **启用正则表达式：** 点击 `.*` 按钮

**替换清单：**

| 搜索内容 | 替换为 | 说明 |
|----------|--------|------|
| `TouchGAL` | `NWPUShare` | 品牌名称 |
| `Toki Learning Hub` | `NWPUShare` | 网站名称 |
| `kun-galgame-patch-moe` | `nwpushare` | Cookie 前缀 |
| `kun:touchgal` | `nwpushare` | Redis 前缀 |
| `kunMoyuMoe` | `siteConfig` | 配置对象名 |
| `Galgame` | `课程` | 文案（慎重，检查上下文） |

### 使用命令行批量替换

```bash
# macOS/Linux
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/TouchGAL/NWPUShare/g' {} +

# Windows (PowerShell)
Get-ChildItem -Recurse -Include *.ts,*.tsx |
  Where-Object { $_.FullName -notmatch 'node_modules|.next' } |
  ForEach-Object {
    (Get-Content $_.FullName) -replace 'TouchGAL', 'NWPUShare' |
    Set-Content $_.FullName
  }
```

---

## 清理检查清单

### 用户可见部分
- [ ] 网站标题和元数据
- [ ] 首页 Hero 区文案
- [ ] 导航栏和页脚
- [ ] 页面标题
- [ ] 邮件模板
- [ ] 错误提示文案

### 代码内部
- [ ] Cookie 名称
- [ ] Redis Key 前缀
- [ ] 环境变量名
- [ ] 配置对象名
- [ ] 函数和变量命名

### 文件清理
- [ ] 移动/删除旧 API 路由
- [ ] 移动/删除旧组件
- [ ] 注释/删除旧 Prisma 模型
- [ ] 更新 README 和文档

### 测试验证
- [ ] 登录注册功能
- [ ] 浏览课程和资源
- [ ] 评论和反馈
- [ ] 搜索功能
- [ ] 响应式布局

---

## ⚠️ 注意事项

### 1. 不要一次性全改

❌ **危险操作：**
```bash
# 不要这样做！会破坏很多功能
sed -i 's/kun/nwpu/g' **/*.ts
```

✅ **正确做法：**
- 分文件、分批次修改
- 每改一批，测试一次
- 使用 Git 提交，方便回滚

### 2. 保留向后兼容

对于环境变量和 Cookie：
- 优先使用新名称
- 但保留对旧名称的支持
- 给用户迁移时间

```typescript
// 兼容旧配置
const cookieName = process.env.NEW_COOKIE_NAME
  || process.env.OLD_COOKIE_NAME
  || 'default-cookie-name'
```

### 3. 清空缓存

修改 Cookie 名称和 Redis 前缀后：

```bash
# 清空 Redis
redis-cli FLUSHALL

# 清空浏览器 Cookie
# 浏览器开发者工具 → Application → Cookies → 清除所有

# 清空 Next.js 缓存
rm -rf .next
```

---

## 预期效果

清理完成后，你应该看到：

✅ **用户视角：**
- 网站名称统一为 NWPUShare
- 所有文案符合学习资源站定位
- 没有 TouchGAL/Galgame 相关内容

✅ **开发者视角：**
- 代码更清晰，变量名有意义
- 没有无用的文件和路由
- 配置统一，易于维护

✅ **功能完整性：**
- 所有核心功能正常工作
- 登录、注册、浏览、上传、评论都能用
- 没有引入新 Bug

---

## 下一步

清理完成后，继续：

1. **测试所有功能** - 确保清理没有破坏任何功能
2. **配置邮箱服务** - 参考 `docs/EMAIL-SOLUTIONS.md`
3. **品牌定制** - 添加 logo、favicon 等
4. **数据初始化** - 填充西工大的学院和课程

**参考：** `docs/DEVELOPMENT-GUIDE.md` 的阶段 3-5
