import { BookOpen, Share2, MessageSquare } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

interface HomeNavItem {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  label: string
  href: string
  color: 'primary' | 'secondary' | 'success' | 'warning'
  isExternal: boolean
  description: string
}

export const homeNavigationItems: HomeNavItem[] = [
  {
    icon: BookOpen,
    label: '课程目录',
    href: '/course',
    color: 'primary',
    isExternal: false,
    description: '按学院浏览与筛选课程'
  },
  {
    icon: Share2,
    label: '上传资源',
    href: '/resource',
    color: 'success',
    isExternal: false,
    description: '分享你的学习资料'
  },
  {
    icon: MessageSquare,
    label: '帮助',
    href: '/doc/help',
    color: 'warning',
    isExternal: false,
    description: '使用指南与帮助文档'
  }
]
