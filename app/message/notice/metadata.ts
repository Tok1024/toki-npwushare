import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '通知消息',
  description: `这是通知消息页面, 本页面展示了 ${nwpushare.titleShort} 用户的被赞, 评论, 被回复, 被关注, 关注者, 私信 消息`,
  openGraph: {
    title: '通知消息',
    description: `这是通知消息页面, 本页面展示了 ${nwpushare.titleShort} 用户的被赞, 评论, 被回复, 被关注, 关注者, 私信 消息`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '通知消息',
    description: `这是通知消息页面, 本页面展示了 ${nwpushare.titleShort} 用户的被赞, 评论, 被回复, 被关注, 关注者, 私信 消息`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/message/system`
  }
}
