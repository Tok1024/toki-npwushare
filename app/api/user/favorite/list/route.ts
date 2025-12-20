import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '~/prisma/index'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { parseCourseTags } from '~/utils/parseJsonField'

const getUserFavoritesSchema = z.object({
  userId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
})

export async function GET(req: NextRequest) {
  try {
    const input = kunParseGetQuery(req, getUserFavoritesSchema)
    if (typeof input === 'string') {
      return NextResponse.json({ error: input }, { status: 400 })
    }

    const { userId, page, limit } = input
    const offset = (page - 1) * limit

    // 验证用户存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const [favorites, total] = await Promise.all([
      prisma.course_favorite.findMany({
        where: { user_id: userId },
        include: {
          course: {
            include: {
              department: true
            }
          }
        },
        orderBy: { created: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.course_favorite.count({
        where: { user_id: userId }
      })
    ])

    const data = favorites.map((fav) => ({
      id: fav.course.id,
      name: fav.course.name,
      description: fav.course.description,
      code: fav.course.code,
      slug: fav.course.slug,
      cover_url: fav.course.cover_url,
      instructor_name: fav.course.instructor_name,
      tags: parseCourseTags(fav.course.tags),
      resource_count: fav.course.resource_count,
      post_count: fav.course.post_count,
      heart_count: fav.course.heart_count,
      difficulty_avg: fav.course.difficulty_avg,
      department: {
        id: fav.course.department.id,
        name: fav.course.department.name,
        slug: fav.course.department.slug
      },
      created: fav.created
    }))

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('获取用户收藏列表错误:', error)
    return NextResponse.json({ error: '获取收藏列表失败' }, { status: 500 })
  }
}
