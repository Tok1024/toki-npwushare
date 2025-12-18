import { Resend } from 'resend'
import { getRemoteIp } from './getRemoteIp'
import { getKv, setKv } from '~/lib/redis'
import { generateRandomString } from '~/utils/random'
import { createKunVerificationEmailTemplate } from '~/constants/email/verify-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationCodeEmail = async (
  headers: Headers,
  email: string,
  type: 'register' | 'forgot' | 'reset'
) => {
  const ip = getRemoteIp(headers)
  const isEmailDisabled = process.env.KUN_DISABLE_EMAIL === 'true'
  const devCode = process.env.KUN_VERIFICATION_CODE || '1234567'

  // 频率限制
  const limitEmail = await getKv(`limit:email:${email}`)
  const limitIP = await getKv(`limit:ip:${ip}`)
  if (limitEmail || limitIP) {
    return '您发送邮件的频率太快了, 请 60 秒后重试'
  }

  // 生成验证码
  const code = isEmailDisabled ? devCode : generateRandomString(7)
  await setKv(email, code, 10 * 60) // 10 分钟有效
  await setKv(`limit:email:${email}`, code, 60) // 60 秒限制
  await setKv(`limit:ip:${ip}`, code, 60)

  // 开发环境：打印验证码
  if (isEmailDisabled) {
    console.log(`[dev-email-code] ${email} -> ${code}`)
    return
  }

  // 生产环境：使用 Resend 发送
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NWPUShare <noreply@resend.dev>',
      to: email,
      subject: 'NWPUShare - 验证码',
      html: createKunVerificationEmailTemplate(type, code)
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    return '邮件发送失败，请稍后重试'
  }
}
