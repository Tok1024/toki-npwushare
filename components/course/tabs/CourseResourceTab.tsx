"use client"

import { useEffect, useState } from 'react'
import { ResourceTabs } from '~/components/patch/resource/Tabs'
import { kunFetchGet } from '~/utils/kunFetch'
import type { PatchResource } from '~/types/api/patch'

type ApiResp = {
  total: number
  page: number
  pageSize: number
  list: {
    id: number
    title: string
    type: string
    created: string
    links?: string[]
    size_bytes?: number | null
    author?: { id: number; name: string; avatar: string; role: number }
  }[]
}

export const CourseResourceTab = ({
  dept,
  slug
}: {
  dept: string
  slug: string
}) => {
  const [resources, setResources] = useState<PatchResource[]>([])

  useEffect(() => {
    const run = async () => {
      const res = await kunFetchGet<ApiResp>(`/course/${dept}/${slug}/resources`, {
        page: 1,
        pageSize: 100
      })
      if (typeof res === 'string') return
      const list: PatchResource[] = res.list.map((r) => ({
        id: r.id,
        name: r.title,
        section: 'galgame',
        uniqueId: `${dept}/${slug}`,
        storage: 'user',
        size: r.size_bytes && r.size_bytes > 0 ? `${(r.size_bytes / (1024*1024)).toFixed(1)} MB` : '',
        type: [r.type],
        language: [],
        note: '',
        hash: '',
        content: (r.links && r.links.length ? r.links.join(',') : ''),
        code: '',
        password: '',
        platform: [],
        likeCount: 0,
        isLike: false,
        status: 1,
        userId: 0,
        patchId: 0,
        created: r.created,
        user: {
          id: r.author?.id ?? 0,
          name: r.author?.name ?? 'Uploader',
          avatar: r.author?.avatar ?? '',
          patchCount: 0,
          role: r.author?.role ?? 1
        }
      }))
      setResources(list)
    }
    run()
  }, [dept, slug])

  return (
    <div className="mt-4">
      <ResourceTabs
        vndbId=""
        resources={resources}
        setEditResource={() => {}}
        onOpenEdit={() => {}}
        onOpenDelete={() => {}}
        setDeleteResourceId={() => {}}
      />
    </div>
  )
}
