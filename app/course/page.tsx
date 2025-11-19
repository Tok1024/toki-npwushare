import { prisma } from '~/prisma'
import { KunHeader } from '~/components/kun/Header'
import { CourseCard } from '~/components/home/course/CourseCard'
import { Button } from '@heroui/button'

interface Props {
  searchParams?: Promise<{ q?: string }>
}

export const revalidate = 30

export default async function CourseIndexPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {}
  const keyword = params.q?.trim()

  const courses = await prisma.course.findMany({
    where: keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { department: { name: { contains: keyword, mode: 'insensitive' } } }
          ]
        }
      : undefined,
    include: { department: true },
    orderBy: { created: 'desc' }
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-10">
      <KunHeader
        name="浏览课程"
        description="集中浏览每个学院开设的课程，进入详情页即可查看资源、经验和评价。"
      />

      <form className="flex gap-2" action="/course">
        <input
          type="text"
          name="q"
          placeholder="搜索课程或学院名称"
          defaultValue={keyword || ''}
          className="w-full rounded-large border border-content2/60 bg-content1/60 px-4 py-2 text-sm"
        />
        <Button color="primary" type="submit">
          搜索
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            c={{
              id: course.id,
              name: course.name,
              slug: course.slug,
              deptSlug: course.department.slug,
              tags: course.tags,
              heartCount: course.heart_count,
              difficultyAvg: course.difficulty_avg,
              difficultyVotes: course.difficulty_votes,
              resourceCount: course.resource_count,
              postCount: course.post_count
            }}
          />
        ))}
        {courses.length === 0 && (
          <p className="text-default-400">
            未找到匹配的课程，可以尝试其它关键词。
          </p>
        )}
      </div>
    </div>
  )
}
