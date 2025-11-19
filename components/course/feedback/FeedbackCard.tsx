'use client'

import { Card, CardBody } from '@heroui/card'
import { Avatar } from '@heroui/avatar'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
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

  return (
    <Card className="border border-default-100 bg-white/90 shadow-sm">
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              size="sm"
              src={feedback.user?.avatar ?? undefined}
              name={feedback.user?.name ?? '匿名同学'}
            />
            <div>
              <p className="text-sm font-medium text-default-900">
                {feedback.user?.name ?? '匿名同学'}
              </p>
              <p className="text-tiny text-default-400">{createdLabel}</p>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="light"
                className="text-xs"
                onPress={() => onEdit(feedback)}
                startContent={<PenSquare className="size-3.5" />}
              >
                编辑
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="light"
                className="text-xs"
                onPress={() => onDelete(feedback.id)}
                startContent={<Trash2 className="size-3.5" />}
              >
                删除
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-small">
          <Chip
            size="sm"
            variant="flat"
            classNames={{
              base: feedback.liked
                ? 'bg-rose-50 text-rose-600 border-transparent'
                : 'bg-default-50 text-default-500 border-transparent',
              content: 'text-xs'
            }}
            startContent={
              <Heart
                className={`size-3.5 ${
                  feedback.liked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            }
          >
            {feedback.liked ? '喜欢这门课' : '未标记喜欢'}
          </Chip>

          {typeof feedback.difficulty === 'number' && (
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: 'bg-amber-50 text-amber-700 border-transparent',
                content: 'text-xs'
              }}
            >
              难度 {feedback.difficulty} / 5
            </Chip>
          )}
        </div>

        {feedback.comment && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-default-700">
            {feedback.comment}
          </p>
        )}
      </CardBody>
    </Card>
  )
}
