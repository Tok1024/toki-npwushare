import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  dept: z.string().optional()
})

export const GET = async (req: NextRequest) => {
  const parsed = kunParseGetQuery(req, QuerySchema)
  if (typeof parsed === 'string') return NextResponse.json(parsed)

  const page = parsed.page ?? 1
  const pageSize = parsed.pageSize ?? 20

  const dept = parsed.dept
    ? await prisma.department.findUnique({ where: { slug: parsed.dept } })
    : null

  const where = {
    status: 'published' as const,
    ...(dept ? { course: { department_id: dept.id } } : {})
  }

  const [total, list] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      orderBy: { created: 'desc' },
      include: { course: { include: { department: true } }, teacher: true },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ])

  const data = list.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    created: r.created,
    courseName: r.course.name,
    courseSlug: r.course.slug,
    deptSlug: r.course.department.slug,
    teacherName: r.teacher?.name ?? null
  }))

  return NextResponse.json({ total, page, pageSize, list: data })
}
