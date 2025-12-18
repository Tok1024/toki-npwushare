import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: `注册 - ${nwpushare.titleShort}`,
  description: `注册成为 ${nwpushare.titleShort} 网站用户, 无门槛访问所有学习资源。希望明天对您来说又是美好的一天！`,
  keywords: [
    '注册',
    '学习资源网站注册',
    '创建账户',
    '课程资料下载',
    '免费注册'
  ],
  openGraph: {
    title: `注册 - ${nwpushare.titleShort}`,
    description: `注册成为 ${nwpushare.titleShort} 网站用户, 无门槛访问所有学习资源。希望明天对您来说又是美好的一天！`,
    url: `${nwpushare.domain.main}/register`,
    siteName: nwpushare.title,
    images: [
      {
        url: nwpushare.og.image,
        width: 1920,
        height: 1080,
        alt: `${nwpushare.titleShort} 注册页面`
      }
    ],
    locale: 'zh_CN',
    type: 'website'
  },
  verification: {
    google: 'google-site-verification-code'
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/register`,
    languages: {
      'zh-Hans': `${nwpushare.domain.main}/register`
    }
  }
}
