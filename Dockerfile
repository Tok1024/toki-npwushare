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

# 为了能读取 prisma.config.ts，需要设置占位符数据库 URL
ENV TOKI_DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder"

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

# 创建构建时的占位符 .env 文件
RUN cat > .env << 'EOF'
TOKI_DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder"
TOKI_NWPUSHARE_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_NWPUSHARE_ADDRESS_DEV="http://localhost:3000"
NEXT_PUBLIC_NWPUSHARE_ADDRESS_PROD="http://localhost:3000"
REDIS_HOST="localhost"
REDIS_PORT="6379"
JWT_ISS="placeholder"
JWT_AUD="placeholder"
JWT_SECRET="placeholder"
NODE_ENV="production"
TOKI_NWPUSHARE_EMAIL_FROM="placeholder"
TOKI_NWPUSHARE_EMAIL_HOST="placeholder"
TOKI_NWPUSHARE_EMAIL_PORT="587"
TOKI_NWPUSHARE_EMAIL_ACCOUNT="placeholder"
TOKI_NWPUSHARE_EMAIL_PASSWORD="placeholder"
TOKI_NWPUSHARE_S3_STORAGE_ACCESS_KEY_ID="placeholder"
TOKI_NWPUSHARE_S3_STORAGE_SECRET_ACCESS_KEY="placeholder"
TOKI_NWPUSHARE_S3_STORAGE_BUCKET_NAME="placeholder"
TOKI_NWPUSHARE_S3_STORAGE_ENDPOINT="s3.amazonaws.com"
TOKI_NWPUSHARE_S3_STORAGE_REGION="us-east-1"
NEXT_PUBLIC_TOKI_NWPUSHARE_S3_STORAGE_URL="http://localhost"
TOKI_NWPUSHARE_IMAGE_BED_HOST="localhost"
TOKI_NWPUSHARE_IMAGE_BED_URL="http://localhost"
KUN_CF_CACHE_ZONE_ID="placeholder"
KUN_CF_CACHE_PURGE_API_TOKEN="placeholder"
TOKI_NWPUSHARE_INDEX_NOW_KEY="placeholder"
EOF

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

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 standalone 输出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 复制 Prisma 相关文件
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# 复制 validations 目录（prisma.config.ts 依赖）
COPY --from=builder /app/validations ./validations

# 设置占位符环境变量
ENV TOKI_DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder"

# 安装 Prisma 并生成客户端
RUN pnpm install --prod --frozen-lockfile && \
    pnpm prisma generate

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
