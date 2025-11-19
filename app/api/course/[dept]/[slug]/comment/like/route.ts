import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

const commentIdSchema = z.object({ commentId: z.coerce.number().min(1) })

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, commentIdSchema)
  if (typeof input === 'string') return NextResponse.json(input)
  const payload = await verifyHeaderCookie(req)
  if (!payload) return NextResponse.json('请先登录')

  const comment = await prisma.comment.findUnique({
    where: { id: input.commentId }
  })
  if (!comment) return NextResponse.json('评论不存在')
  if (comment.author_id === payload.uid)
    return NextResponse.json('您不能给自己点赞')

  const existing = await prisma.course_comment_like.findUnique({
    where: {
      user_id_comment_id: { user_id: payload.uid, comment_id: input.commentId }
    }
  })

  if (existing) {
    await prisma.course_comment_like.delete({
      where: {
        user_id_comment_id: {
          user_id: payload.uid,
          comment_id: input.commentId
        }
      }
    })
    return NextResponse.json(false)
  } else {
    await prisma.course_comment_like.create({
      data: { user_id: payload.uid, comment_id: input.commentId }
    })
    return NextResponse.json(true)
  }
}
