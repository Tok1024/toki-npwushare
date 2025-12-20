"use client"

import { useEffect, useMemo, useState } from 'react'
import { Tabs, Tab } from '@heroui/tabs'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal'
import { Textarea } from '@heroui/input'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Resource = {
  id: number
  title: string
  type: string
  status: 'draft' | 'pending' | 'published' | 'rejected'
  created: string
  links: string[]
  author: { id: number; name: string }
  course: { id: number; name: string; slug: string; department: { slug: string } }
}

type Report = {
  id: number
  type: string
  content: string
  status: number
  link: string
  created: string
  sender: {
    id: number
    name: string
    avatar: string
  } | null
}

const STATUS_OPTIONS = [
  { key: 'all', name: '全部' },
  { key: 'draft', name: '草稿' },
  { key: 'pending', name: '待审核' },
  { key: 'published', name: '已发布' },
  { key: 'rejected', name: '已驳回' }
] as const

const statusColor: Record<Resource['status'], 'default' | 'warning' | 'success' | 'danger'> = {
  draft: 'default',
  pending: 'warning',
  published: 'success',
  rejected: 'danger'
}

const REPORT_STATUS_LABELS: Record<number, { label: string; color: 'default' | 'success' | 'warning' | 'danger' }> = {
  0: { label: '待处理', color: 'warning' },
  1: { label: '已处理', color: 'success' }
}

export default function AdminResourcePage() {
  const [mainTab, setMainTab] = useState<string>('resources')

  // 资源管理状态
  const [resources, setResources] = useState<Resource[]>([])
  const [resourcePage, setResourcePage] = useState(1)
  const [resourceTotal, setResourceTotal] = useState(0)
  const [statusTab, setStatusTab] = useState<(typeof STATUS_OPTIONS)[number]['key']>('published')
  const [resourceLoading, setResourceLoading] = useState(false)

  // 举报管理状态
  const [reports, setReports] = useState<Report[]>([])
  const [reportPage, setReportPage] = useState(1)
  const [reportTotal, setReportTotal] = useState(0)
  const [reportLoading, setReportLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const pageSize = 20
  const queryStatus = useMemo(() => (statusTab === 'all' ? undefined : statusTab), [statusTab])

  // 加载资源列表
  const fetchResources = async () => {
    setResourceLoading(true)
    try {
      const qs = new URLSearchParams({ page: String(resourcePage), pageSize: String(pageSize) })
      if (queryStatus) qs.set('status', String(queryStatus))
      const res = await fetch(`/api/admin/resource?${qs.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (data && Array.isArray(data.list)) {
        setResources(data.list)
        setResourceTotal(data.total || 0)
      } else if (typeof data === 'string') {
        toast.error(data)
      }
    } catch (e) {
      toast.error('加载失败')
    } finally {
      setResourceLoading(false)
    }
  }

  // 加载举报列表
  const fetchReports = async () => {
    setReportLoading(true)
    try {
      const res = await fetch(`/api/admin/report?page=${reportPage}&limit=${pageSize}`, {
        cache: 'no-store'
      })
      const data = await res.json()
      if (typeof data === 'string') {
        toast.error(data)
      } else {
        setReports(data.reports)
        setReportTotal(data.total)
      }
    } catch (e) {
      toast.error('加载失败')
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    if (mainTab === 'resources') {
      fetchResources()
    } else if (mainTab === 'reports') {
      fetchReports()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab, resourcePage, reportPage, queryStatus])

  // 更新资源状态
  const setResourceStatus = async (id: number, status: Resource['status']) => {
    try {
      const res = await fetch('/api/admin/resource', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data === 'string') return toast.error(typeof data === 'string' ? data : '更新失败')
      toast.success('已更新')
      fetchResources()
    } catch {
      toast.error('请求失败')
    }
  }

  // 删除资源
  const deleteResource = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/resource?id=${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data === 'string') return toast.error(typeof data === 'string' ? data : '删除失败')
      toast.success('已删除')
      fetchResources()
    } catch {
      toast.error('请求失败')
    }
  }

  // 处理举报
  const handleReport = (report: Report) => {
    setSelectedReport(report)
    setReplyContent('')
    onOpen()
  }

  const submitHandle = async () => {
    if (!selectedReport) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/report/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedReport.id,
          content: replyContent.trim()
        })
      })
      const data = await res.json()
      if (typeof data === 'string') {
        toast.error(data)
      } else {
        toast.success('举报已处理')
        onClose()
        fetchReports()
      }
    } catch (e) {
      toast.error('处理失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">资源与举报管理</h1>

        <Tabs
          selectedKey={mainTab}
          onSelectionChange={(k) => setMainTab(String(k))}
          color="primary"
          variant="underlined"
        >
          {/* 资源管理 Tab */}
          <Tab key="resources" title="资源管理">
            <div className="space-y-4 pt-4">
              <Tabs
                selectedKey={statusTab}
                onSelectionChange={(k) => {
                  setStatusTab(k as any)
                  setResourcePage(1)
                }}
                size="sm"
                radius="full"
                color="primary"
                variant="light"
              >
                {STATUS_OPTIONS.map((s) => (
                  <Tab key={s.key} title={s.name} />
                ))}
              </Tabs>

              <div className="w-full space-y-3">
                {resources.map((it) => (
                  <Card key={it.id} shadow="sm" className="w-full">
                    <CardBody className="p-4">
                      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 120px', gap: '1rem' }}>
                        <div className="space-y-2" style={{ minWidth: 0 }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-medium">{it.title}</div>
                            <Chip size="sm" variant="flat">{it.type}</Chip>
                            <Chip size="sm" variant="flat" color={statusColor[it.status]}>
                              {it.status}
                            </Chip>
                          </div>
                          <div className="text-sm text-default-500">
                            由 {it.author?.name ?? '未知'} 提交 · {new Date(it.created).toLocaleString()}
                          </div>
                          <div className="text-sm text-default-500 line-clamp-1" title={it.links.join(', ')}>
                            链接：{it.links.join(', ') || '无'}
                          </div>
                          <Link
                            className="text-primary text-sm hover:underline inline-block"
                            href={`/course/${it.course.department.slug}/${it.course.slug}`}
                            target="_blank"
                          >
                            前往课程：{it.course.name}
                          </Link>
                        </div>

                        <div className="flex flex-col items-start gap-2" style={{ width: '120px' }}>
                          <Button size="sm" variant="flat" onPress={() => setResourceStatus(it.id, 'draft')} className="w-full">
                            草稿
                          </Button>
                          <Button size="sm" onPress={() => setResourceStatus(it.id, 'pending')} className="w-full">
                            待审
                          </Button>
                          <Button size="sm" color="primary" onPress={() => setResourceStatus(it.id, 'published')} className="w-full">
                            发布
                          </Button>
                          <Button size="sm" color="warning" onPress={() => setResourceStatus(it.id, 'rejected')} className="w-full">
                            驳回
                          </Button>
                          <Button size="sm" color="danger" onPress={() => deleteResource(it.id)} className="w-full">
                            删除
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {resources.length === 0 && !resourceLoading && (
                <div className="text-center text-default-500 py-8">暂无数据</div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button isDisabled={resourcePage <= 1 || resourceLoading} onPress={() => setResourcePage((p) => p - 1)}>
                  上一页
                </Button>
                <div className="text-sm text-default-500">
                  第 {resourcePage} 页 · 共 {Math.ceil(resourceTotal / pageSize) || 1} 页
                </div>
                <Button isDisabled={resourcePage * pageSize >= resourceTotal || resourceLoading} onPress={() => setResourcePage((p) => p + 1)}>
                  下一页
                </Button>
              </div>
            </div>
          </Tab>

          {/* 举报列表 Tab */}
          <Tab key="reports" title="举报列表">
            <div className="space-y-4 pt-4">
              <div className="w-full space-y-3">
                {reports.map((report) => (
                  <Card key={report.id} shadow="sm" className="w-full">
                    <CardBody className="p-4">
                      <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 120px' }}>
                        <div className="space-y-2" style={{ minWidth: 0 }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Chip size="sm" variant="flat" color={REPORT_STATUS_LABELS[report.status]?.color || 'default'}>
                              {REPORT_STATUS_LABELS[report.status]?.label || '未知'}
                            </Chip>
                            <span className="text-sm text-default-500">
                              {new Date(report.created).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-sm text-default-500">
                            举报人：{report.sender?.name || '未知用户'}
                          </div>

                          <div className="text-sm whitespace-pre-wrap break-words">
                            {report.content}
                          </div>

                          {report.link && (
                            <Link
                              className="text-primary text-sm hover:underline inline-block"
                              href={report.link}
                              target="_blank"
                            >
                              查看被举报资源
                            </Link>
                          )}
                        </div>

                        <div className="flex flex-col items-start gap-2" style={{ width: '120px' }}>
                          {report.status === 0 && (
                            <Button
                              size="sm"
                              color="primary"
                              onPress={() => handleReport(report)}
                              className="w-full"
                            >
                              处理举报
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {reports.length === 0 && !reportLoading && (
                <div className="text-center text-default-500 py-8">暂无举报</div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button isDisabled={reportPage <= 1 || reportLoading} onPress={() => setReportPage((p) => p - 1)}>
                  上一页
                </Button>
                <div className="text-sm text-default-500">
                  第 {reportPage} 页 · 共 {Math.ceil(reportTotal / pageSize) || 1} 页
                </div>
                <Button isDisabled={reportPage * pageSize >= reportTotal || reportLoading} onPress={() => setReportPage((p) => p + 1)}>
                  下一页
                </Button>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* 处理举报对话框 */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">处理举报</ModalHeader>
          <ModalBody>
            {selectedReport && (
              <div className="space-y-4">
                <div className="text-sm">
                  <div className="text-default-500 mb-1">举报内容：</div>
                  <div className="whitespace-pre-wrap break-words bg-default-100 p-3 rounded">
                    {selectedReport.content}
                  </div>
                </div>
                <Textarea
                  label="处理回复（可选）"
                  placeholder="输入对举报人的回复，留空则发送默认消息"
                  value={replyContent}
                  onValueChange={setReplyContent}
                  maxLength={5000}
                  minRows={4}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={submitHandle}
              isLoading={submitting}
              disabled={submitting}
            >
              确认处理
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
