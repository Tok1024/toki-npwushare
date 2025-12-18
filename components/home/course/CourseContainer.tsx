'use client'

import Link from 'next/link'
import { CourseCard } from './CourseCard'
import { KunPagination } from '~/components/kun/Pagination'

interface Course {
  id: number
  name: string
  slug: string
  deptSlug: string
  tags: string[]
  heartCount: number
  difficultyAvg: number
  difficultyVotes: number
  resourceCount: number
  postCount: number
}

interface Props {
  courses: Course[]
  total: number
  page: number
  limit: number
  keyword?: string
  sort?: string
  hasResource?: boolean
}

export const CourseContainer = ({ courses, total, page, limit, keyword, sort, hasResource }: Props) => {
  const buildPageHref = (nextPage: number) => {
    const sp = new URLSearchParams()
    if (keyword) sp.set('q', keyword)
    if (sort && sort !== 'latest') sp.set('sort', sort)
    if (hasResource) sp.set('hasResource', '1')
    if (nextPage > 1) sp.set('page', String(nextPage))
    const qs = sp.toString()
    return qs ? `/course?${qs}` : '/course'
  }

  return (
    <>
      <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} c={course} />
        ))}
        {courses.length === 0 && (
          <p className="py-10 text-center text-default-400 col-span-full">
            未找到匹配的课程，可以尝试其它关键词。
          </p>
        )}
      </div>
      {total > limit && (
        <div className="flex justify-center">
          <KunPagination
            total={Math.ceil(total / limit)}
            page={page}
            onPageChange={(nextPage) => {
              window.location.href = buildPageHref(nextPage)
            }}
          />
        </div>
      )}
    </>
  )
}
