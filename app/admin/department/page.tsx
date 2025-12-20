"use client"

import { useEffect, useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Input } from '@heroui/input'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal'
import { Textarea } from '@heroui/input'
import Link from 'next/link'
import toast from 'react-hot-toast'

type DepartmentItem = {
  id: number
  slug: string
  code: string | null
  name: string
  description: string | null
  created: string
  _count: {
    courses: number
  }
}

export default function AdminDepartmentPage() {
  const [items, setItems] = useState<DepartmentItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const pageSize = 20

  const [editingItem, setEditingItem] = useState<DepartmentItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const fetchList = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) qs.set('search', search)
      const res = await fetch(`/api/admin/department?${qs.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (data && Array.isArray(data.list)) {
        setItems(data.list)
        setTotal(data.total || 0)
      } else if (typeof data === 'string') {
        toast.error(data)
      }
    } catch (e) {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleSearch = () => {
    setPage(1)
    fetchList()
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setIsCreating(true)
    onOpen()
  }

  const openEditModal = (item: DepartmentItem) => {
    setEditingItem(item)
    setIsCreating(false)
    onOpen()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const body = {
      ...(editingItem ? { id: editingItem.id } : {}),
      slug: formData.get('slug') as string,
      code: (formData.get('code') as string) || null,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null
    }

    try {
      const res = await fetch('/api/admin/department', {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data === 'string') {
        return toast.error(typeof data === 'string' ? data : isCreating ? '创建失败' : '更新失败')
      }
      toast.success(isCreating ? '创建成功' : '更新成功')
      onClose()
      fetchList()
    } catch {
      toast.error('请求失败')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除学院"${name}"吗？如果该学院下有课程，将无法删除。`)) return

    try {
      const res = await fetch(`/api/admin/department?id=${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data === 'string') {
        return toast.error(typeof data === 'string' ? data : '删除失败')
      }
      toast.success('已删除')
      fetchList()
    } catch {
      toast.error('请求失败')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">学院管理</h1>
        <Button color="primary" onPress={openCreateModal}>
          创建学院
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="搜索学院名称、代码或 slug"
          value={search}
          onValueChange={setSearch}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button color="primary" onPress={handleSearch}>
          搜索
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} shadow="sm">
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium text-lg">{item.name}</div>
                  {item.code && <Chip size="sm" variant="flat">{item.code}</Chip>}
                  <Chip size="sm" variant="flat" color="secondary">slug: {item.slug}</Chip>
                </div>

                {item.description && (
                  <div className="text-sm text-default-600 line-clamp-2">{item.description}</div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-sm text-default-500">课程数：{item._count.courses}</span>
                  <Link
                    className="text-primary text-sm hover:underline"
                    href={`/department/${item.slug}`}
                    target="_blank"
                  >
                    查看学院页面
                  </Link>
                  <span className="text-xs text-default-400">
                    创建于 {new Date(item.created).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" color="primary" variant="flat" onPress={() => openEditModal(item)}>
                  编辑
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => handleDelete(item.id, item.name)}
                  isDisabled={item._count.courses > 0}
                >
                  删除
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center text-default-500 py-8">暂无学院数据</div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button isDisabled={page <= 1 || loading} onPress={() => setPage((p) => p - 1)}>
          上一页
        </Button>
        <div className="text-sm text-default-500">
          第 {page} 页 · 共 {Math.ceil(total / pageSize) || 1} 页 · 总计 {total} 条
        </div>
        <Button isDisabled={page * pageSize >= total || loading} onPress={() => setPage((p) => p + 1)}>
          下一页
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                {isCreating ? '创建学院' : `编辑学院：${editingItem?.name}`}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Slug（URL 标识符）"
                  name="slug"
                  defaultValue={editingItem?.slug || ''}
                  isRequired
                  maxLength={128}
                  description="用于 URL，如：computer-science"
                />
                <Input
                  label="学院代码（可选）"
                  name="code"
                  defaultValue={editingItem?.code || ''}
                  maxLength={64}
                  description="如：CS, EE, MATH"
                />
                <Input
                  label="学院名称"
                  name="name"
                  defaultValue={editingItem?.name || ''}
                  isRequired
                  maxLength={255}
                />
                <Textarea
                  label="学院描述（可选）"
                  name="description"
                  defaultValue={editingItem?.description || ''}
                  maxLength={1000}
                  rows={4}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button color="primary" type="submit">
                  {isCreating ? '创建' : '保存'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
