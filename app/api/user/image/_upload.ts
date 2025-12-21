import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

import { checkBufferSize } from '~/app/api/utils/checkBufferSize'

export const uploadIntroductionImage = async (
  name: string,
  image: ArrayBuffer,
  uid: number
) => {
  const minImage = await sharp(image)
    .resize(1920, 1080, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .avif({ quality: 30 })
    .toBuffer()

  if (!checkBufferSize(minImage, 1.007)) {
    return '图片体积过大'
  }

  // Save to public/ so it can be served directly by Next static assets
  const dir = join(process.cwd(), 'public', 'user', 'image', String(uid))
  await mkdir(dir, { recursive: true })
  const filePath = join(dir, `${name}.avif`)
  await writeFile(filePath, minImage)
}
