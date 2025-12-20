import Redis from 'ioredis'

const NWPUSHARE_REDIS_PREFIX = 'toki:nwpushare'

// 在构建时延迟连接，避免 ECONNREFUSED 错误
const createRedisClient = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_HOST) {
    // 构建时返回模拟客户端
    return null as any
  }
  return new Redis({
    port: parseInt(process.env.REDIS_PORT || '6379'),
    host: process.env.REDIS_HOST || 'localhost',
    lazyConnect: true, // 延迟连接
    retryStrategy: () => null // 构建时不重试
  })
}

export const redis = createRedisClient()

export const setKv = async (key: string, value: string, time?: number) => {
  const keyString = `${NWPUSHARE_REDIS_PREFIX}:${key}`
  if (time) {
    await redis.setex(keyString, time, value)
  } else {
    await redis.set(keyString, value)
  }
}

export const getKv = async (key: string) => {
  const keyString = `${NWPUSHARE_REDIS_PREFIX}:${key}`
  const value = await redis.get(keyString)
  return value
}

export const delKv = async (key: string) => {
  const keyString = `${NWPUSHARE_REDIS_PREFIX}:${key}`
  await redis.del(keyString)
}
