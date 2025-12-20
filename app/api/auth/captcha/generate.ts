import crypto from 'crypto'
import { setKv } from '~/lib/redis'
import sharp from 'sharp'

// 生成随机验证码：4个字符，混合大小写字母和数字
const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 生成验证码图片
const generateCaptchaImage = async (code: string): Promise<string> => {
  const width = 200
  const height = 80

  // 使用 SVG 生成验证码图片
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="#f5f5f5" />

      <!-- 干扰线 -->
      <line x1="10" y1="20" x2="190" y2="70" stroke="#ddd" stroke-width="1" />
      <line x1="20" y1="70" x2="180" y2="10" stroke="#ddd" stroke-width="1" />
      <line x1="5" y1="50" x2="195" y2="50" stroke="#ddd" stroke-width="1" />

      <!-- 验证码文字 -->
      <text x="50" y="55" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#333" opacity="0.9">
        ${code
          .split('')
          .map((char, i) => `<tspan x="${30 + i * 40}">${char}</tspan>`)
          .join('')}
      </text>
    </svg>
  `

  const imageBuffer = await sharp(Buffer.from(svg)).png().toBuffer()

  return `data:image/png;base64,${imageBuffer.toString('base64')}`
}

export const generateCaptcha = async () => {
  const sessionId = crypto.randomUUID()
  const captchaCode = generateRandomCode()

  // 生成验证码图片
  const imageData = await generateCaptchaImage(captchaCode)

  // 保存验证码到 Redis，有效期 5 分钟
  await setKv(`captcha:generate:${sessionId}`, captchaCode, 5 * 60)

  return {
    sessionId,
    image: imageData
  }
}
