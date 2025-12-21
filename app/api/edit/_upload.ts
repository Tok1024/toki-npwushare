import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { checkBufferSize } from '~/app/api/utils/checkBufferSize'

export const uploadPatchBanner = async (image: ArrayBuffer, id: number) => {
  const banner = await sharp(image)
    .resize(1920, 1080, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .avif({ quality: 60 })
    .toBuffer()
  const miniBanner = await sharp(image)
    .resize(460, 259, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .avif({ quality: 60 })
    .toBuffer()

  if (!checkBufferSize(miniBanner, 1.007)) {
    return '图片体积过大'
  }

  const bannerDir = join(process.cwd(), 'public', 'patch', `${id}`, 'banner')
  await mkdir(bannerDir, { recursive: true })

  await writeFile(join(bannerDir, 'banner.avif'), banner)
  await writeFile(join(bannerDir, 'banner-mini.avif'), miniBanner)
}
