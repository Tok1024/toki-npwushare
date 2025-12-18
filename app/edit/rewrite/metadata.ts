import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '编辑课程资源',
  description:
    '更改已经发布的课程信息, 介绍, 标签, 资料链接等, 然后提出 pull request',
  openGraph: {
    title: '编辑课程资源',
    description:
      '更改已经发布的课程信息, 介绍, 标签, 资料链接等, 然后提出 pull request',
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '编辑课程资源',
    description:
      '更改已经发布的课程信息, 介绍, 标签, 资料链接等, 然后提出 pull request'
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/edit/rewrite`
  }
}
