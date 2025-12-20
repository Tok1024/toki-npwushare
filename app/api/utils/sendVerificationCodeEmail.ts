import { Resend } from 'resend'
import { getRemoteIp } from './getRemoteIp'
import { getKv, setKv } from '~/lib/redis'
import { generateRandomString } from '~/utils/random'
import { nwpushare } from '~/config/nwpushare'
import { createKunVerificationEmailTemplate } from '~/constants/email/verify-templates'

export const sendVerificationCodeEmail = async (
  headers: Headers,
  email: string,
  type: 'register' | 'forgot' | 'reset'
) => {
  const ip = getRemoteIp(headers)
  const isEmailDisabled = process.env.KUN_DISABLE_EMAIL === 'true'
  const devCode = process.env.KUN_VERIFICATION_CODE || 'dev-1234567'

  const limitEmail = await getKv(`limit:email:${email}`)
  const limitIP = await getKv(`limit:ip:${ip}`)
  if (limitEmail || limitIP) {
    return '您发送邮件的频率太快了, 请 60 秒后重试'
  }

  const code = isEmailDisabled ? devCode : generateRandomString(7)
  await setKv(email, code, 10 * 60)
  await setKv(`limit:email:${email}`, code, 60)
  await setKv(`limit:ip:${ip}`, code, 60)

  if (isEmailDisabled) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[dev-email-code] ${email} -> ${code}`)
    }
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const result = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        `${nwpushare.titleShort} <noreply@resend.dev>`,
      to: email,
      subject: `${nwpushare.titleShort} - 验证码`,
      html: createKunVerificationEmailTemplate(type, code)
    })
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Resend] Email sent successfully:', {
        id: result.data?.id,
        to: email,
        type
      })
    }
  } catch (error) {
    console.error('[Resend] Send email error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      email,
      type,
      hasApiKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL
    })
    return '邮件发送失败, 请检查后台日志或联系管理员'
  }
}
