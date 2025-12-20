import crypto from 'crypto'
import { setKv } from '~/lib/redis'

// 生成随机验证码：4个字符，混合大小写字母和数字
const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 生成验证码图片（使用 SVG）
const generateCaptchaImage = (code: string): string => {
  const width = 200
  const height = 80

  // 使用纯 SVG，不转换为 PNG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="#f5f5f5" />

      <!-- 干扰线 -->
      <line x1="10" y1="20" x2="190" y2="70" stroke="#ddd" stroke-width="2" />
      <line x1="20" y1="70" x2="180" y2="10" stroke="#ddd" stroke-width="2" />
      <line x1="5" y1="50" x2="195" y2="50" stroke="#ddd" stroke-width="1" />

      <!-- 验证码文字 -->
      <text x="50" y="60" font-family="Arial, monospace" font-size="48" font-weight="bold" fill="#333" letter-spacing="5">
        ${code.split('').map((char, i) => `<tspan x="${20 + i * 45}" dy="${Math.random() * 10 - 5}">${char}</tspan>`).join('')}
      </text>
    </svg>
  `

  // 直接返回 SVG 的 data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export const generateCaptcha = async () => {
  const sessionId = crypto.randomUUID()
  const captchaCode = generateRandomCode()

  // 生成验证码图片
  const imageData = generateCaptchaImage(captchaCode)

  // 保存验证码到 Redis，有效期 5 分钟
  await setKv(`captcha:generate:${sessionId}`, captchaCode, 5 * 60)

  return {
    sessionId,
    image: imageData
  }
}
