import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

const reportSchema = z.object({
  resourceId: z.number().int().min(1, { message: '资源ID无效' }),
  reason: z.string().min(1, { message: '请填写举报理由' }).max(500, { message: '举报理由不能超过500字' })
})

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, reportSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  // 检查资源是否存在
  const resource = await prisma.resource.findUnique({
    where: { id: input.resourceId },
    select: {
      id: true,
      title: true,
      course: {
        select: {
          slug: true,
          department: { select: { slug: true } }
        }
      }
    }
  })

  if (!resource) {
    return NextResponse.json('资源不存在')
  }

  // 检查是否已经举报过
  const existingReport = await prisma.user_message.findFirst({
    where: {
      sender_id: payload.uid,
      type: 'report',
      link: `/course/${resource.course.department.slug}/${resource.course.slug}/r/${input.resourceId}`
    }
  })

  if (existingReport) {
    return NextResponse.json('您已经举报过该资源')
  }

  // 创建举报记录
  await prisma.user_message.create({
    data: {
      type: 'report',
      sender_id: payload.uid,
      content: `举报资源："${resource.title}"\n\n举报理由：${input.reason}`,
      link: `/course/${resource.course.department.slug}/${resource.course.slug}/r/${input.resourceId}`,
      status: 0  // 待处理
    }
  })

  return NextResponse.json({ success: true })
}
