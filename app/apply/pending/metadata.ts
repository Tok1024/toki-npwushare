import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '申请已经提交 | 审核中',
  description: `感谢您申请成为创作者! 我们会在数小时内审核您的请求! 创作者请求正在审核中`,
  openGraph: {
    title: '申请已经提交 | 审核中',
    description: `感谢您申请成为创作者! 我们会在数小时内审核您的请求! 创作者请求正在审核中`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '申请已经提交 | 审核中',
    description: `感谢您申请成为创作者! 我们会在数小时内审核您的请求! 创作者请求正在审核中`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/apply`
  }
}
