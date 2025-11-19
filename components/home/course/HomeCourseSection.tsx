"use client"

import { useEffect, useState } from 'react'
import { Button } from '@heroui/button'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { CourseCard, type SimpleCourse } from './CourseCard'
import { kunFetchGet } from '~/utils/kunFetch'

type ApiResp = { total: number; page: number; pageSize: number; list: SimpleCourse[] }

export const HomeCourseSection = () => {
  const [courses, setCourses] = useState<SimpleCourse[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await kunFetchGet<ApiResp | string>('/course/list', {
          page: 1,
          pageSize: 8
        })
        if (typeof res === 'string') return
        setCourses(res.list.slice(0, 8))
      } catch (error) {
        console.error('Failed to fetch course list', error)
      }
    }
    run()
  }, [])

  return (
    <section className="space-y-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold sm:text-2xl">最新课程</h2>
        <Button
          variant="light"
          as={Link}
          color="primary"
          endContent={<ChevronRight className="size-4" />}
          href="/course"
        >
          查看更多
        </Button>
      </div>

      {courses.length === 0 ? (
        <p className="text-default-400 text-sm">暂无课程，欢迎前往上传页面创建。</p>
      ) : (
        <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} c={course} />
          ))}
        </div>
      )}
    </section>
  )
}
