'use client'

import { useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Button, Chip, Tooltip } from '@heroui/react'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/modal'
import { Pencil, Star, Trash2 } from 'lucide-react'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import { RatingLikeButton } from './RatingLike'
import { useUserStore } from '~/store/userStore'
import toast from 'react-hot-toast'
import { kunFetchDelete } from '~/utils/kunFetch'
import { RatingModal } from './RatingModal'
import { KUN_GALGAME_RATING_RECOMMEND_MAP, KUN_GALGAME_RATING_PLAY_STATUS_MAP, KUN_GALGAME_RATING_SPOILER_MAP } from '~/constants/galgame'
import type { KunPatchRating } from '~/types/api/galgame'

export const RatingCard = ({ rating, courseId, dept, slug, onRatingUpdated, onDeleted }: { rating: KunPatchRating; courseId: number; dept: string; slug: string; onRatingUpdated: (r: KunPatchRating) => void; onDeleted: (id: number) => void }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useUserStore((state) => state)
  const canEdit = user.uid === rating.user.id || user.role >= 3

  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
  const [deleting, setDeleting] = useState(false)
  const handleDeleteRating = async () => {
    if (!canEdit) return toast.error('您没有权限删除该评价')
    setDeleting(true)
    await kunFetchDelete<KunResponse<{}>>(`/course/${dept}/${slug}/rating`, { ratingId: rating.id })
    setDeleting(false)
    onDeleted(rating.id)
    onCloseDelete()
    toast.success('课程评价删除成功')
  }

  return (
    <Card>
      <CardBody>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <KunUser user={rating.user} userProps={{ name: rating.user.name, description: `发布于 ${formatDistanceToNow(rating.created)}`, avatarProps: { src: rating.user.avatar } }} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Chip color="primary" variant="flat">{KUN_GALGAME_RATING_RECOMMEND_MAP[rating.recommend]}</Chip>
              <Chip color="secondary" variant="flat">{KUN_GALGAME_RATING_PLAY_STATUS_MAP[rating.playStatus]}</Chip>
              <Chip color="default" variant="flat">{KUN_GALGAME_RATING_SPOILER_MAP[rating.spoilerLevel]}</Chip>
            </div>
            <span className="text-warning flex items-center gap-1 text-3xl font-bold">
              <Star fill="#F5A524" class-name="text-2xl" />
              {rating.overall}
            </span>
          </div>

          {rating.shortSummary && <p className="text-default-700 whitespace-pre-wrap">{rating.shortSummary}</p>}

          <div className="flex gap-2 mt-3">
            <RatingLikeButton dept={dept} slug={slug} rating={rating} />
            {canEdit && (
              <>
                <Tooltip content="编辑"><Button variant="bordered" isIconOnly size="sm" onPress={onOpen}><Pencil className="size-4" /></Button></Tooltip>
                <Tooltip content="删除"><Button variant="bordered" isIconOnly size="sm" onPress={onOpenDelete}><Trash2 className="size-4" /></Button></Tooltip>
              </>
            )}
          </div>
        </div>
      </CardBody>

      <Modal isOpen={isOpen} onClose={onClose} isDismissable={false} isKeyboardDismissDisabled>
        <RatingModal isOpen={isOpen} onClose={onClose} courseId={courseId} dept={dept} slug={slug} initial={rating} onSuccess={onRatingUpdated} />
      </Modal>

      <Modal isOpen={isOpenDelete} onClose={onCloseDelete} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">删除课程评价</ModalHeader>
          <ModalBody>
            <p>您确定要删除这条课程评价吗？该操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>取消</Button>
            <Button color="danger" onPress={handleDeleteRating} disabled={deleting} isLoading={deleting}>删除</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  )
}

