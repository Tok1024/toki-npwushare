"use client"

import { useEffect, useState } from 'react'
import { ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { Button } from '@heroui/button'
import { Switch, Slider, Textarea } from '@heroui/react'
import toast from 'react-hot-toast'
import { kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
import type { CourseFeedbackEntry } from '~/types/course'

interface Props {
  isOpen: boolean
  onClose: () => void
  dept: string
  slug: string
  courseId: number
  initial?: CourseFeedbackEntry | null
  onSuccess: () => void
}

export const FeedbackModal = ({
  isOpen,
  onClose,
  dept,
  slug,
  courseId,
  initial,
  onSuccess
}: Props) => {
  const [liked, setLiked] = useState(true)
  const [difficulty, setDifficulty] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initial) {
      setLiked(initial.liked)
      setDifficulty(initial.difficulty ?? null)
      setComment(initial.comment ?? '')
    } else {
      setLiked(true)
      setDifficulty(null)
      setComment('')
    }
  }, [initial, isOpen])

  const handleSubmit = async () => {
    setSubmitting(true)
    const payload = {
      liked,
      difficulty,
      comment: comment.trim() || undefined
    }

    try {
      const url = `/course/${dept}/${slug}/rating`
      const res =
        initial && initial.id
          ? await kunFetchPut<CourseFeedbackEntry | string>(url, {
              feedbackId: initial.id,
              ...payload
            })
          : await kunFetchPost<CourseFeedbackEntry | string>(url, {
              courseId,
              ...payload
            })

      if (typeof res === 'string') {
        toast.error(res)
        return
      }

      toast.success(initial ? '反馈已更新' : '感谢你的反馈')
      onSuccess()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalContent>
      <ModalHeader className="flex-col items-start space-y-1">
        <p className="text-lg font-semibold">{initial ? '更新反馈' : '提交课程反馈'}</p>
        <p className="text-small text-default-500">
          红心用来表示喜欢，难度投票帮助后来者评估课程强度。
        </p>
      </ModalHeader>
      <ModalBody className="space-y-4">
        <Switch isSelected={liked} onValueChange={setLiked}>
          我喜欢这门课
        </Switch>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-small text-default-500">
            <span>难度投票（可选）</span>
            {typeof difficulty === 'number' && <span>{difficulty} / 5</span>}
          </div>
          <Slider
            minValue={1}
            maxValue={5}
            step={1}
            value={difficulty ?? undefined}
            onChange={(value) => {
              if (Array.isArray(value)) return
              setDifficulty(value ?? null)
            }}
            aria-label="课程难度"
            marks={[
              { value: 1, label: '1' },
              { value: 3, label: '3' },
              { value: 5, label: '5' }
            ]}
          />
        </div>

        <Textarea
          label="补充说明（可选）"
          placeholder="写下学习建议、章节心得或注意事项"
          minRows={3}
          value={comment}
          onValueChange={setComment}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose} isDisabled={submitting}>
          取消
        </Button>
        <Button color="primary" onPress={handleSubmit} isLoading={submitting}>
          {initial ? '保存修改' : '提交反馈'}
        </Button>
      </ModalFooter>
    </ModalContent>
  )
}
