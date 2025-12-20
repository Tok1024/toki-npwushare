'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { kunFetchGet } from '~/utils/kunFetch'
import { ReportButton } from './ReportButton'

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
        <Card key={r.id}>
          <CardBody className="flex items-center justify-between gap-4">
            <Link
              href={`/course/${dept}/${slug}/r/${r.id}`}
              className="flex-1 space-y-1 hover:opacity-80 transition-opacity"
            >
              <div className="text-tiny text-default-500">{r.type}</div>
              <div className="font-medium line-clamp-2">{r.title}</div>
              <div className="text-tiny text-default-400">
                {new Date(r.created).toLocaleDateString()}
              </div>
            </Link>
            <ReportButton resourceId={r.id} resourceTitle={r.title} />
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
