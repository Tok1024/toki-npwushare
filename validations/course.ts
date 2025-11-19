import { z } from 'zod'
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

export const courseFeedbackCreateSchema = z.object({
  courseId: z.coerce.number().min(1).max(9999999),
  liked: z.boolean({ message: '请选择是否喜欢该课程' }),
  difficulty: z
    .union([z.coerce.number().min(1).max(5), z.null()])
    .optional(),
  comment: z
    .string()
    .trim()
    .max(1000, { message: '反馈内容最多 1000 字' })
    .optional()
})

export const courseFeedbackUpdateSchema = z.object({
  feedbackId: z.coerce.number().min(1).max(9999999),
  liked: z.boolean({ message: '请选择是否喜欢该课程' }),
  difficulty: z
    .union([z.coerce.number().min(1).max(5), z.null()])
    .optional(),
  comment: z
    .string()
    .trim()
    .max(1000, { message: '反馈内容最多 1000 字' })
    .optional()
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
