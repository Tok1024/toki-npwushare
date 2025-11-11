'use client'

import { Button } from '@heroui/button'
import { ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal'
import { Input, RadioGroup, Radio, Textarea } from '@heroui/react'
import { useState } from 'react'
import { kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
import {
  KUN_GALGAME_RATING_PLAY_STATUS_CONST,
  KUN_GALGAME_RATING_RECOMMEND_CONST,
  KUN_GALGAME_RATING_SPOILER_CONST,
  KUN_GALGAME_RATING_RECOMMEND_MAP,
  KUN_GALGAME_RATING_SPOILER_MAP,
  KUN_GALGAME_RATING_PLAY_STATUS_MAP
} from '~/constants/galgame'
import type { KunPatchRating, KunPatchRatingInput, KunPatchRatingUpdateInput } from '~/types/api/galgame'

export const RatingModal = ({ isOpen, onClose, initial, dept, slug, courseId, onSuccess }: { isOpen: boolean; onClose: () => void; initial?: KunPatchRating; dept: string; slug: string; courseId: number; onSuccess?: (rating: KunPatchRating) => void }) => {
  const [data, setData] = useState<KunPatchRatingInput>(
    initial
      ? {
          patchId: courseId,
          recommend: initial.recommend,
          overall: initial.overall,
          playStatus: initial.playStatus,
          shortSummary: initial.shortSummary,
          spoilerLevel: initial.spoilerLevel
        }
      : {
          patchId: courseId,
          recommend: 'yes',
          overall: 8,
          playStatus: 'finished_main',
          shortSummary: '',
          spoilerLevel: 'none'
        }
  )

  const submit = async () => {
    const payload = initial
      ? ({ ...data, ratingId: initial.id } as KunPatchRatingUpdateInput)
      : (data as KunPatchRatingInput)
    const res = initial
      ? await kunFetchPut<KunResponse<KunPatchRating>>(`/course/${dept}/${slug}/rating`, payload as any)
      : await kunFetchPost<KunResponse<KunPatchRating>>(`/course/${dept}/${slug}/rating`, { ...payload, courseId })
    if (typeof res !== 'string') onSuccess?.(res)
    onClose()
  }

  return (
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">发布/编辑课程评价</ModalHeader>
          <ModalBody>
            <RadioGroup
              label="推荐程度"
              value={data.recommend}
              onValueChange={(v) => setData((p) => ({ ...p, recommend: v as any }))}
            >
              {KUN_GALGAME_RATING_RECOMMEND_CONST.map((k) => (
                <Radio key={k} value={k}>
                  {KUN_GALGAME_RATING_RECOMMEND_MAP[k]}
                </Radio>
              ))}
            </RadioGroup>

            <Input
              type="number"
              label="综合评分 (1-10)"
              min={1}
              max={10}
              value={String(data.overall)}
              onChange={(e) => setData((p) => ({ ...p, overall: Number(e.target.value) }))}
            />

            <RadioGroup
              label="课程完成度"
              value={data.playStatus}
              onValueChange={(v) => setData((p) => ({ ...p, playStatus: v as any }))}
            >
              {KUN_GALGAME_RATING_PLAY_STATUS_CONST.map((k) => (
                <Radio key={k} value={k}>
                  {KUN_GALGAME_RATING_PLAY_STATUS_MAP[k]}
                </Radio>
              ))}
            </RadioGroup>

            <Textarea
              label="简评"
              value={data.shortSummary}
              onValueChange={(v) => setData((p) => ({ ...p, shortSummary: v }))}
            />

            <RadioGroup
              label="剧透程度"
              value={data.spoilerLevel}
              onValueChange={(v) => setData((p) => ({ ...p, spoilerLevel: v as any }))}
            >
              {KUN_GALGAME_RATING_SPOILER_CONST.map((k) => (
                <Radio key={k} value={k}>
                  {KUN_GALGAME_RATING_SPOILER_MAP[k]}
                </Radio>
              ))}
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button color="primary" onPress={submit}>
              确认
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  )
}

