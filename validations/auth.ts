import { z } from 'zod'
import {
  kunUsernameRegex,
  kunPasswordRegex,
  kunValidMailConfirmCodeRegex
} from '~/utils/validate'

export const loginSchema = z.object({
  name: z.string().trim().min(1, { message: '请输入用户名或邮箱' }),
  password: z.string().trim(),
  captcha: z.string().trim().optional()
})

export const registerSchema = z.object({
  name: z.string().regex(kunUsernameRegex, {
    message: '非法的用户名，用户名为 1~17 位任意字符'
  }),
  email: z
    .string()
    .email({ message: '请输入合法的邮箱格式' })
    .or(
      z.string().regex(kunUsernameRegex, {
        message: '非法的用户名，用户名为 1~17 位任意字符'
      })
    ),
  code: z.string().regex(kunValidMailConfirmCodeRegex, {
    message: '非法的邮箱验证码，验证码为 7 位数字和大小写字母组合'
  }),
  password: z.string().trim().regex(kunPasswordRegex, {
    message:
      '非法的密码格式，密码的长度为 6 到 1007 位，必须包含至少一个英文字符和一个数字，可以选择性的包含 @!#$%^&*()_-+=\\/ 等特殊字符'
  })
})

export const sendRegisterEmailVerificationCodeSchema = z.object({
  name: z.string().regex(kunUsernameRegex, {
    message: '非法的用户名，用户名为 1~17 位任意字符'
  }),
  email: z
    .string()
    .email({ message: '请输入合法的邮箱格式' })
    .or(
      z.string().regex(kunUsernameRegex, {
        message: '非法的用户名，用户名为 1~17 位任意字符'
      })
    ),
  captcha: z
    .string()
    .trim()
    .min(10, { message: '非法的人机验证码格式' })
    .max(10)
})

export const disableEmailNoticeSchema = z.object({
  email: z.string().email({ message: '非法的邮箱格式' }),
  validateEmailCode: z.string().uuid({ message: '非法的邮箱验证码格式' })
})

export const captchaSchema = z.object({
  sessionId: z.string().trim().uuid({ message: '非法的 sessionId 格式' }),
  captchaCode: z
    .string()
    .trim()
    .length(4, { message: '验证码必须是 4 位' })
    .regex(/^[A-Za-z0-9]+$/, { message: '验证码只能包含字母和数字' })
})
