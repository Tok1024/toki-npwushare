import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma'

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'pending', 'published', 'rejected']).optional(),
  authorId: z.coerce.number().int().optional(),
  courseId: z.coerce.number().int().optional()
})

const UpdateSchema = z.object({
  id: z.coerce.number().int().min(1),
  status: z.enum(['draft', 'pending', 'published', 'rejected']).optional(),
  title: z.string().max(255).optional(),
  type: z
    .enum(['note', 'slides', 'assignment', 'exam', 'solution', 'link', 'other'])
    .optional(),
  links: z.array(z.string()).optional()
})

const DeleteSchema = z.object({ id: z.coerce.number().int().min(1) })

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams.entries())
  const parsed = QuerySchema.safeParse(params)
  if (!parsed.success) return NextResponse.json('参数不合法')
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }
  const { page, pageSize, status, authorId, courseId } = parsed.data
  const where = {
    ...(status ? { status } : {}),
    ...(authorId ? { author_id: authorId } : {}),
    ...(courseId ? { course_id: courseId } : {})
  } as const

  const [total, list] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      orderBy: { created: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        created: true,
        links: true,
        author: { select: { id: true, name: true } },
        course: {
          select: {
            id: true,
            name: true,
            slug: true,
            department: { select: { slug: true } }
          }
        }
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ])

  // 解析JSON字段
  const formattedList = list.map(item => ({
    ...item,
    links: JSON.parse(item.links)
  }))

  return NextResponse.json({ total, page, pageSize, list: formattedList })
}

export const PUT = async (req: NextRequest) => {
  const body = await req.json().catch(() => null)
  const parsed = body ? UpdateSchema.safeParse(body) : { success: false }
  if (!('success' in parsed) || !parsed.success)
    return NextResponse.json('参数不合法')
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }
  const { id, ...data } = parsed.data

  // 如果更新links，需要转换为JSON字符串
  const updateData = {
    ...data,
    ...(data.links ? { links: JSON.stringify(data.links) } : {})
  }

  const updated = await prisma.resource.update({
    where: { id },
    data: updateData
  })
  return NextResponse.json({ id: updated.id, status: updated.status })
}

export const DELETE = async (req: NextRequest) => {
  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams.entries())
  const parsed = DeleteSchema.safeParse(params)
  if (!parsed.success) return NextResponse.json('参数不合法')
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }
  await prisma.resource.delete({ where: { id: parsed.data.id } })
  return NextResponse.json({ ok: true })
}
