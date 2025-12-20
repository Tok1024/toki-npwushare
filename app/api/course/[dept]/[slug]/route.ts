import { NextResponse } from 'next/server'
import { prisma } from '~/prisma'
import { parseCourseTags } from '~/utils/parseJsonField'

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ dept: string; slug: string }> }
) => {
  const { dept, slug } = await params
  if (!dept || !slug) {
    return NextResponse.json('缺少参数: dept 或 slug')
  }

  const department = await prisma.department.findUnique({
    where: { slug: dept }
  })
  if (!department) {
    return NextResponse.json('学院不存在')
  }

  const course = await prisma.course.findUnique({
    where: { department_id_slug: { department_id: department.id, slug } },
    include: { department: true }
  })

  if (!course) {
    return NextResponse.json('课程不存在')
  }

  // Parse tags from JSON string (MySQL stores as TEXT)
  const parsedCourse = {
    ...course,
    tags: parseCourseTags(course.tags)
  }

  // 参与教师（历史授课记录）
  const teachers = await prisma.course_teacher.findMany({
    where: { course_id: course.id },
    include: { teacher: true }
  })

  return NextResponse.json({ course: parsedCourse, teachers: teachers.map((t) => t.teacher) })
}
