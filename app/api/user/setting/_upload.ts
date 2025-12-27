import sharp from 'sharp'
import { checkBufferSize } from '~/app/api/utils/checkBufferSize'
import { saveFileToPublic } from '~/app/api/utils/saveFileToPublic'

export const uploadUserAvatar = async (image: ArrayBuffer, uid: number) => {
  const avatar = await sharp(image)
    .resize(256, 256, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .avif({ quality: 60 })
    .toBuffer()
  const miniAvatar = await sharp(image)
    .resize(100, 100, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .avif({ quality: 50 })
    .toBuffer()

  if (!checkBufferSize(avatar, 1.007)) {
    return '图片体积过大'
  }

  const relativePath = `avatars/user_${uid}`
  
  await saveFileToPublic(relativePath, 'avatar.avif', avatar)
  await saveFileToPublic(relativePath, 'avatar-mini.avif', miniAvatar)
}
