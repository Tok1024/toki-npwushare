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
    <div className="container mx-auto space-y-8 py-10">
      <KunHeader
        name="学院目录"
        description="按学院浏览课程，快速定位你所在院系的资料与经验分享。"
      />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card
            key={dept.slug}
            className="border border-default-100 shadow-sm hover:shadow-md transition-all bg-white/50 backdrop-blur-sm"
          >
            <CardBody className="space-y-4 p-5">
              <div className="flex items-center justify-between pb-2 border-b border-default-100">
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                    {dept.slug}
                  </p>
                  <h2 className="text-lg font-bold text-slate-800 mt-0.5">
                    {dept.name}
                  </h2>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-slate-700 leading-none">
                    {dept._count.courses}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">课程</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {dept.courses.length ? (
                  dept.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between text-sm group"
                    >
                      <Link
                        className="text-slate-600 group-hover:text-blue-600 transition-colors truncate max-w-[70%]"
                        href={`/course/${dept.slug}/${course.slug}`}
                        title={course.name}
                      >
                        {course.name}
                      </Link>
                      <span className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        {course.resource_count} 资源
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic py-2">
                    该学院暂无热门课程
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
