import sharp from 'sharp'
import { checkBufferSize } from '~/app/api/utils/checkBufferSize'
import { saveFileToPublic } from '~/app/api/utils/saveFileToPublic'

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

  const relativePath = `patch/${id}/banner`

  await saveFileToPublic(relativePath, 'banner.avif', banner)
  await saveFileToPublic(relativePath, 'banner-mini.avif', miniBanner)
}
