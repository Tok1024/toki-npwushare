import { z } from 'zod'
import {
  KUN_GALGAME_RATING_PLAY_STATUS_CONST,
  KUN_GALGAME_RATING_RECOMMEND_CONST,
  KUN_GALGAME_RATING_SPOILER_CONST
} from '~/constants/galgame'

export const courseCommentCreateSchema = z.object({
  courseId: z.coerce.number().min(1).max(9999999),
  parentId: z.coerce.number().min(1).max(9999999).nullable(),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论的内容最少为 1 个字符' })
    .max(10007, { message: '评论的内容最多为 10007 个字符' })
})

export const courseCommentUpdateSchema = z.object({
  commentId: z.coerce.number().min(1).max(9999999),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论的内容最少为 1 个字符' })
    .max(10007, { message: '评论的内容最多为 10007 个字符' })
})

export const courseRatingCreateSchema = z.object({
  courseId: z.coerce.number().min(1).max(9999999),
  recommend: z
    .string({ message: '推荐程度不正确' })
    .refine((v) => KUN_GALGAME_RATING_RECOMMEND_CONST.includes(v as any), {
      message: '推荐程度不正确'
    }),
  overall: z.coerce
    .number({ message: '评分不正确' })
    .min(1, { message: '评分最小为 1' })
    .max(10, { message: '评分最大为 10' }),
  playStatus: z
    .string({ message: '状态不正确' })
    .refine((v) => KUN_GALGAME_RATING_PLAY_STATUS_CONST.includes(v as any), {
      message: '状态不正确'
    }),
  shortSummary: z.string().trim().max(1314, { message: '简评最多 1314 字' }),
  spoilerLevel: z
    .string({ message: '剧透等级不正确' })
    .refine((v) => KUN_GALGAME_RATING_SPOILER_CONST.includes(v as any), {
      message: '剧透等级不正确'
    })
})

export const courseRatingUpdateSchema = z.object({
  ratingId: z.coerce.number().min(1).max(9999999),
  recommend: z
    .string({ message: '推荐程度不正确' })
    .refine((v) => KUN_GALGAME_RATING_RECOMMEND_CONST.includes(v as any), {
      message: '推荐程度不正确'
    }),
  overall: z.coerce
    .number({ message: '评分不正确' })
    .min(1, { message: '评分最小为 1' })
    .max(10, { message: '评分最大为 10' }),
  playStatus: z
    .string({ message: '状态不正确' })
    .refine((v) => KUN_GALGAME_RATING_PLAY_STATUS_CONST.includes(v as any), {
      message: '状态不正确'
    }),
  shortSummary: z.string().trim().max(1314, { message: '简评最多 1314 字' }),
  spoilerLevel: z
    .string({ message: '剧透等级不正确' })
    .refine((v) => KUN_GALGAME_RATING_SPOILER_CONST.includes(v as any), {
      message: '剧透等级不正确'
    })
})
