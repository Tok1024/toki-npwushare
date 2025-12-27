import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { getUserInfoSchema } from '~/validations/user'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import type { UserResource } from '~/types/api/user'

export const getUserPatchResource = async (
  input: z.infer<typeof getUserInfoSchema>
) => {
  const { uid, page, limit } = input
  const offset = (page - 1) * limit

  const [data, total] = await Promise.all([
    prisma.resource.findMany({
      where: { author_id: uid },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            slug: true,
            cover_url: true,
            department: { select: { slug: true } }
          }
        }
      },
      orderBy: { created: 'desc' },
      skip: offset,
      take: limit
    }),
    prisma.resource.count({
      where: { author_id: uid }
    })
  ])

  const resources: UserResource[] = data.map((res) => ({
    id: res.id,
    title: res.title,
    patchUniqueId: `course/${res.course.department.slug}/${res.course.slug}`,
    patchId: res.course_id,
    patchName: res.course.name,
    patchBanner: res.course.cover_url || '',
    size: String(res.size_bytes || 0),
    type: [String(res.type)],
    language: [],
    platform: [],
    status: res.status as any,
    created: String(res.created)
  }))

  return { resources, total }
}

export async function GET(req: NextRequest) {
  const input = kunParseGetQuery(req, getUserInfoSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户登陆失效')
  }

  const response = await getUserPatchResource(input)
  return NextResponse.json(response)
}
