import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

const PatchSchema = z.object({
  status: z.enum(['draft', 'pending', 'published', 'rejected'])
})

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const resourceId = Number(id)
  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    return NextResponse.json('资源 ID 非法')
  }

  const input = await req.json().catch(() => null)
  const parsed = input ? PatchSchema.safeParse(input) : { success: false }
  if (!('success' in parsed) || !parsed.success) {
    return NextResponse.json('参数不合法')
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { id: true, author_id: true, status: true }
  })
  if (!resource) return NextResponse.json('资源不存在')

  const requester = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { role: true }
  })
  if (!requester) return NextResponse.json('用户不存在')

  const target = parsed.data.status
  if (requester.role >= 3) {
    // 管理员可修改为任意状态
  } else if (resource.author_id === payload.uid) {
    // 作者仅允许 draft/pending
    if (target !== 'draft' && target !== 'pending') {
      return NextResponse.json('无权设置该状态')
    }
  } else {
    return NextResponse.json('无权限')
  }

  const updated = await prisma.resource.update({
    where: { id: resourceId },
    data: { status: target }
  })

  return NextResponse.json({ id: updated.id, status: updated.status })
}
