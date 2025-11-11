"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { ChevronRight } from 'lucide-react'

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
          console.error('Failed to fetch resource list', response.status)
          return
        }
        const res: ApiResp = await response.json()
        setItems(res.list.slice(0, 6))
      } catch (error) {
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

      <div className="grid grid-cols-1 gap-2 sm:gap-6 md:grid-cols-2">
        {items.map((r) => (
          <Card
            key={r.id}
            isPressable
            as={Link}
            href={`/course/${r.deptSlug}/${r.courseSlug}`}
            className="w-full"
          >
            <CardBody className="space-y-1">
              <div className="text-tiny text-default-500">{r.courseName}</div>
              <h3 className="font-medium line-clamp-2">{r.title}</h3>
              <div className="text-tiny text-default-500">
                {r.type} · {r.teacherName ?? '未标注教师'}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  )
}
