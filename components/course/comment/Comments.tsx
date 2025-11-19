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

export const CourseComments = ({
  dept,
  slug,
  courseId
}: {
  dept: string
  slug: string
  courseId: number
}) => {
  const [comments, setComments] = useState<PatchComment[]>([])
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [loading, setLoading] = useState(true)
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    if (!user.uid) {
      setLoading(false)
      return
    }
    let cancelled = false
    const run = async () => {
      setLoading(true)
      const res = await kunFetchGet<PatchComment[]>(
        `/course/${dept}/${slug}/comment`
      )
      if (typeof res === 'string') {
        if (!cancelled) setLoading(false)
        return
      }
      if (!cancelled) {
        setComments(res)
        setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [dept, slug, user.uid])

  const sortComments = (list: PatchComment[]): PatchComment[] => {
    const sorted = [...list].sort((a, b) => {
      const da = new Date(a.created).getTime()
      const db = new Date(b.created).getTime()
      return sortOrder === 'asc' ? da - db : db - da
    })
    return sorted.map((c) => ({
      ...c,
      reply: c.reply ? sortComments(c.reply) : []
    }))
  }

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))

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

  const renderLoading = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card
          key={`comment-skeleton-${idx}`}
          className="border-none bg-white/80 shadow-sm"
        >
          <CardBody className="space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-default-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-default-100" />
                <div className="h-3 w-16 rounded bg-default-100" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-default-100" />
              <div className="h-3 w-5/6 rounded bg-default-100" />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )

  const renderComments = (list: PatchComment[], depth = 0) =>
    list.map((comment) => (
      <div
        key={comment.id}
        className={cn(
          depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-default-100 pl-4' : '',
          'space-y-3'
        )}
      >
        <Card
          id={`comment-${comment.id}`}
          className="border-none shadow-sm bg-white/80 hover:shadow-md transition-shadow"
        >
          <CardBody className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <KunUser
                  user={comment.user}
                  userProps={{
                    name: comment.user.name,
                    description: formatDistanceToNow(comment.created),
                    avatarProps: {
                      showFallback: true,
                      name: comment.user.name,
                      src: comment.user.avatar,
                      size: 'sm',
                      className: 'ring-2 ring-default-100'
                    },
                    classNames: {
                      name: 'text-sm font-semibold text-default-700',
                      description: 'text-xs text-default-400'
                    }
                  }}
                />
                <CommentDropdown
                  comment={comment}
                  courseId={courseId}
                  dept={dept}
                  slug={slug}
                  setComments={setComments}
                />
              </div>

              <div className="pl-10 sm:pl-12">
                <CommentContent comment={comment} />

                <div className="mt-3 flex gap-4">
                  <CommentLikeButton
                    comment={comment}
                    dept={dept}
                    slug={slug}
                  />
                  <Button
                    variant="light"
                    size="sm"
                    className="gap-1.5 text-default-500 hover:text-primary data-[hover=true]:bg-transparent px-0 min-w-0 h-auto"
                    onPress={() =>
                      setReplyTo(replyTo === comment.id ? null : comment.id)
                    }
                  >
                    <MessageCircle className="size-4" />
                    <span className="text-xs font-medium">回复</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {replyTo === comment.id && (
          <div className="mt-3 ml-4 sm:ml-12 animate-in fade-in slide-in-from-top-2 duration-200">
            <PublishComment
              courseId={courseId}
              dept={dept}
              slug={slug}
              parentId={comment.id}
              receiverUsername={
                comment.quotedUsername ?? comment.user.name ?? null
              }
              onSuccess={() => setReplyTo(null)}
              setNewComment={setNewComment}
            />
          </div>
        )}

        {comment.reply && comment.reply.length > 0 && (
          <div className="mt-3 space-y-3">
            {renderComments(comment.reply, depth + 1)}
          </div>
        )}
      </div>
    ))

  const sorted = sortComments(comments)

  return (
    <div className="space-y-5 min-h-[420px]">
      <section className="rounded-2xl border border-default-200 bg-white/80 px-5 py-4 shadow-sm">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-default-700">发表讨论</h3>
          <p className="text-sm text-default-400">
            分享你的作业经验、老师风格或学习 tips
          </p>
        </div>
        <PublishComment
          courseId={courseId}
          dept={dept}
          slug={slug}
          receiverUsername={null}
          setNewComment={setNewComment}
        />
      </section>

      {loading ? (
        renderLoading()
      ) : sorted.length ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <h3 className="text-lg font-semibold text-default-700">
              全部评论{' '}
              <span className="text-sm font-normal text-default-400">
                ({comments.length})
              </span>
            </h3>
            <Button
              variant="light"
              size="sm"
              className="gap-2 text-default-500 font-medium"
              onPress={toggleSortOrder}
            >
              <ArrowUpDown className="size-4" />
              {sortOrder === 'asc' ? '最早优先' : '最新优先'}
            </Button>
          </div>

          <div className="space-y-6">{renderComments(sorted)}</div>
        </>
      ) : (
        <KunNull message="还没有讨论，写下第一条吧" />
      )}
    </div>
  )
}
