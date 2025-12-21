import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { adminPaginationSchema } from '~/validations/admin'
import { markdownToText } from '~/utils/markdownToText'
import type { AdminComment } from '~/types/api/admin'

export const getComment = async (
  input: z.infer<typeof adminPaginationSchema>
) => {
  const { page, limit, search } = input
  const offset = (page - 1) * limit

  const where = search
    ? {
        content: {
          contains: search
          // MySQL utf8mb4_unicode_ci is case-insensitive by default
        }
      }
    : {}

  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { created: 'desc' },
      include: {
        course: {
          select: {
            name: true,
            slug: true,
            department: { select: { slug: true } }
          }
        },
        resource: {
          select: {
            title: true,
            course: { select: { slug: true, department: { select: { slug: true } } } }
          }
        },
        post: {
          select: {
            title: true,
            course: { select: { slug: true, department: { select: { slug: true } } } }
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            like_by: true
          }
        }
      }
    }),
    prisma.comment.count({ where })
  ])

  const comments: AdminComment[] = data.map((comment) => {
    const course = comment.course ?? comment.resource?.course ?? comment.post?.course
    const courseSlug = course?.slug
    const deptSlug = course?.department?.slug
    const uniqueId = courseSlug && deptSlug ? `course/${deptSlug}/${courseSlug}` : ''
    const title = course?.name ?? comment.resource?.title ?? comment.post?.title ?? ''

    return {
      id: comment.id,
      uniqueId,
      user: comment.author as any,
      content: markdownToText(comment.content).slice(0, 233),
      patchName: title,
      patchId: course ? (course as any).id : undefined,
      like: comment._count.like_by,
      created: comment.created
    }
  })

  return { comments, total }
}
