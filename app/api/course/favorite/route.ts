import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '~/prisma/index'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

const favoriteSchema = z.object({
  courseId: z.number().int().positive(),
  action: z.enum(['add', 'remove'])
})

export async function POST(req: NextRequest) {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { courseId, action } = favoriteSchema.parse(body)

    // 验证课程存在
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 })
    }

    if (action === 'add') {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.course_favorite.findUnique({
          where: {
            user_id_course_id: {
              user_id: payload.uid,
              course_id: courseId
            }
          }
        })

        if (!existing) {
          await tx.course_favorite.create({
            data: {
              user_id: payload.uid,
              course_id: courseId
            }
          })
          await tx.course.update({
            where: { id: courseId },
            data: { heart_count: { increment: 1 } }
          })
        }
      })
      return NextResponse.json({ success: true, message: '已收藏' })
    } else {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.course_favorite.findUnique({
          where: {
            user_id_course_id: {
              user_id: payload.uid,
              course_id: courseId
            }
          }
        })

        if (existing) {
          await tx.course_favorite.delete({
            where: {
              user_id_course_id: {
                user_id: payload.uid,
                course_id: courseId
              }
            }
          })
          await tx.course.update({
            where: { id: courseId },
            data: { heart_count: { decrement: 1 } }
          })
        }
      })
      return NextResponse.json({ success: true, message: '已取消收藏' })
    }
  } catch (error) {
    console.error('收藏操作错误:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

// 获取课程是否已收藏
export async function GET(req: NextRequest) {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  try {
    const searchParams = req.nextUrl.searchParams
    const courseId = parseInt(searchParams.get('courseId') || '0')

    if (!courseId) {
      return NextResponse.json({ error: '缺少 courseId 参数' }, { status: 400 })
    }

    const favorite = await prisma.course_favorite.findUnique({
      where: {
        user_id_course_id: {
          user_id: payload.uid,
          course_id: courseId
        }
      }
    })

    return NextResponse.json({ isFavorited: !!favorite })
  } catch (error) {
    console.error('检查收藏状态错误:', error)
    return NextResponse.json({ error: '检查失败' }, { status: 500 })
  }
}
