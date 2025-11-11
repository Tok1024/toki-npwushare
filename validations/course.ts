import { title } from 'process'
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

export const RESOURCE_TYPES = [
  'note',
  'slides',
  'assignment',
  'exam',
  'solution',
  'link',
  'other'
] as const

export const courseResourceCreateSchema = z.object({
  courseId: z.coerce.number().min(1).max(9999999).optional(),
  courseName: z
    .string()
    .trim()
    .min(1, { message: '课程名称最少为 1 个字符' })
    .max(200, { message: '课程名称最多为 200 个字符' })
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, { message: '标题最少为 1 个字符' })
    .max(200, { message: '标题最多为 200 个字符' }),
  type: z.enum(RESOURCE_TYPES),
  links: z
    .array(z.string().url({ message: '链接格式不正确' }))
    .min(1, { message: '请至少提供一个链接' })
    .max(20, { message: '最多提供 20 个链接' }),
  term: z.string().trim().max(32).optional(),
  teacherId: z.coerce.number().min(1).max(9999999).optional()
})
