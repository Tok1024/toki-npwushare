# 📧 邮箱验证码方案对比与配置

> 选择最适合校园项目的邮件发送方案

## 🎯 需求分析

### 邮件用途

- ✉️ 用户注册验证码
- 🔐 忘记密码验证码
- 📬 邮箱修改验证码
- 🔔 （可选）通知邮件

### 预估邮件量

**初期（100 活跃用户）：**

- 注册：约 5 封/天
- 忘记密码：约 2 封/天
- **总计：约 200 封/月**

**增长期（1000 活跃用户）：**

- 注册：约 50 封/天
- 忘记密码：约 20 封/天
- **总计：约 2000 封/月**

---

## 📊 方案对比

### 方案 1: Resend ⭐⭐⭐⭐⭐ 强烈推荐

**官网：** https://resend.com

#### 优势

- ✅ 每月 **3000 封免费**（足够初期使用）
- ✅ 集成超级简单（5 分钟配置）
- ✅ 发送速度快（毫秒级）
- ✅ 到达率高（99%+）
- ✅ 有详细的邮件日志和分析
- ✅ 支持自定义域名
- ✅ API 友好，文档清晰
- ✅ 免费额度不过期

#### 价格

- 免费版：3000 封/月
- Pro 版：$20/月，50000 封
- **对于校园项目：免费版完全够用**

#### 使用限制

- 需要验证发件域名
- 免费版不支持批量发送

#### 推荐指数

⭐⭐⭐⭐⭐ (5/5)

**最适合：** 校园项目、个人项目、MVP 快速上线

---

### 方案 2: SendGrid ⭐⭐⭐⭐☆

**官网：** https://sendgrid.com

#### 优势

- ✅ 每天 **100 封免费**（约 3000 封/月）
- ✅ 老牌服务，稳定可靠
- ✅ 功能强大（模板、分析、Webhook）
- ✅ 有中文支持

#### 劣势

- ⚠️ 注册需要验证（可能需要等待）
- ⚠️ 配置比 Resend 复杂一些
- ⚠️ 免费版有每日限制（100 封/天）

#### 价格

- 免费版：100 封/天
- 基础版：$19.95/月，50000 封
- **对于校园项目：免费版够用**

#### 推荐指数

⭐⭐⭐⭐☆ (4/5)

**最适合：** 需要高级功能（模板、Webhook）的项目

---

### 方案 3: 阿里云邮件推送 ⭐⭐⭐☆☆

**官网：** https://www.aliyun.com/product/directmail

#### 优势

- ✅ 价格便宜（￥0.11/千封）
- ✅ 国内服务，速度快
- ✅ 中文文档和支持

#### 劣势

- ⚠️ 需要实名认证
- ⚠️ 需要备案域名
- ⚠️ 没有真正的免费额度
- ⚠️ 配置较复杂

#### 价格

- 无免费版
- 按量付费：￥0.11/千封
- **预估：200 封/月 ≈ ￥0.02/月**

#### 推荐指数

⭐⭐⭐☆☆ (3/5)

**最适合：** 已有阿里云账号且需要国内服务的项目

---

### 方案 4: 腾讯云邮件推送 ⭐⭐⭐☆☆

**官网：** https://cloud.tencent.com/product/ses

#### 优势

- ✅ 每月 **1000 封免费**
- ✅ 国内服务，速度快
- ✅ 价格便宜

#### 劣势

- ⚠️ 需要实名认证
- ⚠️ 需要备案域名
- ⚠️ 文档不够完善

#### 价格

- 免费版：1000 封/月
- 按量付费：￥0.13/千封

#### 推荐指数

⭐⭐⭐☆☆ (3/5)

**最适合：** 已有腾讯云账号的项目

---

### 方案 5: 个人 SMTP（QQ/163/Gmail） ⭐⭐☆☆☆

**示例：** QQ 邮箱 SMTP

#### 优势

- ✅ 完全免费
- ✅ 配置简单（只需邮箱密码）

#### 劣势

- ❌ 每日发送限制（约 50 封/天）
- ❌ 容易被识别为垃圾邮件
- ❌ 可能被封号
- ❌ 到达率低
- ❌ 没有日志和分析

#### 推荐指数

⭐⭐☆☆☆ (2/5)

**最适合：** 仅用于开发测试，不适合生产环境

---

## 🏆 推荐方案：Resend

### 为什么选择 Resend？

1. **成本最优：** 3000 封/月完全免费，足够初期使用
2. **集成最简：** 5 分钟配置完成
3. **体验最佳：** 发送快、到达率高、有详细日志
4. **无门槛：** 不需要域名备案、实名认证

### Resend 快速配置指南

#### 1. 注册账号

访问 https://resend.com 注册账号（使用 GitHub 账号快速注册）

#### 2. 获取 API Key

1. 登录后进入 Dashboard
2. 点击 "API Keys" → "Create API Key"
3. 复制 API Key（格式：`re_xxxxx`）

#### 3. 验证发件域名（可选）

**使用 resend.dev（推荐新手）：**

- 默认使用 `onboarding@resend.dev`
- 无需配置，立即可用
- 限制：邮件会显示 "via resend.dev"

**使用自定义域名（推荐生产环境）：**

1. 点击 "Domains" → "Add Domain"
2. 输入你的域名（如 `nwpushare.com`）
3. 添加 DNS 记录（在域名服务商处添加）
4. 等待验证（通常 5-10 分钟）

#### 4. 配置环境变量

**在 `.env` 中添加：**

```env
# Resend 配置
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="NWPUShare <noreply@resend.dev>"

# 或使用自定义域名
# EMAIL_FROM="NWPUShare <noreply@nwpushare.com>"
```

#### 5. 安装 Resend SDK

```bash
pnpm add resend
```

#### 6. 修改邮件发送代码

**创建新的邮件工具：** `app/api/utils/sendEmailWithResend.ts`

```typescript
import { Resend } from 'resend'
import { getRemoteIp } from './getRemoteIp'
import { getKv, setKv } from '~/lib/redis'
import { generateRandomString } from '~/utils/random'
import { createKunVerificationEmailTemplate } from '~/constants/email/verify-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationCodeEmail = async (
  headers: Headers,
  email: string,
  type: 'register' | 'forgot' | 'reset'
) => {
  const ip = getRemoteIp(headers)
  const isEmailDisabled = process.env.KUN_DISABLE_EMAIL === 'true'
  const devCode = process.env.KUN_VERIFICATION_CODE || '1234567'

  // 频率限制
  const limitEmail = await getKv(`limit:email:${email}`)
  const limitIP = await getKv(`limit:ip:${ip}`)
  if (limitEmail || limitIP) {
    return '您发送邮件的频率太快了, 请 60 秒后重试'
  }

  // 生成验证码
  const code = isEmailDisabled ? devCode : generateRandomString(7)
  await setKv(email, code, 10 * 60) // 10 分钟有效
  await setKv(`limit:email:${email}`, code, 60) // 60 秒限制
  await setKv(`limit:ip:${ip}`, code, 60)

  // 开发环境：打印验证码
  if (isEmailDisabled) {
    console.log(`[dev-email-code] ${email} -> ${code}`)
    return
  }

  // 生产环境：使用 Resend 发送
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NWPUShare <noreply@resend.dev>',
      to: email,
      subject: 'NWPUShare - 验证码',
      html: createKunVerificationEmailTemplate(type, code)
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    return '邮件发送失败，请稍后重试'
  }
}
```

#### 7. 测试发送

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 注册一个新用户
# 使用你的真实邮箱
# 查看邮箱是否收到验证码

# 3. 查看 Resend Dashboard
# 可以看到发送日志和状态
```

---

## 💰 成本分析

### 不同规模的月度成本

| 活跃用户数 | 预估邮件量  | Resend   | SendGrid | 阿里云 | 腾讯云   |
| ---------- | ----------- | -------- | -------- | ------ | -------- |
| 100        | 200 封/月   | **免费** | **免费** | ￥0.02 | **免费** |
| 500        | 1000 封/月  | **免费** | **免费** | ￥0.11 | **免费** |
| 1000       | 2000 封/月  | **免费** | **免费** | ￥0.22 | 免费     |
| 2000       | 4000 封/月  | $20      | $19.95   | ￥0.44 | 免费     |
| 5000       | 10000 封/月 | $20      | $19.95   | ￥1.1  | 免费     |

**结论：**

- **0-3000 封/月：** Resend 或 SendGrid（都免费）
- **3000-10000 封/月：** 腾讯云（10000 封内免费）
- **10000 封以上：** 阿里云或腾讯云（按量付费更划算）

对于校园项目初期，**Resend 完全够用且体验最佳**。

---

## 📋 配置清单对比

### Resend

```env
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="NWPUShare <noreply@resend.dev>"
```

### SendGrid

```env
SENDGRID_API_KEY="SG.xxxxx"
EMAIL_FROM="NWPUShare <noreply@yourdomain.com>"
```

### 阿里云

```env
ALIYUN_ACCESS_KEY_ID="xxxxx"
ALIYUN_ACCESS_KEY_SECRET="xxxxx"
ALIYUN_REGION="cn-hangzhou"
EMAIL_FROM="noreply@yourdomain.com"
```

### 个人 SMTP (QQ邮箱)

```env
EMAIL_HOST="smtp.qq.com"
EMAIL_PORT="587"
EMAIL_ACCOUNT="your_qq@qq.com"
EMAIL_PASSWORD="授权码（非 QQ 密码）"
EMAIL_FROM="NWPUShare <your_qq@qq.com>"
```

---

## 🚀 快速开始：5分钟配置 Resend

```bash
# 1. 安装 Resend
pnpm add resend

# 2. 配置环境变量
echo 'RESEND_API_KEY="re_xxxxx"' >> .env
echo 'EMAIL_FROM="NWPUShare <noreply@resend.dev>"' >> .env

# 3. 修改邮件发送代码（见上文）

# 4. 测试发送
pnpm dev
# 注册新用户，查看邮箱

# 5. 查看发送日志
# https://resend.com/emails
```

---

## ⚠️ 注意事项

### 1. 避免被标记为垃圾邮件

✅ **最佳实践：**

- 使用专业的邮件服务（Resend/SendGrid）
- 验证发件域名
- 使用清晰的发件人名称
- 邮件内容简洁专业
- 添加退订链接（如果发通知邮件）

❌ **避免：**

- 使用个人邮箱 SMTP
- 发件人名称随意
- 邮件内容像营销邮件

### 2. 频率限制

在代码中添加发送频率限制：

```typescript
// 同一邮箱 60 秒内只能发送一次
const limitEmail = await getKv(`limit:email:${email}`)
if (limitEmail) {
  return '发送太频繁，请 60 秒后重试'
}
await setKv(`limit:email:${email}`, 'sent', 60)
```

### 3. 验证码有效期

```typescript
// 验证码 10 分钟有效
await setKv(email, code, 10 * 60)
```

### 4. 开发/生产环境分离

```typescript
// 开发环境：打印到控制台
if (process.env.KUN_DISABLE_EMAIL === 'true') {
  console.log(`[dev-email-code] ${email} -> ${code}`)
  return
}

// 生产环境：真实发送
await resend.emails.send({ ... })
```

---

## 📊 监控和日志

### Resend Dashboard

访问 https://resend.com/emails 查看：

- ✉️ 已发送的邮件列表
- ✅ 发送状态（成功/失败）
- 📧 邮件内容预览
- 📈 发送统计

### 自定义日志

```typescript
// 记录发送日志到数据库
await prisma.emailLog.create({
  data: {
    email,
    type,
    status: 'sent',
    provider: 'resend',
    sentAt: new Date()
  }
})
```

---

## 🎯 推荐决策流程

```
开始
  ↓
是否需要立即上线？
  ├─ 是 → 使用 Resend（免费 3000 封）
  └─ 否 → 继续评估
        ↓
      是否有域名？
        ├─ 是 → 配置自定义域名 + Resend
        └─ 否 → 使用 resend.dev（开箱即用）
              ↓
            邮件量是否 > 3000/月？
              ├─ 是 → 考虑腾讯云（10000 封免费）
              └─ 否 → Resend 完全够用
```

---

## 📝 总结

### 最佳方案（校园项目）

**初期（MVP）：**

- ✅ 使用 **Resend**
- ✅ 使用 `resend.dev` 域名（无需配置）
- ✅ 免费 3000 封/月完全够用

**增长期：**

- ✅ 配置自定义域名
- ✅ 邮件量 > 3000 时考虑升级或切换
- ✅ 保持 Resend（体验最佳）

**成熟期：**

- ✅ 根据邮件量选择最划算的方案
- ✅ 考虑腾讯云/阿里云（按量付费）

### 配置优先级

1. **开发环境：** 使用 `KUN_DISABLE_EMAIL=true`（验证码打印到控制台）
2. **测试环境：** 使用 Resend + resend.dev
3. **生产环境：** 使用 Resend + 自定义域名

---

## 🔗 相关资源

- **Resend 官网：** https://resend.com
- **Resend 文档：** https://resend.com/docs
- **SendGrid 文档：** https://docs.sendgrid.com
- **阿里云邮件推送：** https://help.aliyun.com/product/29412.html
- **腾讯云邮件推送：** https://cloud.tencent.com/document/product/1288

---

**下一步：** 按照上面的 Resend 配置指南，5 分钟完成邮件服务配置！
