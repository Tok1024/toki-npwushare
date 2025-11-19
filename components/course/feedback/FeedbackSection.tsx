'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { Modal } from '@heroui/modal'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { kunFetchDelete, kunFetchGet } from '~/utils/kunFetch'
import { KunNull } from '~/components/kun/Null'
import { KunLoading } from '~/components/kun/Loading'
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

export const CourseFeedbackSection = ({ dept, slug }: Props) => {
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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardBody className="space-y-1">
            <p className="text-small text-default-500">累计红心</p>
            <p className="text-2xl font-semibold text-danger">
              {data?.stats.heartCount ?? 0}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-1">
            <p className="text-small text-default-500">难度投票</p>
            <p className="text-2xl font-semibold">
              {(data?.stats.difficultyAvg ?? 0).toFixed(1)}
              <span className="text-tiny text-default-500 ml-2">
                ({data?.stats.difficultyVotes ?? 0} 票)
              </span>
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          color="primary"
          variant="flat"
          startContent={<Sparkles className="size-4" />}
          onPress={openCreate}
        >
          {data?.mine ? '更新我的反馈' : '提交反馈'}
        </Button>
      </div>

      {loading && <KunLoading hint="正在加载课程反馈..." />}

      {!loading && data?.feedbacks.length === 0 && (
        <KunNull message="还没有任何反馈，来写下第一条吧" />
      )}

      <div className="space-y-4">
        {data?.feedbacks.map((feedback) => (
          <FeedbackCard
            key={feedback.id}
            feedback={feedback}
            canEdit={canEdit(feedback)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
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
