'use client'

import { Card, CardBody } from '@heroui/card'
import { Avatar } from '@heroui/avatar'
import { Button } from '@heroui/button'
import { Heart, PenSquare, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import type { CourseFeedbackEntry } from '~/types/course'

interface Props {
  feedback: CourseFeedbackEntry
  canEdit: boolean
  onEdit: (feedback: CourseFeedbackEntry) => void
  onDelete: (feedbackId: number) => void
}

export const FeedbackCard = ({
  feedback,
  canEdit,
  onEdit,
  onDelete
}: Props) => {
  const createdLabel = dayjs(feedback.created).format('YYYY-MM-DD HH:mm')
  const likedLabel = feedback.liked ? '已标记喜欢' : '未点赞'

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="sm" src={feedback.user?.avatar ?? undefined} />
            <div>
              <p className="text-sm font-medium">
                {feedback.user?.name ?? '匿名同学'}
              </p>
              <p className="text-tiny text-default-400">{createdLabel}</p>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                aria-label="编辑反馈"
                onPress={() => onEdit(feedback)}
              >
                <PenSquare className="size-4" />
              </Button>
              <Button
                isIconOnly
                color="danger"
                variant="light"
                size="sm"
                aria-label="删除反馈"
                onPress={() => onDelete(feedback.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-small text-default-600">
          <span
            className={`flex items-center gap-1 ${feedback.liked ? 'text-danger' : ''}`}
          >
            <Heart
              className={`size-4 ${feedback.liked ? 'fill-danger' : ''}`}
            />
            {likedLabel}
          </span>
          {typeof feedback.difficulty === 'number' && (
            <span>难度 {feedback.difficulty} / 5</span>
          )}
        </div>

        {feedback.comment && (
          <p className="text-sm whitespace-pre-wrap break-words text-default-600">
            {feedback.comment}
          </p>
        )}
      </CardBody>
    </Card>
  )
}
