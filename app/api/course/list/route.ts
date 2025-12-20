import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { parseCourseTags } from '~/utils/parseJsonField'

//这个页是server component, 可以直接用prisma

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  dept: z.string().optional(),
  keyword: z.string().optional(),
  sort: z.enum(['latest', 'popular']).optional(),
  hasResource: z.coerce.boolean().optional()
})

export const GET = async (req: NextRequest) => {
  const parsed = kunParseGetQuery(req, QuerySchema)
  if (typeof parsed === 'string') {
    return NextResponse.json(parsed)
  }

  const page = parsed.page ?? 1
  const pageSize = parsed.pageSize ?? 20
  const sort = parsed.sort ?? 'popular'
  const hasResource = parsed.hasResource ?? '0'

  const department = parsed.dept
    ? await prisma.department.findUnique({ where: { slug: parsed.dept } })
    : null

  const where = {
    ...(department ? { department_id: department.id } : {}),
    ...(parsed.keyword
      ? {
          OR: [
            {
              name: { contains: parsed.keyword as const }
            },
            { slug: { contains: parsed.keyword as const } }
          ]
        }
      : {}),
    ...(hasResource ? { resource_count: { gt: 0 } } : {})
  }
  // 用as const把字符串收窄为字面量, 符合prisma的类型推断
  const orderBy =
    sort === 'popular'
      ? { heart_count: 'desc' as const }
      : { created: 'desc' as const }

  const [total, list] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy,
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
    tags: parseCourseTags(c.tags),
    heartCount: c.heart_count,
    difficultyAvg: c.difficulty_avg,
    difficultyVotes: c.difficulty_votes,
    resourceCount: c.resource_count,
    postCount: c.post_count,
    coverUrl: c.cover_url
  }))

  return NextResponse.json({ total, page, pageSize, list: data })
}
