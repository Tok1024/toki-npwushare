'use client'

import { useState } from 'react'
import { Button, Textarea } from '@heroui/react'
import { kunFetchPost } from '~/utils/kunFetch'
import toast from 'react-hot-toast'
import type { PatchComment } from '~/types/api/patch'

export const PublishComment = ({
  dept,
  slug,
  courseId,
  parentId,
  receiverUsername,
  onSuccess,
  setNewComment
}: {
  dept: string
  slug: string
  courseId: number
  parentId?: number | null
  receiverUsername: string | null
  onSuccess?: () => void
  setNewComment: (comment: PatchComment) => Promise<void>
}) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!content.trim()) return
    setLoading(true)
    const res = await kunFetchPost<KunResponse<PatchComment>>(
      `/course/${dept}/${slug}/comment`,
      {
        courseId,
        parentId: parentId ?? null,
        content
      }
    )
    setLoading(false)
    if (typeof res === 'string') return toast.error(res)
    toast.success('评论发布成功')
    onSuccess?.()
    // 简化：追加本地占位评论（服务端返回原始行，前端再次刷新会获取完整结构）
    await setNewComment({
      id: res.id,
      uniqueId: `${dept}/${slug}`,
      content,
      isLike: false,
      likeCount: 0,
      parentId: parentId ?? null,
      userId: 0,
      patchId: courseId,
      created: String(new Date().toISOString()),
      updated: String(new Date().toISOString()),
      reply: [],
      user: { id: 0, name: '我', avatar: '' }
    })
    setContent('')
  }

  return (
    <div className="space-y-2">
      {receiverUsername && (
        <div className="text-small text-default-500">
          回复：{receiverUsername}
        </div>
      )}
      <Textarea
        value={content}
        onValueChange={setContent}
        minRows={3}
        placeholder="写点什么吧…"
      />
      <div className="flex justify-end">
        <Button color="primary" isLoading={loading} onPress={submit}>
          发表评论
        </Button>
      </div>
    </div>
  )
}
