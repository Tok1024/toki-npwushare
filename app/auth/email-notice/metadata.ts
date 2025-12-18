import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '退订邮件通知',
  description: `您可以在此处退订网站的邮件通知`,
  openGraph: {
    title: '退订邮件通知',
    description: `您可以在此处退订网站的邮件通知`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '退订邮件通知',
    description: `您可以在此处退订网站的邮件通知`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/auth/email-notice`
  }
}
