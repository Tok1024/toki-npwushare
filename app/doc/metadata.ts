import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '帮助文档 | 网站博客',
  description: `${nwpushare.titleShort} 是一个非盈利的, 由社区驱动的, 完全开源免费的 Galgame 资源下载网站。它由现代框架 Next.js 驱动, 为保证最好的性能, 恳请各位朋友提出宝贵的意见`,
  openGraph: {
    title: '帮助文档 | 网站博客',
    description: `${nwpushare.titleShort} 是一个非盈利的, 由社区驱动的, 完全开源免费的 Galgame 资源下载网站。它由现代框架 Next.js 驱动, 为保证最好的性能, 恳请各位朋友提出宝贵的意见`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '帮助文档 | 网站博客',
    description: `${nwpushare.titleShort} 是一个非盈利的, 由社区驱动的, 完全开源免费的 Galgame 资源下载网站。它由现代框架 Next.js 驱动, 为保证最好的性能, 恳请各位朋友提出宝贵的意见`
  }
}
