import { useState } from 'react'
import { kunFetchPut } from '~/utils/kunFetch'
import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/tooltip'
import { Lollipop } from 'lucide-react'
import { useUserStore } from '~/store/userStore'
import toast from 'react-hot-toast'
import { kunErrorHandler } from '~/utils/kunErrorHandler'
import { cn } from '~/utils/cn'
import type { KunPatchRating } from '~/types/api/galgame'

export const RatingLikeButton = ({ rating, dept, slug }: { rating: KunPatchRating; dept: string; slug: string }) => {
  const { user } = useUserStore((state) => state)
  const [liked, setLiked] = useState(rating.isLike)
  const [likeCount, setLikeCount] = useState(rating.likeCount)
  const [loading, setLoading] = useState(false)

  const toggleLike = async () => {
    if (!user.uid) return toast.error('请登录以点赞')
    if (rating.user.id === user.uid) return toast.error('您不能给自己点赞')
    setLoading(true)
    const res = await kunFetchPut<KunResponse<boolean>>(`/course/${dept}/${slug}/rating/like`, { ratingId: rating.id })
    setLoading(false)
    kunErrorHandler(res, (value) => {
      setLiked(value)
      setLikeCount((prev) => (value ? prev + 1 : prev - 1))
    })
  }

  return (
    <Tooltip key="like" color="default" content="点赞" placement="bottom">
      <Button variant="bordered" isIconOnly size="sm" disabled={loading} isLoading={loading} onPress={toggleLike}>
        <Lollipop className={cn('size-4', liked ? 'text-danger-500' : '')} />
      </Button>
    </Tooltip>
  )
}

