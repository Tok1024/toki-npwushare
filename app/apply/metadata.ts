import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '申请成为创作者',
  description: `申请成为创作者以获得使用本站存储的权限, 自由的上传学习资源, 使用最快最先进的 S3 对象存储`,
  openGraph: {
    title: '申请成为创作者',
    description: `申请成为创作者以获得使用本站存储的权限, 自由的上传学习资源, 使用最快最先进的 S3 对象存储`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '申请成为创作者',
    description: `申请成为创作者以获得使用本站存储的权限, 自由的上传学习资源, 使用最快最先进的 S3 对象存储`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/apply`
  }
}
