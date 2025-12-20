'use client'

import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { PostMeta } from './PostMeta'

export type PostListItem = {
  id: string | number
  title: string
  href: string
  date?: string
  authorName?: string
  authorAvatar?: string | null
  authorId?: number | string
  statusLabel?: string
}

interface Props {
  items: PostListItem[]
  emptyText?: string
}

export const PostList = ({ items, emptyText = '暂无帖子' }: Props) => {
  if (!items.length) return <div className="text-default-500">{emptyText}</div>

  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item) => (
        <Card key={item.id} isPressable as={Link} href={item.href}>
          <CardBody className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="font-medium line-clamp-2 text-default-900">
                {item.title}
              </div>
              {(item.authorName || item.date || item.statusLabel) && (
                <PostMeta
                  authorName={item.authorName}
                  authorAvatar={item.authorAvatar ?? undefined}
                  authorId={item.authorId}
                  created={item.date}
                  statusLabel={item.statusLabel}
                />
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
