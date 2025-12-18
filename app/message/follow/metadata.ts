import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '关注消息',
  description: `这是关注消息页面, 本页面展示了 ${nwpushare.titleShort} 用户关注的人最新的动态, 最近发布的学习资源, 分享的课程经验等等`,
  openGraph: {
    title: '关注消息',
    description: `这是关注消息页面, 本页面展示了 ${nwpushare.titleShort} 用户关注的人最新的动态, 最近发布的学习资源, 分享的课程经验等等`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '关注消息',
    description: `这是关注消息页面, 本页面展示了 ${nwpushare.titleShort} 用户关注的人最新的动态, 最近发布的学习资源, 分享的课程经验等等`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/message/system`
  }
}
