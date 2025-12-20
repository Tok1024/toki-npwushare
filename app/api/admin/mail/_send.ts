import crypto from 'crypto'
import { setKv } from '~/lib/redis'
import { Resend } from 'resend'
import { nwpushare } from '~/config/nwpushare'
import { emailTemplates } from '~/constants/email/group-templates'

const CACHE_KEY = 'auth:mail:notice'

const getEmailSubject = (selectedTemplate: string) => {
  const currentTemplate = emailTemplates.find((t) => t.id === selectedTemplate)
  if (!currentTemplate) {
    return nwpushare.titleShort
  }
  return `${nwpushare.titleShort} - ${currentTemplate.name}`
}

const getPreviewContent = (
  selectedTemplate: string,
  templateVars: Record<string, string>,
  email: string,
  validateEmailCode: string
) => {
  const currentTemplate = emailTemplates.find((t) => t.id === selectedTemplate)
  if (!currentTemplate) {
    return ''
  }

  const variables = {
    ...templateVars,
    email,
    validateEmailCode
  }

  let content = currentTemplate.template
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })

  return content
}

export const sendEmailHTML = async (
  templateId: string,
  variables: Record<string, string>,
  email: string
) => {
  const validateEmailCode = crypto.randomUUID()
  await setKv(`${CACHE_KEY}:${email}`, validateEmailCode, 7 * 24 * 60 * 60)
  const content = getPreviewContent(
    templateId,
    variables,
    email,
    validateEmailCode
  )

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const result = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        `${nwpushare.titleShort} <noreply@resend.dev>`,
      to: email,
      subject: getEmailSubject(templateId),
      html: content
    })
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Resend] Admin email sent successfully:', {
        id: result.data?.id,
        to: email,
        template: templateId
      })
    }
  } catch (error) {
    console.error('[Resend] Admin email error:', error)
    throw new Error('邮件发送失败')
  }
}
