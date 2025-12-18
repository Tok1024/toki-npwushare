import Link from 'next/link'
import { prisma } from '~/prisma'
import { KunHeader } from '~/components/kun/Header'
import { CourseContainer } from '~/components/home/course/CourseContainer'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'

interface Props {
  searchParams?: Promise<{ q?: string; sort?: string; page?: string }>
}

type CourseSort = 'latest' | 'popular' | 'difficulty'

export const revalidate = 30

export default async function CourseIndexPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {}
  const keyword = params.q?.trim()
  const rawSort = params.sort
  const sort: CourseSort = //把排序方式写进路径参数里
    rawSort === 'popular' || rawSort === 'difficulty' ? rawSort : 'latest'
  const hasResource = params.hasResource === '1'
  const page = Number(params.page) || 1
  const limit = 9
  const offset = (page - 1) * limit

  const orderBy =
    sort === 'popular'
      ? { heart_count: 'desc' as const }
      : sort === 'difficulty'
        ? { difficulty_avg: 'desc' as const }
        : { created: 'desc' as const }

  const where = {
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { department: { name: { contains: keyword, mode: 'insensitive' } } }
          ]
        }
      : {}),
    ...(hasResource ? { resource_count: { gt: 0 } } : {})
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { department: true },
      orderBy,
      take: limit,
      skip: offset
    }),
    prisma.course.count({ where })
  ])

  // 修改url参数
  const buildSortHref = (nextSort: CourseSort) => {
    const sp = new URLSearchParams()
    if (keyword) sp.set('q', keyword)
    if (nextSort !== 'latest') sp.set('sort', nextSort)
    if (hasResource) sp.set('hasResource', '1')
    const qs = sp.toString()
    return qs ? `/course?${qs}` : '/course'
  }

  const buildHasResourceHref = (nextHasResource: boolean) => {
    const sp = new URLSearchParams()
    if (keyword) sp.set('q', keyword)
    if (sort !== 'latest') sp.set('sort', sort)
    if (nextHasResource) sp.set('hasResource', '1')
    const qs = sp.toString()
    return qs ? `/course?${qs}` : '/course'
  }

  const buildPageHref = (nextPage: number) => {
    const sp = new URLSearchParams()
    if (keyword) sp.set('q', keyword)
    if (sort !== 'latest') sp.set('sort', sort)
    if (hasResource) sp.set('hasResource', '1')
    if (nextPage > 1) sp.set('page', String(nextPage))
    const qs = sp.toString()
    return qs ? `/course?${qs}` : '/course'
  }

  return (
    <div className="container mx-auto space-y-8 py-10">
      <KunHeader
        name="浏览课程"
        description="集中浏览每个学院开设的课程，进入详情页即可查看资源、经验和评价。"
      />

      <Card className="border-none bg-white/70 shadow-sm backdrop-blur-sm">
        <CardBody className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form className="flex flex-1 gap-2" action="/course">
              <input
                type="text"
                name="q"
                placeholder="搜索课程或学院名称"
                defaultValue={keyword || ''}
                className="w-full rounded-large border border-default-200 bg-default-50/70 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
              <Button color="primary" type="submit">
                搜索
              </Button>
            </form>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="inline-flex rounded-full bg-default-50 px-2 py-1 text-[11px] text-default-500 sm:text-xs">
                共 {total} 门课程
              </div>
              <div className="inline-flex rounded-full bg-default-50 p-1 text-[11px] text-default-600 sm:text-xs">
                <Button
                  as={Link}
                  href={buildSortHref('latest')}
                  size="sm"
                  variant={sort === 'latest' ? 'solid' : 'light'}
                  className="h-7 px-2"
                >
                  最新
                </Button>
                <Button
                  as={Link}
                  href={buildSortHref('popular')}
                  size="sm"
                  variant={sort === 'popular' ? 'solid' : 'light'}
                  className="h-7 px-2"
                >
                  最热
                </Button>
                <Button
                  as={Link}
                  href={buildSortHref('difficulty')}
                  size="sm"
                  variant={sort === 'difficulty' ? 'solid' : 'light'}
                  className="h-7 px-2"
                >
                  难度
                </Button>
                <Button
                  as={Link}
                  href={buildHasResourceHref(true)}
                  size="sm"
                  variant={hasResource ? 'solid' : 'light'}
                  className="h-7 px-2"
                >
                  只看有资源
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <CourseContainer
        courses={courses.map((course) => ({
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
        }))}
        total={total}
        page={page}
        limit={limit}
        keyword={keyword}
        sort={sort}
        hasResource={hasResource}
      />
    </div>
  )
}
