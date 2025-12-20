'use client'

import { useState, useCallback } from 'react'
import { kunFetchGet } from '~/utils/kunFetch'
import { ResourceCard } from './ResourceCard'
import { FilterBar } from './FilterBar'
import { usePaginatedData } from '~/hooks/usePaginatedData'
import { KunLoading } from '~/components/kun/Loading'
import { KunHeader } from '../kun/Header'
import { useSearchParams } from 'next/navigation'
import { KunPagination } from '~/components/kun/Pagination'
import type { SortDirection, SortOption } from './_sort'
import type { PatchResource } from '~/types/api/resource'

interface Department {
  slug: string
  name: string
}

interface Props {
  initialResources: PatchResource[]
  initialTotal: number
  departments: Department[]
}

export const CardContainer = ({ initialResources, initialTotal, departments }: Props) => {
  const [sortField, setSortField] = useState<SortOption>('created')
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc')
  const [deptSlug, setDeptSlug] = useState<string>('')
  const searchParams = useSearchParams()
  const initialPage = Number(searchParams.get('page')) || 1

  // 使用统一的分页数据Hook
  const {
    data: resources,
    total,
    totalPages,
    page,
    setPage,
    loading
  } = usePaginatedData<PatchResource>({
    fetchFn: useCallback(async (page, limit) => {
      const response = await kunFetchGet<{
        resources: PatchResource[]
        total: number
      }>('/resource', {
        sortField,
        sortOrder,
        page,
        limit,
        ...(deptSlug ? { deptSlug } : {})
      })
      return {
        data: response.resources,
        total: response.total
      }
    }, [sortField, sortOrder, deptSlug]),
    initialData: initialResources,
    initialTotal,
    limit: 10,
    dependencies: [sortField, sortOrder, deptSlug]
  })

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
        deptSlug={deptSlug}
        setDeptSlug={setDeptSlug}
        departments={departments}
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
            total={totalPages}
            page={page}
            onPageChange={setPage}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}
