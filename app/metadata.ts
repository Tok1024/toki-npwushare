import { nwpushare } from '~/config/nwpushare'
import { generateNullMetadata } from '~/utils/noIndex'
import type { Metadata, Viewport } from 'next'

export const kunViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  colorScheme: 'light dark'
}

export const generateKunMetadata = (): Metadata => {
  if (process.env.KUN_VISUAL_NOVEL_TEST_SITE_LABEL) {
    return generateNullMetadata('测试站点')
  }

  return {
    metadataBase: new URL(nwpushare.domain.main),
    title: {
      default: nwpushare.title,
      template: nwpushare.template
    },
    description: nwpushare.description,
    keywords: nwpushare.keywords,
    authors: nwpushare.author,
    icons: {
      apple: '/apple-touch-icon.avif',
      icon: '/favicon.ico'
    },
    creator: nwpushare.creator.name,
    publisher: nwpushare.publisher.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false
    },
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: nwpushare.domain.main,
      title: nwpushare.title,
      description: nwpushare.description,
      siteName: nwpushare.title,
      images: nwpushare.images
    },
    twitter: {
      card: 'summary_large_image',
      title: nwpushare.title,
      description: nwpushare.description,
      creator: nwpushare.creator.mention,
      images: nwpushare.og.image
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    alternates: {
      canonical: nwpushare.canonical,
      languages: {
        'zh-Hans': nwpushare.domain.main
      }
    }
  }
}
