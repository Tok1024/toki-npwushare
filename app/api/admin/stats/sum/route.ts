import { NextRequest, NextResponse } from 'next/server'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import type { SumData } from '~/types/api/admin'

export const getSumData = async (): Promise<SumData> => {
  const [
    userCount,
    courseCount,
    resourceCount,
    commentCount,
    departmentCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.resource.count(),
    prisma.comment.count(),
    prisma.department.count()
  ])

  return {
    userCount,
    courseCount,
    resourceCount,
    commentCount,
    departmentCount
  }
}

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const data = await getSumData()
  return NextResponse.json(data)
}
