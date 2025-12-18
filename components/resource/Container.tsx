'use client'

import { useEffect, useState } from 'react'
import { kunFetchGet } from '~/utils/kunFetch'
import { ResourceCard } from './ResourceCard'
import { FilterBar } from './FilterBar'
import { useMounted } from '~/hooks/useMounted'
import { KunLoading } from '~/components/kun/Loading'
import { KunHeader } from '../kun/Header'
import { useSearchParams } from 'next/navigation'
import { KunPagination } from '~/components/kun/Pagination'
import type { SortDirection, SortOption } from './_sort'
import type { PatchResource } from '~/types/api/resource'

interface Props {
  initialResources: PatchResource[]
  initialTotal: number
}

export const CardContainer = ({ initialResources, initialTotal }: Props) => {
  const [resources, setResources] = useState<PatchResource[]>(initialResources)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<SortOption>('created')
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc')
  const isMounted = useMounted()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const fetchData = async () => {
    setLoading(true)

    const { resources, total: newTotal } = await kunFetchGet<{
      resources: PatchResource[]
      total: number
    }>('/resource', {
      sortField,
      sortOrder,
      page,
      limit: 10
    })

    setResources(resources)
    setTotal(newTotal)
    setLoading(false)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }
    fetchData()
  }, [sortField, sortOrder, page])

  return (
    <div className="container mx-auto my-4 space-y-6">
      <KunHeader
        name="课程资源库"
        description="集中展示所有课程的最新资料、课件与外部链接。点击任意卡片即可进入对应课程。"
      />

      <FilterBar
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      {loading ? (
        <KunLoading hint="正在获取资源数据..." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      {total > 10 && (
        <div className="flex justify-center">
          <KunPagination
            total={Math.ceil(total / 10)}
            page={page}
            onPageChange={setPage}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}
