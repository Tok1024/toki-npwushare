"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Tabs, Tab } from '@heroui/tabs'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Item {
  id: number
  title: string
  type: string
  status: 'draft' | 'pending' | 'published' | 'rejected'
  created: string
  links: string[]
  course: { name: string; slug: string; department: { slug: string } }
}

const STATUS_OPTIONS = [
  { key: 'all', name: '全部' },
  { key: 'draft', name: '草稿' },
  { key: 'pending', name: '待审核' },
  { key: 'published', name: '已发布' },
  { key: 'rejected', name: '已驳回' }
] as const

const statusColor: Record<Item['status'], 'default' | 'warning' | 'success' | 'danger'> = {
  draft: 'default',
  pending: 'warning',
  published: 'success',
  rejected: 'danger'
}

export default function UserResourcesPage() {
  const [items, setItems] = useState<Item[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [activeKey, setActiveKey] = useState<(typeof STATUS_OPTIONS)[number]['key']>('all')
  const [loading, setLoading] = useState(false)
  const pageSize = 20

  const queryStatus = useMemo(() => (activeKey === 'all' ? undefined : activeKey), [activeKey])

  const fetchList = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (queryStatus) qs.set('status', String(queryStatus))
      const res = await fetch(`/api/user/resource?${qs.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (data && Array.isArray(data.list)) {
        setItems(data.list)
        setTotal(data.total || 0)
      }
    } catch (e) {
      toast.error('加载失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, queryStatus])

  const mutateStatus = async (id: number, next: 'draft' | 'pending') => {
    try {
      const res = await fetch(`/api/resource/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data === 'string') {
        toast.error(typeof data === 'string' ? data : '更新失败')
        return
      }
      toast.success('状态已更新')
      fetchList()
    } catch (e) {
      toast.error('请求失败')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">我的资源</h1>
      </div>

      <Tabs
        selectedKey={activeKey}
        onSelectionChange={(k) => {
          setActiveKey(k as any)
          setPage(1)
        }}
        radius="full"
        color="primary"
        variant="underlined"
      >
        {STATUS_OPTIONS.map((s) => (
          <Tab key={s.key} title={s.name} />
        ))}
      </Tabs>

      {items.length === 0 && !loading && (
        <div className="text-center text-default-500 py-10">暂无内容</div>
      )}

      <div className="space-y-3">
        {items.map((it) => (
          <Card key={it.id} shadow="sm">
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="font-medium truncate">{it.title}</div>
                  <Chip size="sm" variant="flat" color="default">
                    {it.type}
                  </Chip>
                  <Chip size="sm" variant="flat" color={statusColor[it.status]}>
                    {it.status}
                  </Chip>
                </div>
                <div className="text-sm text-default-500">
                  {new Date(it.created).toLocaleString()}
                </div>
                <div className="text-sm text-default-500 truncate">
                  {it.links.join(', ')}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {it.status === 'draft' && (
                  <Button size="sm" color="primary" onPress={() => mutateStatus(it.id, 'pending')}>
                    提交审核
                  </Button>
                )}
                {it.status === 'pending' && (
                  <Button size="sm" variant="flat" onPress={() => mutateStatus(it.id, 'draft')}>
                    转为草稿
                  </Button>
                )}
                <Link
                  href={`/course/${it.course.department.slug}/${it.course.slug}`}
                  className="text-primary text-sm"
                >
                  前往课程
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button isDisabled={page <= 1 || loading} onPress={() => setPage((p) => p - 1)}>
          上一页
        </Button>
        <div className="text-sm text-default-500">
          第 {page} 页 · 共 {Math.ceil(total / pageSize) || 1} 页
        </div>
        <Button
          isDisabled={page * pageSize >= total || loading}
          onPress={() => setPage((p) => p + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  )
}
