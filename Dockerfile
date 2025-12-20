# Stage 1: 依赖安装
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# Stage 2: 构建应用
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建参数
ARG NEXT_PUBLIC_NWPUSHARE_ADDRESS_PROD
ARG NEXT_PUBLIC_TOKI_NWPUSHARE_S3_STORAGE_URL

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# 设置数据库 URL（构建时的占位符）
ENV TOKI_DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder"

# 生成Prisma客户端
RUN pnpm prisma generate

# 构建Next.js应用
RUN pnpm build

# Stage 3: 运行应用
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
