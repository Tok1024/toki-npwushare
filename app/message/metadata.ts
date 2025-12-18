import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '用户消息',
  description: `这是用户消息页面, 第一次访问对应的页面会自动已读所有消息`,
  openGraph: {
    title: '用户消息',
    description: `这是用户消息页面, 第一次访问对应的页面会自动已读所有消息`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '用户消息',
    description: `这是用户消息页面, 第一次访问对应的页面会自动已读所有消息`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/message`
  }
}
