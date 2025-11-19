import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  teacherId: z.coerce.number().int().optional(),
  term: z.string().max(32).optional()
})

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const { dept, slug } = await params
  const parsed = kunParseGetQuery(req, QuerySchema)
  if (typeof parsed === 'string') {
    return NextResponse.json(parsed)
  }

  const page = parsed.page ?? 1
  const pageSize = parsed.pageSize ?? 20

  const department = await prisma.department.findUnique({
    where: { slug: dept }
  })
  if (!department) return NextResponse.json('学院不存在')

  const course = await prisma.course.findUnique({
    where: { department_id_slug: { department_id: department.id, slug } }
  })
  if (!course) return NextResponse.json('课程不存在')

  const where = {
    course_id: course.id,
    status: 'published' as const,
    ...(parsed.teacherId ? { teacher_id: parsed.teacherId } : {}),
    ...(parsed.term ? { term: parsed.term } : {})
  }

  const [total, list] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { created: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ])

  return NextResponse.json({ total, page, pageSize, list })
}
