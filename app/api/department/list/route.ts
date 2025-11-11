import { NextResponse } from 'next/server'
import { prisma } from '~/prisma'

export const GET = async () => {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      courses: {
        select: { id: true, name: true, slug: true }
      }
    },
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(departments)
}
