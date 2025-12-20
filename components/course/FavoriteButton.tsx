'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/button'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'

interface CourseFavoriteButtonProps {
  courseId: number
  className?: string
  showLabel?: boolean
}

export const CourseFavoriteButton = ({
  courseId,
  className,
  showLabel = false
}: CourseFavoriteButtonProps) => {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await fetch(
          `/api/course/favorite?courseId=${courseId}`,
          { cache: 'no-store' }
        )
        // 某些状态码可能没有响应体（如 304），避免直接 json() 报错
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) return

        const data = await response.json().catch(() => null)
        if (data && typeof data.isFavorited === 'boolean') {
          setIsFavorited(data.isFavorited)
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error)
      }
    }

    checkFavorite()
  }, [courseId])

  const handleToggleFavorite = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/course/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          action: isFavorited ? 'remove' : 'add'
        })
      })

      if (!response.ok) {
        let message = '操作失败'
        try {
          const ct = response.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const data = await response.json()
            message = data?.error || message
          }
        } catch {}
        toast.error(message)
        return
      }

      setIsFavorited(!isFavorited)
      toast.success(isFavorited ? '已取消收藏' : '已收藏')
    } catch (error) {
      console.error('收藏操作失败:', error)
      toast.error('操作失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      isIconOnly={!showLabel}
      className={className}
      color={isFavorited ? 'danger' : 'default'}
      variant={isFavorited ? 'flat' : 'light'}
      onClick={handleToggleFavorite}
      isLoading={isLoading}
    >
      <Heart
        className="size-5"
        fill={isFavorited ? 'currentColor' : 'none'}
      />
      {showLabel && (isFavorited ? '已收藏' : '收藏')}
    </Button>
  )
}
