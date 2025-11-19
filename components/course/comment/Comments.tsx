'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { ArrowUpDown, MessageCircle } from 'lucide-react'
import { kunFetchGet } from '~/utils/kunFetch'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import { CommentLikeButton } from './Like'
import { CommentDropdown } from './Dropdown'
import { CommentContent } from './Content'
import { useUserStore } from '~/store/userStore'
import { KunNull } from '~/components/kun/Null'
import { cn } from '~/utils/cn'
import { PublishComment } from './Publish'
import type { PatchComment } from '~/types/api/patch'

type SortOrder = 'asc' | 'desc'

export const CourseComments = ({ dept, slug, courseId }: { dept: string; slug: string; courseId: number }) => {
  const [comments, setComments] = useState<PatchComment[]>([])
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    if (!user.uid) return
    const run = async () => {
      const res = await kunFetchGet<PatchComment[]>(`/course/${dept}/${slug}/comment`)
      if (typeof res === 'string') return
      setComments(res)
    }
    run()
  }, [dept, slug, user.uid])

  const sortComments = (list: PatchComment[]): PatchComment[] => {
    const sorted = [...list].sort((a, b) => {
      const da = new Date(a.created).getTime()
      const db = new Date(b.created).getTime()
      return sortOrder === 'asc' ? da - db : db - da
    })
    return sorted.map((c) => ({ ...c, reply: c.reply ? sortComments(c.reply) : [] }))
  }

  const toggleSortOrder = () => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))

  const scrollIntoComment = (commentId: number) => {
    if (typeof document === 'undefined') return
    const el = document.getElementById(`comment-${commentId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const setNewComment = async (newComment: PatchComment) => {
    setComments((prev) => [...prev, newComment])
    await new Promise((r) => setTimeout(r, 300))
    scrollIntoComment(newComment.id)
  }

  if (!user.uid) return <KunNull message="请登陆后查看评论" />

  const renderComments = (list: PatchComment[], depth = 0) =>
    list.map((comment) => (
      <div key={comment.id} className={cn(depth <= 3 && depth !== 0 ? 'ml-4' : 'ml-0', 'space-y-4')}>
        <Card id={`comment-${comment.id}`}>
          <CardBody>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <KunUser
                  user={comment.user}
                  userProps={{
                    name: comment.user.name,
                    description: formatDistanceToNow(comment.created),
                    avatarProps: { showFallback: true, name: comment.user.name, src: comment.user.avatar }
                  }}
                />
                <CommentDropdown comment={comment} courseId={courseId} dept={dept} slug={slug} setComments={setComments} />
              </div>

              <CommentContent comment={comment} />

              <div className="flex gap-2 mt-2">
                <CommentLikeButton comment={comment} dept={dept} slug={slug} />
                <Button variant="ghost" size="sm" className="gap-2" onPress={() => setReplyTo(replyTo === comment.id ? null : comment.id)}>
                  <MessageCircle className="size-4" /> 回复
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {replyTo === comment.id && (
          <div className="mt-2 ml-8">
            <PublishComment courseId={courseId} dept={dept} slug={slug} parentId={comment.id} receiverUsername={comment.quotedUsername} onSuccess={() => setReplyTo(null)} setNewComment={setNewComment} />
          </div>
        )}

        {comment.reply && comment.reply.length > 0 && <>{renderComments(comment.reply, depth + 1)}</>}
      </div>
    ))

  const sorted = sortComments(comments)

  return (
    <div className="space-y-4">
      <PublishComment courseId={courseId} dept={dept} slug={slug} receiverUsername={null} setNewComment={setNewComment} />
      {!!sorted.length && (
        <Card>
          <CardBody className="flex flex-row items-center justify-start gap-2">
            <Button variant="flat" className="gap-2" onPress={toggleSortOrder}>
              <ArrowUpDown className="size-4" />
              {sortOrder === 'asc' ? '最早优先' : '最新优先'}
            </Button>
          </CardBody>
        </Card>
      )}
      {renderComments(sorted)}
    </div>
  )
}
