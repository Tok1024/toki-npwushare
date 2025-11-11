import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { prisma } from '~/prisma'
import { KunHeader } from '~/components/kun/Header'

export const revalidate = 60

export default async function DepartmentPage() {
  const departments = await prisma.department.findMany({
    include: {
      _count: { select: { courses: true } },
      courses: {
        select: {
          id: true,
          name: true,
          slug: true,
          resource_count: true
        },
        orderBy: { resource_count: 'desc' },
        take: 3
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-10">
      <KunHeader
        name="学院目录"
        description="按学院浏览课程，快速定位你所在院系的资料与经验分享。"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {departments.map((dept) => (
          <Card key={dept.slug} className="border border-content2 bg-content1/40">
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-default-500">{dept.slug}</p>
                  <h2 className="text-xl font-semibold">{dept.name}</h2>
                </div>
                <span className="text-small text-default-500">
                  课程 {dept._count.courses}
                </span>
              </div>

              <div className="space-y-2">
                {dept.courses.length ? (
                  dept.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between text-sm text-default-600"
                    >
                      <Link
                        className="text-primary hover:underline"
                        href={`/course/${dept.slug}/${course.slug}`}
                      >
                        {course.name}
                      </Link>
                      <span className="text-default-400">
                        资源 {course.resource_count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-default-400">该学院暂无课程</p>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
