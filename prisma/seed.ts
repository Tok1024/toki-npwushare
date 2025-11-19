import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1) department
  const dept = await prisma.department.upsert({
    where: { slug: 'cs' },
    update: {},
    create: {
      slug: 'cs',
      name: '计算机学院'
    }
  })

  // 2) course (使用复合唯一 department_id + slug)
  // 注意：schema 中对该复合键命名为 department_id_slug
  const course = await prisma.course.upsert({
    where: {
      department_id_slug: {
        department_id: dept.id,
        slug: 'intro-to-programming'
      }
    },
    update: {},
    create: {
      department_id: dept.id,
      slug: 'intro-to-programming',
      name: '程序设计导论',
      tags: ['基础', '入门'],
      cover_url: null
    }
  })

  // 3) user
  const user = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: { name: 'Alice' },
    create: { email: 'alice@example.com', name: 'Alice', password: '111' }
  })

  // 4) teacher（如果已存在同名教师则复用）
  let teacher = await prisma.teacher.findFirst({
    where: { name: '张老师', department_id: dept.id }
  })
  if (!teacher) {
    teacher = await prisma.teacher.create({
      data: {
        name: '张老师',
        department_id: dept.id,
        title: '副教授'
      }
    })
  }

  // 5) course_teacher 关联（按 year 做唯一判断）
  const year = '2024'
  const existingCT = await prisma.course_teacher.findFirst({
    where: { course_id: course.id, teacher_id: teacher.id, year }
  })
  if (!existingCT) {
    await prisma.course_teacher.create({
      data: { course_id: course.id, teacher_id: teacher.id, year }
    })
  }

  // 6) resource（原始 URL 设置唯一，幂等）
  const originalUrl = 'https://example.com/intro.pdf'
  let resource = await prisma.resource.findUnique({
    where: { original_url: originalUrl }
  })
  if (!resource) {
    resource = await prisma.resource.create({
      data: {
        course_id: course.id,
        title: '程序设计导论 课堂笔记',
        type: 'note',
        original_url: originalUrl,
        mime: 'application/pdf',
        size_bytes: 1024,
        status: 'published',
        visibility: 'public'
      }
    })
  }

  // 7) post + comment
  const post = await prisma.post.create({
    data: {
      course_id: course.id,
      title: '课程简介与作业安排',
      content: '欢迎来到程序设计导论 —— 这是第一节课的资料。',
      author_id: user.id
    }
  })

  await prisma.comment.create({
    data: {
      content: '感谢分享！',
      author_id: user.id,
      post_id: post.id
    }
  })

  console.log('seed finished:', {
    dept: dept.slug,
    course: course.slug,
    user: user.email
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
