import Redis from 'ioredis'

const NWPUSHARE_REDIS_PREFIX = 'toki:nwpushare'

export const redis = new Redis({
  port: parseInt(process.env.REDIS_PORT!),
  host: process.env.REDIS_HOST
})

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
