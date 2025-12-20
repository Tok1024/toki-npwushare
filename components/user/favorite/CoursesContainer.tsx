'use client'

import { useCallback, useState } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Pagination } from '@heroui/pagination'
import Link from 'next/link'
import { BookOpen, Heart } from 'lucide-react'

interface CourseFavorite {
  id: number
  name: string
  description: string
  code: string
  slug: string
  cover_url: string
  instructor_name: string
  tags: string[]
  resource_count: number
  post_count: number
  heart_count: number
  difficulty_avg: number
  department: {
    id: number
    name: string
    slug: string
  }
  created: string
}

interface FavoritesContainerProps {
  initialData: CourseFavorite[]
  initialTotal: number
  initialPage: number
  userId: number
  currentUserUid: number
}

export const UserFavoritesContainer = ({
  initialData,
  initialTotal,
  initialPage,
  userId,
  currentUserUid
}: FavoritesContainerProps) => {
  const [page, setPage] = useState(initialPage)
  const [courses, setCourses] = useState(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [isLoading, setIsLoading] = useState(false)

  const handlePageChange = useCallback(async (newPage: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/user/favorite/list?userId=${userId}&page=${newPage}&limit=10`
      )
      const result = await response.json()
      if (result.data) {
        setCourses(result.data)
        setTotal(result.total)
        setPage(newPage)
      }
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  if (courses.length === 0 && total === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <Heart className="mx-auto mb-4 size-8 text-default-300" />
          <p className="text-default-500">还没有收藏任何课程</p>
          <Button
            as={Link}
            href="/course"
            color="primary"
            className="mt-4 w-fit mx-auto"
          >
            去浏览课程
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col items-start px-4 py-3">
              <div className="flex items-start justify-between w-full gap-2">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/course/${course.department.slug}/${course.slug}`}
                    className="text-base font-semibold line-clamp-2 text-primary hover:underline"
                  >
                    {course.name}
                  </Link>
                  <p className="text-xs text-default-500 mt-1">
                    {course.department.name}
                  </p>
                </div>
                <Heart className="size-5 text-danger flex-shrink-0 mt-1" />
              </div>
            </CardHeader>
            <CardBody className="gap-3 px-4 py-3">
              {course.description && (
                <p className="text-sm text-default-600 line-clamp-2">
                  {course.description}
                </p>
              )}
              <div className="flex items-center gap-3 flex-wrap text-xs text-default-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-4" />
                  {course.resource_count} 资源
                </span>
                {course.heart_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Heart className="size-4" />
                    {course.heart_count} 赞
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {total > 10 && (
        <div className="flex justify-center mt-6">
          <Pagination
            isCompact
            showControls
            total={Math.ceil(total / 10)}
            initialPage={page}
            onChange={handlePageChange}
            isDisabled={isLoading}
          />
        </div>
      )}
    </div>
  )
}
