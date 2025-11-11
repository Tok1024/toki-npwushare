"use client"

import { useEffect, useState } from 'react'
import { Button } from '@heroui/button'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { GalgameCard } from '~/components/galgame/Card'
import { kunFetchGet } from '~/utils/kunFetch'

type ApiResp = { total: number; page: number; pageSize: number; list: SimpleCourse[] }

export const HomeCourseSection = () => {
  const [cards, setCards] = useState<GalgameCard[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const base =
          process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV ??
          window.location.origin
        const response = await fetch(`${base}/api/course/list`, {
          cache: 'no-store'
        })
        if (!response.ok) {
          console.error('Failed to fetch course list', response.status)
          return
        }
        const res: ApiResp = await response.json()
        const mapped: GalgameCard[] = res.list.slice(0, 8).map((c) => ({
          id: c.id,
          uniqueId: `course/${c.deptSlug}/${c.slug}`,
          name: c.name,
          banner: c.coverUrl || '/touchgal.avif',
          view: 0,
        download: 0,
        type: ['other'],
        language: [],
        platform: [],
        tags: c.tags || [],
        created: new Date().toISOString(),
        _count: { favorite_folder: 0, resource: c.resourceCount, comment: c.postCount },
        averageRating: c.ratingAvg ?? 0
        }))
        setCards(mapped)
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

      <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((p) => (
          <GalgameCard key={p.id} patch={p} openOnNewTab={false} />
        ))}
      </div>
    </section>
  )
}
