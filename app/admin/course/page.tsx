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

type CourseItem = {
  id: number
  slug: string
  code: string | null
  name: string
  description: string | null
  instructor_name: string | null
  cover_url: string | null
  tags: string[]
  resource_count: number
  post_count: number
  heart_count: number
  created: string
  department: { id: number; slug: string; name: string }
}

export default function AdminCoursePage() {
  const [items, setItems] = useState<CourseItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const pageSize = 20

  const [editingItem, setEditingItem] = useState<CourseItem | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const fetchList = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) qs.set('search', search)
      const res = await fetch(`/api/admin/course?${qs.toString()}`, { cache: 'no-store' })
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

  const openEditModal = (item: CourseItem) => {
    setEditingItem(item)
    onOpen()
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem) return

    const formData = new FormData(e.currentTarget)
    const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)

    try {
      const res = await fetch('/api/admin/course', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          name: formData.get('name'),
          description: formData.get('description') || null,
          instructor_name: formData.get('instructor_name') || null,
          cover_url: formData.get('cover_url') || null,
          tags
        })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data === 'string') {
        return toast.error(typeof data === 'string' ? data : '更新失败')
      }
      toast.success('已更新')
      onClose()
      fetchList()
    } catch {
      toast.error('请求失败')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除课程"${name}"吗？此操作将删除关联的所有资源和帖子！`)) return

    try {
      const res = await fetch(`/api/admin/course?id=${id}`, { method: 'DELETE' })
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
        <h1 className="text-2xl font-semibold">课程信息维护</h1>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="搜索课程名称、代码或教师"
          value={search}
          onValueChange={setSearch}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button color="primary" onPress={handleSearch}>搜索</Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} shadow="sm">
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium text-lg">{item.name}</div>
                  {item.code && <Chip size="sm" variant="flat">{item.code}</Chip>}
                  <Chip size="sm" variant="flat" color="primary">{item.department.name}</Chip>
                </div>

                {item.description && (
                  <div className="text-sm text-default-600 line-clamp-2">{item.description}</div>
                )}

                <div className="flex items-center gap-3 text-sm text-default-500">
                  {item.instructor_name && <span>教师：{item.instructor_name}</span>}
                  <span>资源：{item.resource_count}</span>
                  <span>帖子：{item.post_count}</span>
                  <span>收藏：{item.heart_count}</span>
                </div>

                {item.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="dot">{tag}</Chip>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Link
                    className="text-primary text-sm hover:underline"
                    href={`/course/${item.department.slug}/${item.slug}`}
                    target="_blank"
                  >
                    查看课程页面
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
                >
                  删除
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center text-default-500 py-8">暂无课程数据</div>
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

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleUpdate}>
              <ModalHeader className="flex flex-col gap-1">
                编辑课程：{editingItem?.name}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="课程名称"
                  name="name"
                  defaultValue={editingItem?.name}
                  isRequired
                  maxLength={255}
                />
                <Textarea
                  label="课程描述"
                  name="description"
                  defaultValue={editingItem?.description || ''}
                  maxLength={1000}
                  rows={4}
                />
                <Input
                  label="任课教师"
                  name="instructor_name"
                  defaultValue={editingItem?.instructor_name || ''}
                  maxLength={255}
                />
                <Input
                  label="封面图片 URL"
                  name="cover_url"
                  type="url"
                  defaultValue={editingItem?.cover_url || ''}
                  maxLength={512}
                />
                <Input
                  label="标签（用逗号分隔）"
                  name="tags"
                  defaultValue={editingItem?.tags.join(', ')}
                  placeholder="例如：数学, 必修, 大一"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button color="primary" type="submit">
                  保存
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
