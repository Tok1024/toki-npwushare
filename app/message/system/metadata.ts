import { nwpushare } from '~/config/nwpushare'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '系统消息',
  description: `这是系统消息页面, 本页面展示了 ${nwpushare.titleShort} 系统发送给全体用户的消息`,
  openGraph: {
    title: '系统消息',
    description: `这是系统消息页面, 本页面展示了 ${nwpushare.titleShort} 系统发送给全体用户的消息`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '系统消息',
    description: `这是系统消息页面, 本页面展示了 ${nwpushare.titleShort} 系统发送给全体用户的消息`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/message/system`
  }
}
