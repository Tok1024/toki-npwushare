import { createTransport } from 'nodemailer'
import SMPTransport from 'nodemailer-smtp-transport'
import { getRemoteIp } from './getRemoteIp'
import { getKv, setKv } from '~/lib/redis'
import { generateRandomString } from '~/utils/random'
import { kunMoyuMoe } from '~/config/moyu-moe'
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
    console.log(`[dev-email-code] ${email} -> ${code}`)
    return
  }

  const transporter = createTransport(
    SMPTransport({
      pool: {
        pool: true
      },
      host: process.env.KUN_VISUAL_NOVEL_EMAIL_HOST,
      port: Number(process.env.KUN_VISUAL_NOVEL_EMAIL_PORT) || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.KUN_VISUAL_NOVEL_EMAIL_ACCOUNT,
        pass: process.env.KUN_VISUAL_NOVEL_EMAIL_PASSWORD
      }
    })
  )

  const mailOptions = {
    from: `${process.env.KUN_VISUAL_NOVEL_EMAIL_FROM}<${process.env.KUN_VISUAL_NOVEL_EMAIL_ACCOUNT}>`,
    sender: process.env.KUN_VISUAL_NOVEL_EMAIL_ACCOUNT,
    to: email,
    subject: `${kunMoyuMoe.titleShort} - 验证码`,
    html: createKunVerificationEmailTemplate(type, code)
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Send email error:', error)
    return '邮件发送失败, 请检查后台日志或联系管理员'
  }
}
