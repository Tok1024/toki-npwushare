'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { kunFetchGet } from '~/utils/kunFetch'
import { PostList as SharedPostList, type PostListItem } from '../post/PostList'

type ApiResp = {
  total: number
  page: number
  pageSize: number
  list: {
    id: number
    title: string
    created: string
    status: string
    author: { id: number; name: string; avatar: string | null } | null
  }[]
}

export const PostList = ({ dept, slug }: { dept: string; slug: string }) => {
  const [items, setItems] = useState<PostListItem[]>([])

  useEffect(() => {
    const run = async () => {
      const res = await kunFetchGet<ApiResp>(`/course/${dept}/${slug}/posts`)
      if (typeof res === 'string') return
      setItems(
        res.list.map((p) => ({
          id: p.id,
          title: p.title,
          date: p.created,
          href: `/course/${dept}/${slug}/p/${p.id}`,
          authorName: p.author?.name,
          authorAvatar: p.author?.avatar ?? undefined,
          authorId: p.author?.id,
          statusLabel: p.status !== 'published' ? p.status : undefined
        }))
      )
    }
    run()
  }, [dept, slug])

  return <SharedPostList items={items} />
}
