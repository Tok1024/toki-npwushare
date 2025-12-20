import { useState, useEffect, useCallback } from 'react'
import { useMounted } from '~/hooks/useMounted'
import { calculateTotalPages } from '~/utils/pagination'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

export interface UsePaginatedDataOptions<T> {
  /**
   * 数据获取函数
   * @param page 当前页码
   * @param limit 每页数量
   * @returns Promise包含数据和总数
   */
  fetchFn: (page: number, limit: number) => Promise<PaginatedResponse<T>>

  /**
   * 初始数据
   */
  initialData?: T[]

  /**
   * 初始总数
   */
  initialTotal?: number

  /**
   * 每页数量
   */
  limit: number

  /**
   * 额外的依赖项，变化时重新获取数据
   */
  dependencies?: any[]
}

export interface UsePaginatedDataReturn<T> {
  /** 当前页数据 */
  data: T[]
  /** 总记录数 */
  total: number
  /** 总页数 */
  totalPages: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  limit: number
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 设置页码 */
  setPage: (page: number) => void
  /** 重新获取数据 */
  refetch: () => Promise<void>
}

/**
 * 通用分页数据Hook
 * 用于统一管理分页列表的数据获取、状态管理
 */
export function usePaginatedData<T = any>(
  options: UsePaginatedDataOptions<T>
): UsePaginatedDataReturn<T> {
  const {
    fetchFn,
    initialData = [],
    initialTotal = 0,
    limit,
    dependencies = []
  } = options

  const [data, setData] = useState<T[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isMounted = useMounted()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchFn(page, limit)

      // 只有在组件仍然挂载时才更新状态
      if (isMounted) {
        setData(response.data)
        setTotal(response.total)
      }
    } catch (err) {
      if (isMounted) {
        const errorMessage = err instanceof Error ? err.message : '获取数据失败'
        setError(errorMessage)
        console.error('Failed to fetch paginated data:', err)
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [page, limit, isMounted, fetchFn])

  // 当页码或依赖项变化时重新获取数据
  useEffect(() => {
    if (!isMounted) return
    fetchData()
  }, [page, ...dependencies])

  const totalPages = calculateTotalPages(total, limit)

  return {
    data,
    total,
    totalPages,
    page,
    limit,
    loading,
    error,
    setPage,
    refetch: fetchData
  }
}
