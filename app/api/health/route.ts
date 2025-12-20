import { NextResponse } from 'next/server'
import { prisma } from '~/prisma'
import { redis } from '~/lib/redis'

export const GET = async () => {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`

    // 检查Redis连接
    await redis.ping()

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        redis: 'healthy'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
