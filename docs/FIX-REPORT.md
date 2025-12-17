# 🔧 登录和注册功能修复报告

## 📅 修复日期
2025-12-06

## 🎯 修复的问题

### 1. ✅ 邮箱验证码发送失败

**问题描述：**
- 注册时发送验证码需要配置 SMTP 服务器
- 开发环境没有真实的邮件服务配置

**修复方案：**
- 在开发环境使用模拟模式（`KUN_DISABLE_EMAIL=true`）
- 验证码直接打印到控制台
- 默认验证码：`1234567`

### 2. ✅ 人机验证（Captcha）阻止注册

**问题描述：**
- 发送验证码时强制要求 captcha
- 开发环境无法完成人机验证

**修复方案：**
- 已有的 `checkKunCaptchaExist` 函数支持开发环境绕过
- 通过环境变量 `NEXT_PUBLIC_DISABLE_CAPTCHA=true` 禁用

### 3. ✅ IP 地址获取失败

**问题描述：**
- 注册和发送验证码需要获取用户 IP
- 本地开发环境获取不到 `x-forwarded-for` 等 headers
- 导致接口直接返回"读取请求头失败"

**修复方案：**
- 修改 `getRemoteIp` 函数，开发环境返回默认 IP `127.0.0.1`
- 修改 `register` 路由，开发环境不强制检查 IP headers
- 修改 `send-register-code` 路由，开发环境不强制检查 IP headers

### 4. ✅ 登录功能依赖配置

**问题描述：**
- 登录依赖 Redis 和 JWT 配置
- 缺少环境变量导致登录失败

**修复方案：**
- 创建完整的 `.env.development` 配置文件
- 包含所有必需的环境变量

---

## 📝 修改的文件

### 1. 新增文件

#### `.env.development` - 开发环境配置
```env
# 核心配置
KUN_DATABASE_URL="postgresql://..."
REDIS_HOST='127.0.0.1'
REDIS_PORT='6379'
JWT_SECRET='...'

# 开发模式开关
NEXT_PUBLIC_DISABLE_CAPTCHA=true
KUN_DISABLE_EMAIL=true
NODE_ENV=development
```

#### `docs/QUICKSTART.md` - 快速启动指南
- 5分钟快速启动教程
- 常见问题排查
- 功能测试指南

### 2. 修改的文件

#### `app/api/auth/send-register-code/route.ts`
**修改内容：**
```typescript
// 开发环境不检查 IP headers
if (process.env.NODE_ENV === 'production') {
  if (!req.headers || !req.headers.get('x-forwarded-for')) {
    return NextResponse.json('读取请求头失败')
  }
}
```

**修改原因：**
- 本地开发环境没有反向代理，获取不到 `x-forwarded-for`
- 生产环境才需要严格检查 IP

#### `app/api/auth/register/route.ts`
**修改内容：**
```typescript
// 开发环境使用默认 IP
let ip = '127.0.0.1'

if (process.env.NODE_ENV === 'production') {
  // 生产环境严格检查
  if (!req.headers || (!req.headers.get('x-forwarded-for') && ...)) {
    return NextResponse.json('读取请求头失败')
  }
  ip = getRemoteIp(req.headers)
} else {
  // 开发环境尝试获取，失败则使用默认值
  ip = getRemoteIp(req.headers) || '127.0.0.1'
}
```

**修改原因：**
- 注册时需要记录用户 IP
- 开发环境使用默认值，不影响功能测试

#### `app/api/utils/getRemoteIp.ts`
**修改内容：**
```typescript
// 开发环境返回默认 IP，生产环境返回空字符串
const defaultIp = process.env.NODE_ENV === 'development' ? '127.0.0.1' : ''

return cfConnectingIp || ipForwarded() || xRealIp || defaultIp
```

**修改原因：**
- 统一 IP 获取逻辑
- 开发环境提供合理的默认值

---

## 🧪 测试验证

### 测试 1: 登录功能 ✅

**步骤：**
1. 启动项目：`pnpm dev`
2. 访问：http://127.0.0.1:3000/login
3. 输入：`seed@example.com` / `123`
4. 点击登录

**预期结果：**
- ✅ 登录成功
- ✅ 跳转到用户中心
- ✅ 顶部显示用户头像

### 测试 2: 注册功能 ✅

**步骤：**
1. 访问：http://127.0.0.1:3000/register
2. 填写表单：
   - 用户名：`testuser`
   - 邮箱：`test@example.com`
   - 密码：`123456`
3. 点击"发送验证码"
4. 查看终端输出，找到验证码
5. 输入验证码：`1234567`
6. 点击注册

**预期结果：**
- ✅ 发送验证码成功
- ✅ 终端打印：`[dev-email-code] test@example.com -> 1234567`
- ✅ 注册成功，自动登录

### 测试 3: 验证码显示 ✅

**终端输出示例：**
```bash
[dev-email-code] test@example.com -> 1234567
```

---

## 🚀 快速启动命令

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境（复制开发配置）
cp .env.development .env

# 3. 启动 PostgreSQL 和 Redis
brew services start postgresql@14
brew services start redis

# 4. 初始化数据库
pnpm prisma:generate
pnpm prisma:push
pnpm run seed:courses

# 5. 启动开发服务器
pnpm dev

# 6. 访问并测试
# http://127.0.0.1:3000
# 登录：seed@example.com / 123
```

---

## 📋 环境变量清单

### 必需配置（开发环境）

```env
# 数据库
KUN_DATABASE_URL="postgresql://postgres:password@localhost:5432/nwpushare?schema=public"

# Redis
REDIS_HOST='127.0.0.1'
REDIS_PORT='6379'

# JWT
JWT_ISS='nwpushare'
JWT_AUD='nwpushare_admin'
JWT_SECRET='your-super-secret-jwt-key-change-this-in-production'

# 站点地址
NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV="http://127.0.0.1:3000"

# 开发模式开关（关键！）
NODE_ENV="development"
NEXT_PUBLIC_DISABLE_CAPTCHA=true
KUN_DISABLE_EMAIL=true
KUN_VERIFICATION_CODE=1234567
```

### 可选配置（生产环境需要）

```env
# 邮件服务（生产环境）
KUN_VISUAL_NOVEL_EMAIL_FROM="NWPUShare"
KUN_VISUAL_NOVEL_EMAIL_HOST="smtp.example.com"
KUN_VISUAL_NOVEL_EMAIL_PORT='587'
KUN_VISUAL_NOVEL_EMAIL_ACCOUNT="noreply@example.com"
KUN_VISUAL_NOVEL_EMAIL_PASSWORD="your-email-password"

# S3 存储（可选，资源外链模式不需要）
KUN_VISUAL_NOVEL_S3_STORAGE_ACCESS_KEY_ID=""
KUN_VISUAL_NOVEL_S3_STORAGE_SECRET_ACCESS_KEY=""
# ...
```

---

## 🔍 关键修改说明

### 1. 开发/生产环境隔离

**原则：**
- 开发环境优先易用性，降低配置要求
- 生产环境优先安全性，严格检查所有参数

**实现：**
- 通过 `process.env.NODE_ENV` 区分环境
- 开发环境提供合理的默认值
- 生产环境保持严格验证

### 2. IP 地址处理

**开发环境：**
- 获取不到 IP 时使用 `127.0.0.1`
- 不阻止注册流程

**生产环境：**
- 必须获取真实 IP
- 获取失败时返回错误

### 3. 邮件验证码

**开发环境：**
- 设置 `KUN_DISABLE_EMAIL=true`
- 验证码打印到控制台
- 默认验证码：`1234567`

**生产环境：**
- 通过 SMTP 发送真实邮件
- 需要配置邮件服务器

### 4. 人机验证

**开发环境：**
- 设置 `NEXT_PUBLIC_DISABLE_CAPTCHA=true`
- 自动跳过验证

**生产环境：**
- 启用人机验证
- 防止机器人注册

---

## ⚠️ 注意事项

### 1. 不要在生产环境禁用安全检查

生产环境必须启用：
- ❌ 不要设置 `KUN_DISABLE_EMAIL=true`
- ❌ 不要设置 `NEXT_PUBLIC_DISABLE_CAPTCHA=true`
- ✅ 必须配置真实的 SMTP 服务器
- ✅ 必须启用人机验证

### 2. JWT_SECRET 必须保密

- 开发环境可以使用简单的密钥
- 生产环境必须使用强密码（至少 32 位随机字符）
- 不要将生产环境的 JWT_SECRET 提交到代码仓库

### 3. 数据库连接字符串

```env
# 开发环境示例
KUN_DATABASE_URL="postgresql://postgres:password@localhost:5432/nwpushare?schema=public"

# 生产环境示例（使用连接池）
KUN_DATABASE_URL="postgresql://user:pass@your-db-host:5432/nwpushare?schema=public&connection_limit=10&pool_timeout=10"
```

### 4. Redis 配置

开发环境：
- 使用本地 Redis
- 不需要密码

生产环境：
- 建议设置密码
- 考虑使用 Redis 集群

---

## 🎯 下一步计划

修复完登录和注册功能后，可以开始：

1. **✅ MVP 快速启动**
   - 现在可以正常使用所有核心功能
   - 登录、注册、浏览课程、上传资源都可以测试

2. **🎨 品牌定制**
   - 修改网站标题和描述
   - 修改首页内容
   - 添加西工大 logo

3. **📚 数据定制**
   - 修改 `scripts/seedCourses.ts`
   - 添加西工大的学院和课程
   - 重新运行 seed

4. **🚀 功能开发**
   - 完善课程帖子 CRUD
   - 开发资源审核后台
   - 添加更多筛选功能

5. **🌐 部署上线**
   - 配置生产环境
   - 设置 SMTP 邮件服务
   - 部署到服务器（Vercel/Railway）

---

## 📖 相关文档

- **快速启动：** [docs/QUICKSTART.md](./QUICKSTART.md)
- **系统架构：** [docs/system-architecture.md](./system-architecture.md)
- **手动测试：** [docs/manual-testing-guide.md](./manual-testing-guide.md)
- **改进路线：** [docs/improvement-guide.md](./improvement-guide.md)

---

## 🙏 致谢

本项目基于 [KUN1007/kun-touchgal-next](https://github.com/KUN1007/kun-touchgal-next) 二次开发。
感谢 TouchGAL 开发组提供优秀的代码基础。
