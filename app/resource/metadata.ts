import { nwpushare } from '~/config/nwpushare'
import {
  SUPPORTED_LANGUAGE_MAP,
  SUPPORTED_PLATFORM,
  SUPPORTED_TYPE_MAP
} from '~/constants/resource'
import type { Metadata } from 'next'

export const kunMetadata: Metadata = {
  title: '课程资源库 - NWPUShare',
  description: `集中浏览所有课程的资料与工具，类型包括 ${Object.values(SUPPORTED_TYPE_MAP)}，支持多语种与多平台。`,
  openGraph: {
    title: '课程资源库 - NWPUShare',
    description: `集中浏览所有课程的资料与工具，类型包括 ${Object.values(SUPPORTED_TYPE_MAP)}, 支持 ${Object.values(SUPPORTED_LANGUAGE_MAP)}, 包含 ${Object.values(SUPPORTED_PLATFORM)}。`,
    type: 'website',
    images: nwpushare.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '课程资源库 - NWPUShare',
    description: `集中浏览所有课程的资源与工具，类型包含 ${Object.values(SUPPORTED_TYPE_MAP)}。`
  },
  alternates: {
    canonical: `${nwpushare.domain.main}/resource`
  }
}
