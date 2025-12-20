import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParseGetQuery, kunParsePostBody } from '~/app/api/utils/parseQuery'
import {
  courseResourceCreateSchema,
  RESOURCE_TYPES
} from '~/validations/course'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

const formatCourseNameFromSlug = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  type: z.enum(RESOURCE_TYPES).optional(),
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
    ...(parsed.type ? { type: parsed.type as any } : {}),
    ...(parsed.teacherId ? { teacher_id: parsed.teacherId } : {}),
    ...(parsed.term ? { term: parsed.term } : {})
  }

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
        links: true,
        size_bytes: true,
        author: { select: { id: true, name: true, avatar: true, role: true } }
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

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const input = await kunParsePostBody(req, courseResourceCreateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const { dept, slug } = await params
  let department = await prisma.department.findUnique({ where: { slug: dept } })
  if (!department) {
    department = await prisma.department.create({
      data: {
        slug: dept,
        name: dept.toUpperCase()
      }
    })
  }

  let course = await prisma.course.findUnique({
    where: { department_id_slug: { department_id: department.id, slug } }
  })
  if (!course) {
    const courseName =
      input.courseName?.trim() || formatCourseNameFromSlug(slug)
    course = await prisma.course.create({
      data: {
        department_id: department.id,
        slug,
        name: courseName,
        tags: null  // MySQL不支持数组，使用null或JSON字符串
      }
    })
  }

  if (input.courseId && course.id !== input.courseId) {
    return NextResponse.json('课程信息不一致')
  }

  // 所有用户资源自动上架，通过举报机制审核
  const created = await prisma.resource.create({
    data: {
      course_id: course.id,
      title: input.title,
      type: input.type,
      links: JSON.stringify(input.links),  // 转换为JSON字符串存储
      term: input.term,
      teacher_id: input.teacherId ?? null,
      author_id: payload.uid,
      status: 'published',  // 自动上架
      visibility: 'public'
    },
    select: {
      id: true,
      title: true,
      type: true,
      created: true,
      links: true,
      size_bytes: true,
      author: { select: { id: true, name: true, avatar: true, role: true } }
    }
  })

  // 返回时解析JSON字段
  return NextResponse.json({
    ...created,
    links: JSON.parse(created.links)
  })
}
