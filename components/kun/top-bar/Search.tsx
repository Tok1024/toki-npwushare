'use client'

import { Tooltip } from '@heroui/tooltip'
import { Button } from '@heroui/button'
import { Search } from 'lucide-react'
import { useRouter } from '@bprogress/next'
import { useHotkeys } from 'react-hotkeys-hook'

export const KunSearch = () => {
  const router = useRouter()
  useHotkeys('ctrl+k', (event) => {
    event.preventDefault()
    router.push('/course')
  })

  return (
    <Tooltip
      disableAnimation
      showArrow
      closeDelay={0}
      content="按 Ctrl + K 跳转到课程目录"
    >
      <Button
        isIconOnly
        variant="light"
        aria-label="搜索"
        onPress={() => router.push('/course')}
      >
        <Search className="size-6 text-default-500" />
      </Button>
    </Tooltip>
  )
}
