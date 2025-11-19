import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import {
  kunParseDeleteQuery,
  kunParsePostBody,
  kunParsePutBody
} from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import {
  courseFeedbackCreateSchema,
  courseFeedbackUpdateSchema
} from '~/validations/course'

const deptSlugSchema = z.object({ dept: z.string(), slug: z.string() })
const feedbackIdSchema = z.object({ feedbackId: z.coerce.number().min(1) })

const getCourse = async (dept: string, slug: string) => {
  const department = await prisma.department.findUnique({ where: { slug: dept } })
  if (!department) return null
  const course = await prisma.course.findUnique({
    where: { department_id_slug: { department_id: department.id, slug } }
  })
  return course
}

const mapFeedback = (dept: string, slug: string) => {
  return (feedback: any) => ({
    id: feedback.id,
    courseId: feedback.course_id,
    liked: feedback.liked,
    difficulty: feedback.difficulty,
    comment: feedback.comment,
    created: feedback.created,
    updated: feedback.updated,
    uniqueId: `${dept}/${slug}`,
    user: feedback.user
      ? {
          id: feedback.user.id,
          name: feedback.user.name,
          avatar: feedback.user.avatar
        }
      : null
  })
}

const refreshCourseStats = async (courseId: number) => {
  const [heartCount, difficultyAgg] = await Promise.all([
    prisma.course_feedback.count({
      where: { course_id: courseId, liked: true }
    }),
    prisma.course_feedback.aggregate({
      _avg: { difficulty: true },
      _count: { difficulty: true },
      where: { course_id: courseId, difficulty: { not: null } }
    })
  ])

  await prisma.course.update({
    where: { id: courseId },
    data: {
      heart_count: heartCount,
      difficulty_avg: difficultyAgg._avg.difficulty ?? 0,
      difficulty_votes: difficultyAgg._count.difficulty
    }
  })
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const payload = await verifyHeaderCookie(req)
  const { dept, slug } = deptSlugSchema.parse(await params)

  const course = await getCourse(dept, slug)
  if (!course) return NextResponse.json('课程不存在')

  const feedbacks = await prisma.course_feedback.findMany({
    where: { course_id: course.id },
    include: { user: true },
    orderBy: { created: 'desc' }
  })

  const mapped = feedbacks.map(mapFeedback(dept, slug))
  const mine = payload
    ? mapped.find((item) => item.user?.id === payload.uid) ?? null
    : null

  return NextResponse.json({
    stats: {
      heartCount: course.heart_count,
      difficultyAvg: course.difficulty_avg,
      difficultyVotes: course.difficulty_votes
    },
    feedbacks: mapped,
    mine
  })
}

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const input = await kunParsePostBody(req, courseFeedbackCreateSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const { dept, slug } = deptSlugSchema.parse(await params)
  const course = await getCourse(dept, slug)
  if (!course || course.id !== input.courseId) {
    return NextResponse.json('课程不存在')
  }

  const exists = await prisma.course_feedback.findUnique({
    where: { course_id_user_id: { course_id: course.id, user_id: payload.uid } }
  })
  if (exists) return NextResponse.json('您已经提交过反馈')

  const created = await prisma.course_feedback.create({
    data: {
      course_id: course.id,
      user_id: payload.uid,
      liked: input.liked,
      difficulty: input.difficulty ?? null,
      comment: input.comment ?? null
    },
    include: { user: true }
  })

  await refreshCourseStats(course.id)

  return NextResponse.json(mapFeedback(dept, slug)(created))
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, courseFeedbackUpdateSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const existing = await prisma.course_feedback.findUnique({
    where: { id: input.feedbackId },
    include: { user: true, course: { include: { department: true } } }
  })
  if (!existing) return NextResponse.json('反馈不存在')
  if (existing.user_id !== payload.uid && payload.role < 3) {
    return NextResponse.json('没有权限')
  }

  const updated = await prisma.course_feedback.update({
    where: { id: input.feedbackId },
    data: {
      liked: input.liked,
      difficulty: input.difficulty ?? null,
      comment: input.comment ?? null
    },
    include: { user: true }
  })

  await refreshCourseStats(existing.course_id)

  const dept = existing.course?.department?.slug ?? ''
  const slug = existing.course?.slug ?? ''

  return NextResponse.json(mapFeedback(dept, slug)(updated))
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, feedbackIdSchema)
  if (typeof input === 'string') return NextResponse.json(input)

  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('用户未登录')

  const existing = await prisma.course_feedback.findUnique({
    where: { id: input.feedbackId }
  })
  if (!existing) return NextResponse.json('反馈不存在')
  if (existing.user_id !== payload.uid && payload.role < 3) {
    return NextResponse.json('没有权限')
  }

  await prisma.course_feedback.delete({ where: { id: input.feedbackId } })
  await refreshCourseStats(existing.course_id)

  return NextResponse.json({})
}
