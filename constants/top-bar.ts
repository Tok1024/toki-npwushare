export interface KunNavItem {
  name: string
  href: string
}

export const kunNavItem: KunNavItem[] = [
  {
    name: '浏览课程',
    href: '/course'
  },
  {
    name: '浏览资源',
    href: '/resource'
  },
  {
    name: '学院',
    href: '/department'
  },
  {
    name: '帮助',
    href: '/doc'
  },
  {
    name: '上传资源',
    href: '/edit/create'
  }
]

export const kunMobileNavItem: KunNavItem[] = [
  ...kunNavItem,
  {
    name: '讨论版',
    href: '/comment'
  },
  {
    name: '经验帖子',
    href: '/doc'
  },
  {
    name: '联系我们',
    href: '/doc/notice/feedback'
  }
]
