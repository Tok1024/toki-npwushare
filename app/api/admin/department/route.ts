import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma'

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional()
})

const CreateSchema = z.object({
  slug: z.string().min(1).max(128),
  code: z.string().max(64).nullable().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional()
})

const UpdateSchema = z.object({
  id: z.coerce.number().int().min(1),
  slug: z.string().min(1).max(128).optional(),
  code: z.string().max(64).nullable().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional()
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

  const { page, pageSize, search } = parsed.data
  const where = search
    ? {
        OR: [
          { name: { contains: search as const } },
          { code: { contains: search as const } },
          { slug: { contains: search as const } }
        ]
      }
    : {}

  const [total, list] = await Promise.all([
    prisma.department.count({ where }),
    prisma.department.findMany({
      where,
      orderBy: { created: 'desc' },
      select: {
        id: true,
        slug: true,
        code: true,
        name: true,
        description: true,
        created: true,
        _count: {
          select: {
            courses: true
          }
        }
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ])

  return NextResponse.json({ total, page, pageSize, list })
}

export const POST = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')
  if (payload.role < 3) return NextResponse.json('本页面仅管理员可访问')

  const body = await req.json().catch(() => null)
  const parsed = body ? CreateSchema.safeParse(body) : { success: false }
  if (!('success' in parsed) || !parsed.success) {
    return NextResponse.json('参数不合法')
  }

  try {
    const created = await prisma.department.create({
      data: parsed.data
    })
    return NextResponse.json({ id: created.id })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json('slug 或 code 已存在')
    }
    return NextResponse.json('创建失败')
  }
}

export const PUT = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')
  if (payload.role < 3) return NextResponse.json('本页面仅管理员可访问')

  const body = await req.json().catch(() => null)
  const parsed = body ? UpdateSchema.safeParse(body) : { success: false }
  if (!('success' in parsed) || !parsed.success) {
    return NextResponse.json('参数不合法')
  }

  const { id, ...rest } = parsed.data
  try {
    const updated = await prisma.department.update({
      where: { id },
      data: rest
    })
    return NextResponse.json({ id: updated.id })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json('slug 或 code 已存在')
    }
    return NextResponse.json('更新失败')
  }
}

export const DELETE = async (req: NextRequest) => {
  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams.entries())
  const parsed = DeleteSchema.safeParse(params)
  if (!parsed.success) return NextResponse.json('参数不合法')

  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')
  if (payload.role < 3) return NextResponse.json('本页面仅管理员可访问')

  try {
    await prisma.department.delete({ where: { id: parsed.data.id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json('无法删除：该学院下还有课程')
    }
    return NextResponse.json('删除失败')
  }
}
