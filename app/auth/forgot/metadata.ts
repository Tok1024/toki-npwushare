import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '忘记密码 | 找回密码',
  description: `忘记了您的 ${nwpushare.titleShort} 账号, 您可以通过邮箱, 用户找回密码和账号`,
  openGraph: {
    title: '忘记密码 | 找回密码',
    description: `忘记了您的 ${nwpushare.titleShort} 账号, 您可以通过邮箱, 用户找回密码和账号`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '忘记密码 | 找回密码',
    description: `忘记了您的 ${nwpushare.titleShort} 账号, 您可以通过邮箱, 用户找回密码和账号`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/auth/forgot`
  }
}
