import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  dept: z.string().optional(),
  keyword: z.string().optional()
})

export const GET = async (req: NextRequest) => {
  const parsed = kunParseGetQuery(req, QuerySchema)
  if (typeof parsed === 'string') {
    return NextResponse.json(parsed)
  }

  const page = parsed.page ?? 1
  const pageSize = parsed.pageSize ?? 20

  const department = parsed.dept
    ? await prisma.department.findUnique({ where: { slug: parsed.dept } })
    : null

  const where = {
    ...(department ? { department_id: department.id } : {}),
    ...(parsed.keyword
      ? {
          OR: [
            { name: { contains: parsed.keyword, mode: 'insensitive' } },
            { slug: { contains: parsed.keyword, mode: 'insensitive' } }
          ]
        }
      : {})
  }

  const [total, list] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy: { created: 'desc' },
      include: { department: true },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ])

  const data = list.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    deptSlug: c.department.slug,
    tags: c.tags,
    heartCount: c.heart_count,
    difficultyAvg: c.difficulty_avg,
    difficultyVotes: c.difficulty_votes,
    resourceCount: c.resource_count,
    postCount: c.post_count,
    coverUrl: c.cover_url
  }))

  return NextResponse.json({ total, page, pageSize, list: data })
}
