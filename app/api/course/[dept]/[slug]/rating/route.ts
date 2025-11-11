import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParseDeleteQuery, kunParseGetQuery, kunParsePostBody, kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { courseRatingCreateSchema, courseRatingUpdateSchema } from '~/validations/course'
import type { KunPatchRating } from '~/types/api/galgame'

const deptSlugSchema = z.object({ dept: z.string(), slug: z.string() })
const ratingIdSchema = z.object({ ratingId: z.coerce.number().min(1) })

const getCourse = async (dept: string, slug: string) => {
  const department = await prisma.department.findUnique({ where: { slug: dept } })
  if (!department) return null
  const course = await prisma.course.findUnique({ where: { department_id_slug: { department_id: department.id, slug } } })
  return course
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const payload = await verifyHeaderCookie(req)
  const { dept, slug } = deptSlugSchema.parse(await params)
  const course = await getCourse(dept, slug)
  if (!course) return NextResponse.json('课程不存在')

  const data = await prisma.course_rating.findMany({
    where: { course_id: course.id },
    include: {
      user: true,
      _count: { select: { like: true } },
      ...(payload ? { like: { where: { user_id: payload.uid } } } : {})
    },
    orderBy: { created: 'desc' }
  })

  const list: KunPatchRating[] = data.map((r) => ({
    id: r.id,
    uniqueId: `${dept}/${slug}`,
    recommend: r.recommend,
    overall: r.overall,
    playStatus: r.play_status,
    shortSummary: r.short_summary,
    spoilerLevel: r.spoiler_level,
    isLike: Array.isArray((r as any).like) ? ((r as any).like.length > 0) : false,
    likeCount: r._count.like,
    userId: r.user_id,
    patchId: course.id,
    created: r.created,
    updated: r.updated,
    user: { id: r.user.id, name: r.user.name, avatar: r.user.avatar }
  }))

  return NextResponse.json(list)
}

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const input = await kunParsePostBody(req, courseRatingCreateSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')
  const { dept, slug } = deptSlugSchema.parse(await params)
  const course = await getCourse(dept, slug)
  if (!course || course.id !== input.courseId) return NextResponse.json('课程不存在')

  const exists = await prisma.course_rating.findUnique({ where: { course_id_user_id: { course_id: course.id, user_id: payload.uid } } })
  if (exists) return NextResponse.json('您已经评价过该课程')

  const created = await prisma.course_rating.create({
    data: {
      course_id: course.id,
      user_id: payload.uid,
      recommend: input.recommend,
      overall: input.overall,
      play_status: input.playStatus,
      short_summary: input.shortSummary,
      spoiler_level: input.spoilerLevel
    },
    include: { user: true, _count: { select: { like: true } } }
  })

  const out: KunPatchRating = {
    id: created.id,
    uniqueId: `${dept}/${slug}`,
    recommend: created.recommend,
    overall: created.overall,
    playStatus: created.play_status,
    shortSummary: created.short_summary,
    spoilerLevel: created.spoiler_level,
    isLike: false,
    likeCount: created._count.like,
    userId: payload.uid,
    patchId: course.id,
    created: created.created,
    updated: created.updated,
    user: { id: created.user.id, name: created.user.name, avatar: created.user.avatar }
  }

  return NextResponse.json(out)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, courseRatingUpdateSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const existing = await prisma.course_rating.findUnique({ where: { id: input.ratingId } })
  if (!existing) return NextResponse.json('评价不存在')
  if (existing.user_id !== payload.uid && payload.role < 3) return NextResponse.json('没有权限')

  const updated = await prisma.course_rating.update({
    where: { id: input.ratingId },
    data: {
      recommend: input.recommend,
      overall: input.overall,
      play_status: input.playStatus,
      short_summary: input.shortSummary,
      spoiler_level: input.spoilerLevel
    },
    include: { user: true, _count: { select: { like: true } } }
  })

  const out: KunPatchRating = {
    id: updated.id,
    uniqueId: '',
    recommend: updated.recommend,
    overall: updated.overall,
    playStatus: updated.play_status,
    shortSummary: updated.short_summary,
    spoilerLevel: updated.spoiler_level,
    isLike: false,
    likeCount: updated._count.like,
    userId: updated.user_id,
    patchId: updated.course_id,
    created: updated.created,
    updated: updated.updated,
    user: { id: updated.user.id, name: updated.user.name, avatar: updated.user.avatar }
  }

  return NextResponse.json(out)
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, ratingIdSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')
  const existing = await prisma.course_rating.findUnique({ where: { id: input.ratingId } })
  if (!existing) return NextResponse.json('评价不存在')
  if (existing.user_id !== payload.uid && payload.role < 3) return NextResponse.json('没有权限')
  await prisma.course_rating.delete({ where: { id: input.ratingId } })
  return NextResponse.json({})
}
