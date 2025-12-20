import { z } from 'zod'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { verifyPassword } from '~/app/api/utils/algorithm'
import { generateKunToken } from '~/app/api/utils/jwt'
import { loginSchema } from '~/validations/auth'
import { prisma } from '~/prisma/index'
import { checkKunCaptchaExist } from '~/app/api/utils/verifyKunCaptcha'
import { getRedirectConfig } from '~/app/api/admin/setting/redirect/getRedirectConfig'
import type { UserState } from '~/store/userStore'

export const login = async (
  input: z.infer<typeof loginSchema>
): Promise<UserState | string> => {
  const { name, password, captcha } = input
  // 暂时关闭人机验证，如果要恢复请重新调用 checkKunCaptchaExist
  const res = true

  const normalizedName = name.toLowerCase()

  // MySQL不支持mode: 'insensitive'，使用原始查询实现大小写不敏感
  const user = await prisma.$queryRaw<
    Array<{
      id: number
      name: string
      email: string
      password: string
      avatar: string
      bio: string
      point: number
      role: number
      status: number
      daily_check_in: number
      daily_image_count: number
      daily_upload_size: number
      enable_email_notice: boolean
    }>
  >`
    SELECT * FROM user
    WHERE LOWER(email) = ${normalizedName}
       OR LOWER(name) = ${normalizedName}
    LIMIT 1
  `

  if (!user || user.length === 0) {
    return '用户未找到'
  }

  const foundUser = user[0]
  if (foundUser.status === 2) {
    return '该用户已被封禁, 如果您觉得有任何问题, 请联系我们'
  }

  const isPasswordValid = await verifyPassword(password, foundUser.password)
  if (!isPasswordValid) {
    return '用户密码错误'
  }

  const token = await generateKunToken(
    foundUser.id,
    foundUser.name,
    foundUser.role,
    '30d'
  )
  const cookie = await cookies()
  cookie.set('toki-nwpushare-access-token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  })

  const redirectConfig = await getRedirectConfig()
  const responseData: UserState = {
    uid: foundUser.id,
    name: foundUser.name,
    avatar: foundUser.avatar,
    bio: foundUser.bio,
    point: foundUser.point,
    role: foundUser.role,
    dailyCheckIn: foundUser.daily_check_in,
    dailyImageLimit: foundUser.daily_image_count,
    dailyUploadLimit: foundUser.daily_upload_size,
    enableEmailNotice: foundUser.enable_email_notice,
    ...redirectConfig
  }

  return responseData
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, loginSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await login(input)
  return NextResponse.json(response)
}
