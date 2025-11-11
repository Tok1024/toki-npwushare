"use client"

import { useEffect, useMemo, useState } from 'react'
import { ResourceTabs } from '~/components/patch/resource/Tabs'
import { kunFetchGet, kunFetchPost } from '~/utils/kunFetch'
import type { PatchResource } from '~/types/api/patch'
import { useUserStore } from '~/store/userStore'
import { Button, Input, Textarea, useDisclosure } from '@heroui/react'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal'
import toast from 'react-hot-toast'

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

const RESOURCE_TYPE_OPTIONS = [
  { value: 'note', label: '电子课件' },
  { value: 'slides', label: '课堂 PPT' },
  { value: 'assignment', label: '作业/练习' },
  { value: 'exam', label: '考试资料' },
  { value: 'solution', label: '答案/解析' },
  { value: 'link', label: '参考链接' },
  { value: 'other', label: '其他' }
] as const

const mapResource = (
  dept: string,
  slug: string,
  r: ApiResp['list'][number]
): PatchResource => ({
  id: r.id,
  name: r.title,
  section: 'galgame',
  uniqueId: `${dept}/${slug}`,
  storage: 'user',
  size:
    r.size_bytes && r.size_bytes > 0
      ? `${(r.size_bytes / (1024 * 1024)).toFixed(1)} MB`
      : '',
  type: [r.type],
  language: [],
  note: '',
  hash: '',
  content: r.links && r.links.length ? r.links.join(',') : '',
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
})

export const CourseResourceTab = ({
  dept,
  slug,
  courseId
}: {
  dept: string
  slug: string
  courseId: number
}) => {
  const [resources, setResources] = useState<PatchResource[]>([])
  const { user } = useUserStore((state) => state)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: RESOURCE_TYPE_OPTIONS[0].value,
    links: '',
    term: ''
  })

  const loadResources = useMemo(
    () => async () => {
      const res = await kunFetchGet<ApiResp>(
        `/course/${dept}/${slug}/resources`,
        {
          page: 1,
          pageSize: 100
        }
      )
      if (typeof res === 'string') return
      setResources(res.list.map((item) => mapResource(dept, slug, item)))
    },
    [dept, slug]
  )

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('请输入标题')
      return
    }
    const linkList = form.links
      .split('\n')
      .map((link) => link.trim())
      .filter(Boolean)
    if (!linkList.length) {
      toast.error('至少提供一个链接')
      return
    }

    setSubmitting(true)
    const res = await kunFetchPost<ApiResp['list'][number] | string>(
      `/course/${dept}/${slug}/resources`,
      {
        courseId,
        title: form.title,
        type: form.type,
        links: linkList,
        term: form.term || undefined
      }
    )
    setSubmitting(false)
    if (typeof res === 'string') {
      toast.error(res)
      return
    }

    setResources((prev) => [mapResource(dept, slug, res), ...prev])
    toast.success('上传成功，等待审核')
    setForm({
      title: '',
      type: RESOURCE_TYPE_OPTIONS[0].value,
      links: '',
      term: ''
    })
    onClose()
  }

  return (
    <div className="space-y-4 mt-4">
      {user.uid && (
        <div className="flex justify-end">
          <Button color="primary" variant="flat" onPress={onOpen}>
            上传资源
          </Button>
        </div>
      )}

      <ResourceTabs
        vndbId=""
        resources={resources}
        setEditResource={() => {}}
        onOpenEdit={() => {}}
        onOpenDelete={() => {}}
        setDeleteResourceId={() => {}}
      />

      <Modal isOpen={isOpen} onClose={onClose} isDismissable={!submitting}>
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader>上传课程资源</ModalHeader>
              <ModalBody className="space-y-4">
                <Input
                  label="标题"
                  variant="bordered"
                  value={form.title}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, title: value }))
                  }
                />
                <div className="space-y-2">
                  <label className="text-small text-default-500">类型</label>
                  <select
                    className="w-full border-small rounded-medium px-3 py-2 text-sm bg-content1"
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    {RESOURCE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="学期（可选，如 2024-Fall）"
                  variant="bordered"
                  value={form.term}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, term: value }))
                  }
                />
                <Textarea
                  label="链接（每行一个）"
                  variant="bordered"
                  minRows={4}
                  value={form.links}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, links: value }))
                  }
                  placeholder="https://pan.example.com/abc\nhttps://github.com/toki/resource"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={close} isDisabled={submitting}>
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={submitting}
                >
                  提交
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
