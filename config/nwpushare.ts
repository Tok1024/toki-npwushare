import type { KunSiteConfig } from './config'

const SITE_NAME = 'NWPUShare'
const SITE_MENTION = '@toki'
const SITE_TITLE = 'NWPUShare - 瓜大校园学习资源共享站'
const SITE_IMAGE = '/touchgal.avif'
const SITE_DESCRIPTION =
  'NWPUShare 是一个专注于课程资料、经验分享与学习讨论的开放平台。任何人都可以上传课程链接、整理经验帖或参与评论。'
const SITE_URL = 'https://learn.toki.code'
const SITE_FORUM = 'https://forum.toki.campus'
const SITE_NAV = '/course'
const SITE_DISCORD = 'https://discord.gg/kun-touchgal'

export const nwpushare: KunSiteConfig = {
  title: SITE_TITLE,
  titleShort: SITE_NAME,
  template: `%s - ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  keywords: [
    'Toki',
    '学习资料',
    '课程资源',
    '校园经验',
    '自学分享',
    '课程评价',
    '西北工业大学'
  ],
  canonical: SITE_URL,
  author: [{ name: SITE_NAME, url: SITE_URL }],
  creator: {
    name: SITE_NAME,
    mention: SITE_MENTION,
    url: SITE_URL
  },
  publisher: {
    name: SITE_NAME,
    mention: SITE_MENTION,
    url: SITE_URL
  },
  domain: {
    main: SITE_URL,
    imageBed: SITE_URL,
    storage: SITE_URL,
    kungal: SITE_URL,
    telegram_group: SITE_URL,
    discord_group: SITE_DISCORD,
    archive: SITE_URL,
    forum: SITE_FORUM,
    nav: SITE_NAV
  },
  og: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    image: SITE_IMAGE,
    url: SITE_URL
  },
  images: [
    {
      url: SITE_IMAGE,
      width: 1000,
      height: 800,
      alt: SITE_TITLE
    }
  ]
}
