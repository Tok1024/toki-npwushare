import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '~/prisma'
import { kunParseGetQuery } from '../utils/parseQuery'
import { resourceSchema } from '~/validations/resource'
import type { PatchResource } from '~/types/api/resource'

const mapResource = (resource: any): PatchResource => ({
  id: resource.id,
  name: resource.title,
  section: 'course',
  uniqueId: `course/${resource.course.department.slug}/${resource.course.slug}`,
  storage: 'user',
  size:
    resource.size_bytes && resource.size_bytes > 0
      ? `${(resource.size_bytes / (1024 * 1024)).toFixed(1)} MB`
      : '',
  type: [resource.type],
  language: [],
  platform: [],
  note: resource.links.join('\n'),
  likeCount: 0,
  download: 0,
  patchId: resource.course_id,
  patchName: resource.course.name,
  created: String(resource.created),
  user: {
    id: resource.author.id,
    name: resource.author.name,
    avatar: resource.author.avatar,
    patchCount: resource.author._count.course_resource,
    role: resource.author.role
  }
})

export const getCourseResources = async (
  input: z.infer<typeof resourceSchema>
) => {
  const { sortField, sortOrder, page, limit } = input
  const offset = (page - 1) * limit
  const orderBy =
    sortField === 'created'
      ? { created: sortOrder as Prisma.SortOrder }
      : { created: 'desc' as Prisma.SortOrder }

  const [items, total] = await Promise.all([
    prisma.resource.findMany({
      take: limit,
      skip: offset,
      where: {
        status: 'published',
      },
      orderBy,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            slug: true,
            department: { select: { slug: true } }
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            _count: { select: { course_resource: true } }
          }
        }
      }
    }),
    prisma.resource.count()
  ])

  return {
    resources: items.map(mapResource),
    total
  }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, resourceSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await getCourseResources(input)
  return NextResponse.json(response)
}
