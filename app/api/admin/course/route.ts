import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma'
import { parseCourseTags, stringifyJsonArray } from '~/utils/parseJsonField'

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  departmentId: z.coerce.number().int().optional(),
  search: z.string().optional()
})

const UpdateCourseSchema = z.object({
  id: z.coerce.number().int().min(1),
  name: z.string().max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  instructor_name: z.string().max(255).nullable().optional(),
  cover_url: z.string().url().max(512).nullable().optional(),
  tags: z.array(z.string()).optional()
})

const DeleteSchema = z.object({ id: z.coerce.number().int().min(1) })

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams.entries())
  const parsed = QuerySchema.safeParse(params)
  if (!parsed.success) return NextResponse.json('参数不合法')

  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')
  if (payload.role < 3) return NextResponse.json('本页面仅管理员可访问')

  const { page, pageSize, departmentId, search } = parsed.data
  const where = {
    ...(departmentId ? { department_id: departmentId } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search as const } },
        { code: { contains: search as const } },
        { instructor_name: { contains: search as const } }
      ]
    } : {})
  }

  const [total, list] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy: { created: 'desc' },
      select: {
        id: true,
        slug: true,
        code: true,
        name: true,
        description: true,
        instructor_name: true,
        cover_url: true,
        tags: true,
        resource_count: true,
        post_count: true,
        heart_count: true,
        created: true,
        department: {
          select: {
            id: true,
            slug: true,
            name: true
          }
        }
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ])

  // Parse tags from JSON string (MySQL stores as TEXT)
  const formattedList = list.map(course => ({
    ...course,
    tags: parseCourseTags(course.tags)
  }))

  return NextResponse.json({ total, page, pageSize, list: formattedList })
}

export const PUT = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')
  if (payload.role < 3) return NextResponse.json('本页面仅管理员可访问')

  const body = await req.json().catch(() => null)
  const parsed = body ? UpdateCourseSchema.safeParse(body) : { success: false }
  if (!('success' in parsed) || !parsed.success)
    return NextResponse.json('参数不合法')

  const { id, tags, ...rest } = parsed.data

  // Convert tags array to JSON string for MySQL
  const updateData = {
    ...rest,
    ...(tags !== undefined ? { tags: stringifyJsonArray(tags) } : {})
  }

  const updated = await prisma.course.update({
    where: { id },
    data: updateData
  })
  return NextResponse.json({ id: updated.id })
}

export const DELETE = async (req: NextRequest) => {
  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams.entries())
  const parsed = DeleteSchema.safeParse(params)
  if (!parsed.success) return NextResponse.json('参数不合法')

  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')
  if (payload.role < 3) return NextResponse.json('本页面仅管理员可访问')

  await prisma.course.delete({ where: { id: parsed.data.id } })
  return NextResponse.json({ ok: true })
}
