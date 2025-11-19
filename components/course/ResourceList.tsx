'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { kunFetchGet } from '~/utils/kunFetch'

type Item = {
  id: number
  title: string
  type: string
  created: string
}

type ApiResp = { total: number; page: number; pageSize: number; list: Item[] }

export const ResourceList = ({
  dept,
  slug
}: {
  dept: string
  slug: string
}) => {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    const run = async () => {
      const res = await kunFetchGet<ApiResp>(
        `/course/${dept}/${slug}/resources`
      )
      if (typeof res === 'string') return
      setItems(res.list)
    }
    run()
  }, [dept, slug])

  if (!items.length) return <div className="text-default-500">暂无资源</div>

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((r) => (
        <Card
          key={r.id}
          isPressable
          as={Link}
          href={`/course/${dept}/${slug}/r/${r.id}`}
        >
          <CardBody className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-tiny text-default-500">{r.type}</div>
              <div className="font-medium line-clamp-2">{r.title}</div>
            </div>
            <div className="text-tiny text-default-400">
              {new Date(r.created).toLocaleDateString()}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
