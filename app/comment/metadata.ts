import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '课程评论',
  description: `最新发布的课程评论列表, 包括对课程的看法, 对资源的评分, 对学习经验的分享等等`,
  openGraph: {
    title: '课程评论',
    description: `最新发布的课程评论列表, 包括对课程的看法, 对资源的评分, 对学习经验的分享等等`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '课程评论',
    description: `最新发布的课程评论列表, 包括对课程的看法, 对资源的评分, 对学习经验的分享等等`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/comment`
  }
}
