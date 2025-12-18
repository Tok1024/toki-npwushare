import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { checkBufferSize } from '~/app/api/utils/checkBufferSize'

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

  // 保存到 public/avatars/user_{uid}/ 目录
  const avatarDir = join(process.cwd(), 'public', 'avatars', `user_${uid}`)
  await mkdir(avatarDir, { recursive: true })

  await writeFile(join(avatarDir, 'avatar.avif'), avatar)
  await writeFile(join(avatarDir, 'avatar-mini.avif'), miniAvatar)
}
