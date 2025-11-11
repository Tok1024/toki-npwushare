'use client'

import { useEffect, useState, useTransition } from 'react'
import { Modal } from '@heroui/modal'
import { Button } from '@heroui/button'
import { Plus } from 'lucide-react'
import { kunFetchGet } from '~/utils/kunFetch'
import { KunNull } from '~/components/kun/Null'
import { RatingCard } from './RatingCard'
import { RatingModal } from './RatingModal'
import { useDisclosure } from '@heroui/react'
import type { KunPatchRating } from '~/types/api/galgame'
import { KunLoading } from '~/components/kun/Loading'

export const CourseRatings = ({ dept, slug, courseId }: { dept: string; slug: string; courseId: number }) => {
  const [ratings, setRatings] = useState<KunPatchRating[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isPending, startTransition] = useTransition()

  const fetchData = async () => {
    startTransition(async () => {
      const res = await kunFetchGet<KunPatchRating[]>(`/course/${dept}/${slug}/rating`)
      if (typeof res !== 'string') setRatings(res)
    })
  }

  useEffect(() => {
    fetchData()
  }, [dept, slug])

  const handleCreated = (rating?: KunPatchRating) => {
    if (rating) setRatings((prev) => [rating, ...prev])
  }

  const handlePatchUpdated = (rating: KunPatchRating) => {
    const index = ratings.findIndex((r) => r.id === rating.id)
    if (index !== -1) {
      const updated = [...ratings]
      updated[index] = rating
      setRatings(updated)
    }
  }

  const handleDeleted = (ratingId: number) => {
    setRatings((prev) => prev.filter((r) => r.id !== ratingId))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button color="primary" variant="flat" startContent={<Plus className="size-4" />} onPress={onOpen}>
          发布评价
        </Button>
      </div>

      {ratings.map((rating) => (
        <RatingCard key={rating.id} rating={rating} courseId={courseId} dept={dept} slug={slug} onRatingUpdated={handlePatchUpdated} onDeleted={handleDeleted} />
      ))}

      {isPending && <KunLoading hint="正在加载课程评分..." />}
      {!ratings.length && !isPending && <KunNull message="这个课程还没有评价" />}

      <Modal isOpen={isOpen} onClose={onClose} isDismissable={false} isKeyboardDismissDisabled>
        <RatingModal isOpen={isOpen} onClose={onClose} courseId={courseId} dept={dept} slug={slug} onSuccess={handleCreated} />
      </Modal>
    </div>
  )}

