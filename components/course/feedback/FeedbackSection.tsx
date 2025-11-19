'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { Modal } from '@heroui/modal'
import { Heart, BarChart3, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { kunFetchDelete, kunFetchGet } from '~/utils/kunFetch'
import { KunNull } from '~/components/kun/Null'
import { useDisclosure } from '@heroui/react'
import { useUserStore } from '~/store/userStore'
import type {
  CourseFeedbackEntry,
  CourseFeedbackResponse
} from '~/types/course'
import { FeedbackCard } from './FeedbackCard'
import { FeedbackModal } from './FeedbackModal'

interface Props {
  dept: string
  slug: string
  courseId: number
}

export const CourseFeedbackSection = ({ dept, slug, courseId }: Props) => {
  const [data, setData] = useState<CourseFeedbackResponse | null>(null)
  const [loading, startTransition] = useTransition()
  const [editing, setEditing] = useState<CourseFeedbackEntry | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useUserStore((state) => state)

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await kunFetchGet<CourseFeedbackResponse | string>(
        `/course/${dept}/${slug}/rating`
      )
      if (typeof res === 'string') {
        toast.error(res)
        return
      }
      setData(res)
    })
  }, [dept, slug])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (feedbackId: number) => {
    try {
      await kunFetchDelete(`/course/${dept}/${slug}/rating`, {
        feedbackId
      })
      toast.success('反馈已删除')
      load()
    } catch (error) {
      toast.error('删除失败，请稍后重试')
    }
  }

  const openCreate = () => {
    setEditing(null)
    onOpen()
  }

  const openEdit = (feedback: CourseFeedbackEntry) => {
    setEditing(feedback)
    onOpen()
  }

  const canEdit = (feedback: CourseFeedbackEntry) => {
    if (!user.uid) return false
    return feedback.user?.id === user.uid || user.role >= 3
  }

  const isInitialLoading = loading && !data

  const renderStatCards = () => {
    if (isInitialLoading) {
      return Array.from({ length: 2 }).map((_, index) => (
        <Card
          key={`feedback-stat-skeleton-${index}`}
          className="border-none bg-white/80 shadow-sm"
        >
          <CardBody className="space-y-4 animate-pulse">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-default-100" />
              <div className="h-3 w-32 rounded bg-default-100" />
            </div>
            <div className="h-8 w-24 rounded bg-default-200 self-end" />
          </CardBody>
        </Card>
      ))
    }

    return (
      <>
        <Card className="border-none bg-white/90 shadow-sm">
          <CardBody className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500">累计红心</p>
              <p className="text-tiny text-default-400">喜欢这门课的同学数量</p>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-danger fill-danger/80" />
              <p className="text-2xl font-semibold text-danger">
                {data?.stats.heartCount ?? 0}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card className="border-none bg-white/90 shadow-sm">
          <CardBody className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500">难度投票</p>
              <p className="text-tiny text-default-400">
                平均难度与参与投票人数
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-warning" />
              <p className="text-2xl font-semibold">
                {(data?.stats.difficultyAvg ?? 0).toFixed(1)}
                <span className="ml-2 text-tiny text-default-500">
                  ({data?.stats.difficultyVotes ?? 0} 票)
                </span>
              </p>
            </div>
          </CardBody>
        </Card>
      </>
    )
  }

  const renderFeedbackContent = () => {
    if (isInitialLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`feedback-skeleton-${index}`}
              className="border-none bg-white/90 shadow-sm"
            >
              <CardBody className="space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-default-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-default-100" />
                    <div className="h-3 w-20 rounded bg-default-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-default-100" />
                  <div className="h-3 w-5/6 rounded bg-default-100" />
                  <div className="h-3 w-2/3 rounded bg-default-100" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )
    }

    if (!data) {
      return <KunNull message="暂时无法加载反馈，请稍后再试" />
    }

    if (data.feedbacks.length === 0) {
      return <KunNull message="还没有任何反馈，来写下第一条吧" />
    }

    return data.feedbacks.map((feedback) => (
      <FeedbackCard
        key={feedback.id}
        feedback={feedback}
        canEdit={canEdit(feedback)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    ))
  }

  return (
    <div className="space-y-5 rounded-2xl border border-default-100/60 bg-white/70 p-4 shadow-sm min-h-[520px]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          {renderStatCards()}
        </div>

        <Button
          color="primary"
          variant="solid"
          className="ml-auto shadow-primary/20"
          startContent={<Sparkles className="size-4" />}
          onPress={openCreate}
          isDisabled={loading && !user.uid}
        >
          {data?.mine ? '更新我的反馈' : '提交反馈'}
        </Button>
      </div>

      <div
        className="space-y-4 rounded-2xl border border-default-100/60 bg-white/90 p-4 shadow-inner min-h-[320px]"
        aria-busy={loading}
      >
        {renderFeedbackContent()}
      </div>

      <Modal isOpen={isOpen} onClose={onClose} isDismissable={!loading}>
        <FeedbackModal
          isOpen={isOpen}
          onClose={onClose}
          dept={dept}
          slug={slug}
          courseId={courseId}
          initial={editing ?? data?.mine ?? null}
          onSuccess={load}
        />
      </Modal>
    </div>
  )
}
