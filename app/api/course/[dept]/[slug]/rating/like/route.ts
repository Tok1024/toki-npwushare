import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

const ratingIdSchema = z.object({ ratingId: z.coerce.number().min(1) })

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, ratingIdSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('请先登录')

  const rating = await prisma.course_rating.findUnique({ where: { id: input.ratingId } })
  if (!rating) return NextResponse.json('评价不存在')
  if (rating.user_id === payload.uid) return NextResponse.json('您不能给自己点赞')

  const existing = await prisma.course_rating_like.findUnique({
    where: { course_rating_id_user_id: { course_rating_id: rating.id, user_id: payload.uid } }
  })

  if (existing) {
    await prisma.course_rating_like.delete({ where: { course_rating_id_user_id: { course_rating_id: rating.id, user_id: payload.uid } } })
    return NextResponse.json(false)
  } else {
    await prisma.course_rating_like.create({ data: { course_rating_id: rating.id, user_id: payload.uid } })
    return NextResponse.json(true)
  }
}

