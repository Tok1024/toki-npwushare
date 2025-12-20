import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParseGetQuery, kunParsePostBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

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
      take: pageSize,
      select: {
        id: true,
        title: true,
        created: true,
        status: true,
        author: { select: { id: true, name: true, avatar: true } }
      }
    })
  ])

  return NextResponse.json({ total, page, pageSize, list })
}

const CreateSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(100000),
  teacherId: z.coerce.number().int().optional(),
  term: z.string().max(32).optional()
})

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const input = await kunParsePostBody(req, CreateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const { dept, slug } = await params
  const department = await prisma.department.findUnique({
    where: { slug: dept }
  })
  if (!department) return NextResponse.json('学院不存在')

  const course = await prisma.course.findUnique({
    where: { department_id_slug: { department_id: department.id, slug } }
  })
  if (!course) return NextResponse.json('课程不存在')

  const created = await prisma.post.create({
    data: {
      course_id: course.id,
      title: input.title,
      content: input.content,
      term: input.term,
      teacher_id: input.teacherId ?? null,
      author_id: payload.uid,
      status: 'published',
      visibility: 'public'
    },
    select: { id: true, title: true, created: true, status: true }
  })

  return NextResponse.json(created)
}
