import { delKv, getKv, setKv } from '~/lib/redis'
import { generateRandomString } from '~/utils/random'

export const verifyCaptcha = async (sessionId: string, captchaCode: string) => {
  const correctCode = await getKv(`captcha:generate:${sessionId}`)

  await delKv(`captcha:generate:${sessionId}`)

  if (!correctCode) {
    return '未找到您的验证请求，请重新验证'
  }

  // 不区分大小写比对
  if (captchaCode.toUpperCase() !== correctCode.toUpperCase()) {
    return '验证码输入错误，请重试'
  }

  const randomCode = generateRandomString(10)
  await setKv(`captcha:verify:${randomCode}`, 'captcha', 60 * 60)

  return { code: randomCode }
}

export const checkCaptchaExist = async (sessionId: string) => {
  const captcha = await getKv(`captcha:verify:${sessionId}`)
  if (captcha) {
    await delKv(`captcha:verify:${sessionId}`)
    return captcha
  }
}
