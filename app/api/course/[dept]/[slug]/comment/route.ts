import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParseDeleteQuery, kunParseGetQuery, kunParsePostBody, kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { markdownToHtml } from '~/app/api/utils/render/markdownToHtml'
import { courseCommentCreateSchema, courseCommentUpdateSchema } from '~/validations/course'
import { nestCourseComments } from './_helpers'
import type { PatchComment } from '~/types/api/patch'

const deptSlugSchema = z.object({ dept: z.string(), slug: z.string() })

const commentIdSchema = z.object({
  commentId: z.coerce.number({ message: '评论 ID 必须为数字' }).min(1).max(9999999)
})

const getCourse = async (dept: string, slug: string) => {
  const department = await prisma.department.findUnique({ where: { slug: dept } })
  if (!department) return null
  const course = await prisma.course.findUnique({
    where: { department_id_slug: { department_id: department.id, slug } }
  })
  return course
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const { dept, slug } = deptSlugSchema.parse(await params)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户登陆失效')

  const course = await getCourse(dept, slug)
  if (!course) return NextResponse.json('课程不存在')

  const data = await prisma.comment.findMany({
    where: { course_id: course.id },
    include: {
      author: true,
      like_by: { where: { user_id: payload.uid } },
      _count: { select: { like_by: true } }
    }
  })

  const flat: PatchComment[] = await Promise.all(
    data.map(async (c) => ({
      id: c.id,
      uniqueId: `${dept}/${slug}`,
      content: await markdownToHtml(c.content),
      isLike: c.like_by.length > 0,
      likeCount: c._count.like_by,
      parentId: c.parent_id,
      userId: c.author_id || 0,
      patchId: course.id,
      created: String(c.created),
      updated: String(c.updated),
      reply: [],
      user: { id: c.author?.id || 0, name: c.author?.name || 'User', avatar: c.author?.avatar || '' }
    }))
  )

  return NextResponse.json(nestCourseComments(flat))
}

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const input = await kunParsePostBody(req, courseCommentCreateSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const { dept, slug } = deptSlugSchema.parse(await params)
  const course = await getCourse(dept, slug)
  if (!course || input.courseId !== course.id) return NextResponse.json('课程不存在')

  const created = await prisma.comment.create({
    data: {
      course_id: course.id,
      author_id: payload.uid,
      parent_id: input.parentId ?? undefined,
      content: input.content
    }
  })

  return NextResponse.json(created)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, courseCommentUpdateSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const existing = await prisma.comment.findUnique({ where: { id: input.commentId } })
  if (!existing) return NextResponse.json('评论不存在')
  if (existing.author_id !== payload.uid && payload.role < 3) return NextResponse.json('没有权限')

  const updated = await prisma.comment.update({ where: { id: input.commentId }, data: { content: input.content } })
  return NextResponse.json(updated)
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, commentIdSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const existing = await prisma.comment.findUnique({ where: { id: input.commentId } })
  if (!existing) return NextResponse.json('评论不存在')
  if (existing.author_id !== payload.uid && payload.role < 3) return NextResponse.json('没有权限')

  await prisma.comment.delete({ where: { id: input.commentId } })
  return NextResponse.json({})
}
