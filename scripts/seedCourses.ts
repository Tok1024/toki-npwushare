import { prisma } from '~/prisma'
import { hashPassword } from '~/app/api/utils/algorithm'


const now = new Date()

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

async function main() {
  // 1) Ensure a seed user exists (author)
  const hashed = await hashPassword('123')
  const user = await prisma.user.upsert({
    where: { email: 'seed@example.com' },
    create: {
      name: 'seed-user',
      email: 'seed@example.com',
      password: hashed,
      avatar: '',
      role: 3 // 设为管理员以便在 UI 中显示为官方
    },
    update: {
      password: hashed
    }
  })

  // 2) Departments
  const deptNames = [
    { slug: 'cs', name: '计算机学院' },
    { slug: 'ee', name: '电子信息学院' }
  ]
  for (const d of deptNames) {
    await prisma.department.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, name: d.name },
      update: { name: d.name }
    })
  }

  const cs = await prisma.department.findUniqueOrThrow({ where: { slug: 'cs' } })
  const ee = await prisma.department.findUniqueOrThrow({ where: { slug: 'ee' } })

  // 3) Teachers
  const t1 = await prisma.teacher.upsert({
    where: { id: 1 },
    create: { name: '张老师', department_id: cs.id },
    update: {}
  })
  const t2 = await prisma.teacher.upsert({
    where: { id: 2 },
    create: { name: '李老师', department_id: cs.id },
    update: {}
  })
  const t3 = await prisma.teacher.upsert({
    where: { id: 3 },
    create: { name: '王老师', department_id: ee.id },
    update: {}
  })

  // 4) Courses (same name across departments are considered different)
  const c1 = await prisma.course.upsert({
    where: { department_id_slug: { department_id: cs.id, slug: 'signal-and-system' } },
    create: {
      department_id: cs.id,
      slug: 'signal-and-system',
      name: '信号与系统',
      tags: ['大二', '必修']
    },
    update: {}
  })
  const c2 = await prisma.course.upsert({
    where: { department_id_slug: { department_id: ee.id, slug: 'signal-and-system' } },
    create: {
      department_id: ee.id,
      slug: 'signal-and-system',
      name: '信号与系统',
      tags: ['大二', '核心']
    },
    update: {}
  })
  const c3 = await prisma.course.upsert({
    where: { department_id_slug: { department_id: cs.id, slug: 'data-structures' } },
    create: {
      department_id: cs.id,
      slug: 'data-structures',
      name: '数据结构',
      tags: ['大二', '算法']
    },
    update: {}
  })

  // 5) Course-Teacher history
  await prisma.course_teacher.upsert({
    where: { id: 1 },
    create: { course_id: c1.id, teacher_id: t1.id, year: '2024-Fall' },
    update: {}
  })
  await prisma.course_teacher.upsert({
    where: { id: 2 },
    create: { course_id: c1.id, teacher_id: t2.id, year: '2025-Spring' },
    update: {}
  })
  await prisma.course_teacher.upsert({
    where: { id: 3 },
    create: { course_id: c2.id, teacher_id: t3.id, year: '2024-Fall' },
    update: {}
  })

  // 6) Resources (only store links)
  const makeRes = async (
    courseId: number,
    title: string,
    type: 'slides' | 'assignment' | 'link',
    teacherId?: number,
    term?: string,
    links?: string[]
  ) =>
    prisma.resource.create({
      data: {
        course_id: courseId,
        title,
        type,
        teacher_id: teacherId,
        term,
        author_id: user.id,
        links: links ?? ['https://example.com/resource'],
        status: 'published'
      }
    })

  await makeRes(c1.id, '期中复习提纲', 'slides', t1.id, '2024-Fall', [
    'https://pan.example.com/s/abc1'
  ])
  await makeRes(c1.id, '课后作业 3', 'assignment', t2.id, '2025-Spring', [
    'https://pan.example.com/s/abc2',
    'https://pan.example.com/s/abc3'
  ])
  await makeRes(c2.id, '历年试题汇总', 'link', t3.id, '2024-Fall', [
    'https://pan.example.com/s/xyz1'
  ])
  await makeRes(c3.id, '数据结构教材勘误', 'link', undefined, '2024-Fall', [
    'https://example.com/blog/ds-errata'
  ])

  console.log('Seed done.')
}

main().finally(async () => {
  await prisma.$disconnect()
})
