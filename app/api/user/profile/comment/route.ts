import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { getUserInfoSchema } from '~/validations/user'
import { markdownToText } from '~/utils/markdownToText'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import type { UserComment } from '~/types/api/user'

export const getUserComment = async (
  input: z.infer<typeof getUserInfoSchema>
) => {
  const { uid, page, limit } = input
  const offset = (page - 1) * limit

  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      where: { author_id: uid },
      include: {
        author: true,
        course: { include: { department: true } },
        parent: { include: { author: true } },
        _count: { select: { like_by: true } }
      },
      orderBy: { created: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.comment.count({
      where: { author_id: uid }
    })
  ])

  const comments: UserComment[] = data.map((comment) => ({
    id: comment.id,
    patchUniqueId:
      comment.course && comment.course.department
        ? `${comment.course.department.slug}/${comment.course.slug}`
        : '',
    content: markdownToText(comment.content).slice(0, 233),
    like: comment._count.like_by,
    userId: comment.author_id || 0,
    patchId: comment.course_id || 0,
    patchName: comment.course?.name || '',
    created: String(comment.created),
    quotedUserUid: comment.parent?.author?.id,
    quotedUsername: comment.parent?.author?.name
  }))

  return { comments, total }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, getUserInfoSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户登陆失效')
  }

  const response = await getUserComment(input)
  return NextResponse.json(response)
}
