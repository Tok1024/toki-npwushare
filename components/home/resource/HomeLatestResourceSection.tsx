'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { ChevronRight, FileText } from 'lucide-react'

type Item = {
  id: number
  title: string
  type: string
  created: string
  courseName: string
  courseSlug: string
  deptSlug: string
  teacherName: string | null
}

type ApiResp = { total: number; page: number; pageSize: number; list: Item[] }

export const HomeLatestResourceSection = () => {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const base =
          process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV ??
          window.location.origin
        const response = await fetch(`${base}/api/resource/latest`, {
          cache: 'no-store'
        })
        if (!response.ok) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch resource list', response.status)
          return
        }
        const res: ApiResp = await response.json()
        setItems(res.list.slice(0, 6))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch resource list', error)
      }
    }
    run()
  }, [])

  return (
    <section className="space-y-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold sm:text-2xl">最新课程资源</h2>
        <Button
          variant="light"
          as={Link}
          color="primary"
          endContent={<ChevronRight className="size-4" />}
          href="/resource"
        >
          查看更多
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {items.map((r) => (
          <Card
            key={r.id}
            isPressable
            as={Link}
            href={`/course/${r.deptSlug}/${r.courseSlug}`}
            className="w-full border border-default-100 shadow-sm hover:shadow-md transition-all bg-white/50 backdrop-blur-sm group"
          >
            <CardBody className="p-4 flex flex-row items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors">
                <FileText className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {r.courseName}
                  </span>
                  <span>•</span>
                  <span>{r.teacherName ?? '教师未知'}</span>
                </div>
                <h3 className="font-semibold text-slate-800 truncate">
                  {r.title}
                </h3>
                <div className="text-xs text-slate-400">{r.type}</div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  )
}
