'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { Button } from '@heroui/button'
import { BarChart3 } from 'lucide-react'
import { Slider } from '@heroui/slider'
import toast from 'react-hot-toast'
import { kunFetchGet, kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
import { useUserStore } from '~/store/userStore'
import type { CourseFeedbackResponse } from '~/types/course'

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap sm:shrink-0">
  slug: string
  courseId: number
}

export const FeedbackInteraction = ({ dept, slug, courseId }: Props) => {
        <span className="text-xs text-default-400 hidden sm:inline">({data?.stats.difficultyVotes ?? 0} 票)</span>
  const [loading, startTransition] = useTransition()
  // 当前滑块选中的值（未提交前仅本地保存）
        className="flex-1 min-w-[140px] max-w-[16rem] md:max-w-[20rem]"
  'use client'

  import { useCallback, useEffect, useState, useTransition } from 'react'
  import { Button } from '@heroui/button'
  import { BarChart3 } from 'lucide-react'
  import { Slider } from '@heroui/slider'
  import toast from 'react-hot-toast'
  import { kunFetchGet, kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
  import { useUserStore } from '~/store/userStore'
  import type { CourseFeedbackResponse } from '~/types/course'

  interface Props {
    dept: string
    slug: string
    courseId: number
  }

  export const FeedbackInteraction = ({ dept, slug, courseId }: Props) => {
    const [data, setData] = useState<CourseFeedbackResponse | null>(null)
    const [loading, startTransition] = useTransition()
    'use client'

    import { useCallback, useEffect, useState, useTransition } from 'react'
    import { Button } from '@heroui/button'
    import { BarChart3 } from 'lucide-react'
    import { Slider } from '@heroui/slider'
    import toast from 'react-hot-toast'
    import { kunFetchGet, kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
    import { useUserStore } from '~/store/userStore'
    import type { CourseFeedbackResponse } from '~/types/course'

    interface Props {
      dept: string
      slug: string
      courseId: number
    }

    export const FeedbackInteraction = ({ dept, slug, courseId }: Props) => {
      const [data, setData] = useState<CourseFeedbackResponse | null>(null)
      const [, startTransition] = useTransition()
      const [value, setValue] = useState<number>(3)
      const [submitting, setSubmitting] = useState(false)
      const { user } = useUserStore((state) => state)

      const load = useCallback(() => {
        startTransition(async () => {
          const res = await kunFetchGet<CourseFeedbackResponse | string>(
            `/course/${dept}/${slug}/rating`
          )
          if (typeof res === 'string') return
          setData(res)
          if (res.mine?.difficulty) {
            setValue(res.mine.difficulty)
          } else {
            setValue(3)
          }
        })
      }, [dept, slug])

      useEffect(() => {
        load()
      }, [load])

      const handleSubmit = async () => {
        if (!user.uid) {
          toast.error('请先登录')
          return
        }
        setSubmitting(true)
        try {
          const url = `/course/${dept}/${slug}/rating`
          const payload = {
            difficulty: value,
            liked: data?.mine?.liked ?? false,
            comment: data?.mine?.comment
          }
          const res = data?.mine?.id
            ? await kunFetchPut<any>(url, { feedbackId: data.mine.id, ...payload })
            : await kunFetchPost<any>(url, { courseId, ...payload })
          if (typeof res === 'string') {
            toast.error(res)
          } else {
            toast.success('投票已提交')
            load()
          }
        } finally {
          setSubmitting(false)
        }
      }

      if (!data) return null

      return (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap sm:shrink-0">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-amber-600">
              {(data?.stats.difficultyAvg ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-default-400 hidden sm:inline">
              ({data?.stats.difficultyVotes ?? 0} 票)
            </span>
          </div>
          <Slider
            className="flex-1 min-w-[140px] max-w-[16rem] md:max-w-[20rem]"
            minValue={1}
            maxValue={5}
            step={1}
            value={value}
            onChange={(v) => {
              if (Array.isArray(v)) return
              setValue(v ?? 3)
            }}
            aria-label="难度投票"
            marks={[
              { value: 1, label: '简' },
              { value: 3, label: '中' },
              { value: 5, label: '难' }
            ]}
            isDisabled={submitting || !user.uid}
          />
          <span className="text-xs font-semibold text-default-600 w-10 text-center hidden sm:inline">
            {value} / 5
          </span>
          <Button
            size="sm"
            color="primary"
            className="px-3"
            isDisabled={submitting || !user.uid}
            isLoading={submitting}
            onPress={handleSubmit}
          >
            投票
          </Button>
        </div>
      )
    }
    <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
      <BarChart3 className="w-5 h-5 text-amber-500" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-amber-600">
          {(data?.stats.difficultyAvg ?? 0).toFixed(1)}
        </span>
        <span className="text-xs text-default-400">({data?.stats.difficultyVotes ?? 0} 票)</span>
      </div>
      <Slider
        className="flex-1 max-w-[14rem]"
        minValue={1}
        maxValue={5}
        step={1}
        value={value}
        onChange={(v) => {
          if (Array.isArray(v)) return
          setValue(v ?? 3)
        }}
        aria-label="难度投票"
        marks={[
          { value: 1, label: '简' },
          { value: 3, label: '中' },
          { value: 5, label: '难' }
        ]}
        isDisabled={submitting || !user.uid}
      />
      <span className="text-xs font-semibold text-default-600 w-10 text-center">{value} / 5</span>
      <Button
        size="sm"
        color="primary"
        className="px-3"
        isDisabled={submitting || !user.uid}
        isLoading={submitting}
        onPress={handleSubmit}
      >
        投票
      </Button>
    </div>
  )
}
