# NWPUShare 快速启动指南

## 🚀 快速开始（5分钟启动）

### 1. 环境要求

确保已安装：
- **Node.js** 18+ (推荐 20+)
- **pnpm** (包管理器)
- **PostgreSQL** (数据库)
- **Redis** (缓存)

### 2. 安装依赖

```bash
# 安装 pnpm (如果没有)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 配置环境变量

```bash
# 复制开发环境配置
cp .env.development .env

# 编辑 .env 文件，修改数据库连接
# KUN_DATABASE_URL="postgresql://你的用户名:你的密码@localhost:5432/nwpushare?schema=public"
```

**最小配置（必须设置）：**
```env
KUN_DATABASE_URL="postgresql://postgres:password@localhost:5432/nwpushare?schema=public"
REDIS_HOST='127.0.0.1'
REDIS_PORT='6379'
JWT_SECRET='your-super-secret-jwt-key'

# 开发模式开关（必须）
NEXT_PUBLIC_DISABLE_CAPTCHA=true
KUN_DISABLE_EMAIL=true
NODE_ENV=development
```

### 4. 启动 PostgreSQL 和 Redis

```bash
# 启动 PostgreSQL（macOS 使用 Homebrew）
brew services start postgresql@14

# 启动 Redis
brew services start redis

# 或者使用 Docker
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:14
docker run -d --name redis -p 6379:6379 redis:latest
```

### 5. 初始化数据库

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 推送数据库 schema
pnpm prisma:push

# 填充示例数据（可选）
pnpm run seed:courses
```

### 6. 启动开发服务器

```bash
pnpm dev
```

访问 http://127.0.0.1:3000

### 7. 测试登录

使用示例账号登录：
- **邮箱/用户名：** seed@example.com 或 seed-user
- **密码：** 123

---

## 🧪 测试功能

### 测试 1: 用户登录

1. 访问 http://127.0.0.1:3000/login
2. 输入：
   - 用户名：`seed@example.com`
   - 密码：`123`
3. 点击登录
4. ✅ **预期结果：** 登录成功，跳转到用户中心

### 测试 2: 用户注册

1. 访问 http://127.0.0.1:3000/register
2. 填写表单：
   - 用户名：`testuser`
   - 邮箱：`test@example.com`
   - 密码：`123456`
3. 点击"发送验证码"
4. ✅ **预期结果：**
   - 控制台打印验证码（因为 `KUN_DISABLE_EMAIL=true`）
   - 格式：`[dev-email-code] test@example.com -> 1234567`
5. 在表单中输入验证码：`1234567`
6. 点击"注册"
7. ✅ **预期结果：** 注册成功，自动登录

**如何查看验证码：**
- 打开终端查看 `pnpm dev` 的输出
- 找到类似这样的日志：
  ```
  [dev-email-code] test@example.com -> 1234567
  ```

### 测试 3: 浏览课程

1. 访问 http://127.0.0.1:3000/course
2. ✅ **预期结果：** 显示课程列表

### 测试 4: 上传资源

1. 确保已登录
2. 访问 http://127.0.0.1:3000/edit/create
3. 选择学院和课程
4. 填写资源信息（只需要填写外链，不上传文件）
5. 提交
6. ✅ **预期结果：** 资源创建成功，状态为 pending

---

## 🔧 常见问题排查

### 问题 1: 数据库连接失败

**错误信息：**
```
Error: P1001: Can't reach database server at localhost:5432
```

**解决方案：**
```bash
# 检查 PostgreSQL 是否运行
brew services list | grep postgresql

# 如果未运行，启动它
brew services start postgresql@14

# 创建数据库
createdb nwpushare
```

### 问题 2: Redis 连接失败

**错误信息：**
```
Error: Redis connection refused
```

**解决方案：**
```bash
# 检查 Redis 是否运行
brew services list | grep redis

# 如果未运行，启动它
brew services start redis

# 测试连接
redis-cli ping
# 应该返回 PONG
```

### 问题 3: JWT 错误

**错误信息：**
```
Error: secretOrPrivateKey must have a value
```

**解决方案：**
在 `.env` 文件中确保设置了：
```env
JWT_SECRET='your-super-secret-jwt-key'
JWT_ISS='nwpushare'
JWT_AUD='nwpushare_admin'
```

### 问题 4: 登录后立即退出

**原因：** Cookie 或 JWT 配置问题

**解决方案：**
1. 清除浏览器 Cookie
2. 确保 `.env` 中配置了 JWT 相关变量
3. 确保使用 `http://127.0.0.1:3000` 访问（不要用 `localhost`）
4. 检查 Redis 是否正常运行

### 问题 5: 验证码收不到

**原因：** 开发环境验证码打印在控制台

**解决方案：**
1. 确保 `.env` 中设置了 `KUN_DISABLE_EMAIL=true`
2. 查看运行 `pnpm dev` 的终端输出
3. 找到 `[dev-email-code]` 开头的日志
4. 使用日志中显示的验证码（通常是 `1234567`）

### 问题 6: 人机验证弹窗出现

**原因：** 没有设置跳过人机验证的环境变量

**解决方案：**
在 `.env` 文件中添加：
```env
NEXT_PUBLIC_DISABLE_CAPTCHA=true
```

---

## 📝 开发环境配置说明

### 必需配置

```env
# 数据库（必须）
KUN_DATABASE_URL="postgresql://..."

# Redis（必须）
REDIS_HOST='127.0.0.1'
REDIS_PORT='6379'

# JWT（必须）
JWT_SECRET='...'
JWT_ISS='nwpushare'
JWT_AUD='nwpushare_admin'

# 开发模式（必须）
NODE_ENV=development
NEXT_PUBLIC_DISABLE_CAPTCHA=true
KUN_DISABLE_EMAIL=true
```

### 开发模式说明

1. **KUN_DISABLE_EMAIL=true**
   - 禁用真实邮件发送
   - 验证码打印到控制台
   - 默认验证码：`1234567`（可通过 `KUN_VERIFICATION_CODE` 修改）

2. **NEXT_PUBLIC_DISABLE_CAPTCHA=true**
   - 跳过人机验证
   - 登录和注册时不需要点击验证

3. **NODE_ENV=development**
   - 开发模式
   - IP 地址检查宽松（使用默认 127.0.0.1）

---

## 🎯 下一步

修复完登录和注册功能后，你可以：

1. **品牌定制**
   - 修改 `app/metadata.ts` - 网站标题和描述
   - 修改 `app/page.tsx` - 首页内容
   - 修改 `README.md` - 项目说明

2. **数据定制**
   - 修改 `scripts/seedCourses.ts` - 添加西工大的学院和课程

3. **功能开发**
   - 完善课程帖子功能
   - 开发资源审核后台
   - 添加更多筛选条件

4. **部署上线**
   - 配置生产环境
   - 设置真实的 SMTP 邮件服务
   - 部署到服务器

---

## 🐛 调试技巧

### 查看日志

```bash
# 开发服务器日志（包括验证码）
pnpm dev

# 查看 Redis 内容
redis-cli
> keys kun:touchgal:*
> get kun:touchgal:access:token:1

# 查看数据库
pnpm prisma studio
# 或
psql -d nwpushare
```

### 清理重置

```bash
# 清理 Redis 缓存
redis-cli
> flushall

# 重置数据库
pnpm prisma:push --force-reset

# 重新填充数据
pnpm run seed:courses
```

---

## 📚 相关文档

- [系统架构说明](./system-architecture.md)
- [手动测试指南](./manual-testing-guide.md)
- [改进路线图](./improvement-guide.md)
