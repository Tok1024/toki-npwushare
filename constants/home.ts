import { BookOpen, Share2, MessageSquare } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

interface HomeNavItem {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  label: string
  href: string
  color: 'primary' | 'secondary' | 'success'
  isExternal: boolean
}

export const homeNavigationItems: HomeNavItem[] = [
  {
    icon: BookOpen,
    label: '课程目录',
    href: '/course',
    color: 'primary',
    isExternal: false
  },
  {
    icon: Share2,
    label: '上传资源',
    href: '/resource',
    color: 'secondary',
    isExternal: false
  },
  {
    icon: MessageSquare,
    label: '经验帖',
    href: '/doc',
    color: 'success',
    isExternal: false
  }
]
