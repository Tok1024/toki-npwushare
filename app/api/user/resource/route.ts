import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { parseResourceLinks } from '~/utils/parseJsonField'

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'pending', 'published', 'rejected']).optional()
})

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams.entries())
  const parsed = QuerySchema.safeParse(params)
  if (!parsed.success) return NextResponse.json('参数不合法')
  const { page, pageSize, status } = parsed.data

  const where = {
    author_id: payload.uid,
    ...(status ? { status } : {})
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
        created: true,
        status: true,
        links: true,
        size_bytes: true,
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

  // Parse links from JSON string (MySQL stores as TEXT)
  const formattedList = list.map(resource => ({
    ...resource,
    links: parseResourceLinks(resource.links)
  }))

  return NextResponse.json({ total, page, pageSize, list: formattedList })
}
