'use client'

import { useState } from 'react'
import { Button, Textarea } from '@heroui/react'
import { kunFetchPost } from '~/utils/kunFetch'
import toast from 'react-hot-toast'
import type { Comment } from '~/types/api/comment'

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
  setNewComment: (comment: Comment) => Promise<void>
}) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!content.trim()) return
    setLoading(true)
    const res = await kunFetchPost<KunResponse<Comment>>(
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
    <div className="space-y-3">
      {receiverUsername && (
        <div className="flex items-center gap-2 text-sm text-default-500 bg-default-100/50 px-3 py-1.5 rounded-medium w-fit">
          <span className="w-1 h-4 bg-primary rounded-full"></span>
          回复{' '}
          <span className="font-semibold text-default-700">
            @{receiverUsername}
          </span>
        </div>
      )}
      <div className="relative group">
        <Textarea
          value={content}
          onValueChange={setContent}
          minRows={3}
          placeholder="写下你的想法..."
          classNames={{
            input: 'text-base',
            inputWrapper:
              'bg-white shadow-sm border-default-200 group-hover:border-default-300 transition-colors'
          }}
          variant="bordered"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button
            color="primary"
            size="sm"
            isLoading={loading}
            onPress={submit}
            className="font-medium shadow-md shadow-primary/20"
            isDisabled={!content.trim()}
          >
            发表评论
          </Button>
        </div>
      </div>
    </div>
  )
}
