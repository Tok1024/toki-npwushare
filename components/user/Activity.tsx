'use client'

import { Card, CardBody } from '@heroui/card'
import { Tab, Tabs } from '@heroui/tabs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface UserActivityProps {
  id: number
}

export const UserActivity = ({ id }: UserActivityProps) => {
  const pathname = usePathname()
  const lastSegment = pathname.split('/').filter(Boolean).pop()

  const tabs = [
    { key: 'comment', title: '评论', href: `/user/${id}/comment` },
    { key: 'favorite', title: '收藏夹', href: `/user/${id}/favorite` },
    { key: 'resource', title: '发布资源', href: `/user/${id}/resource` }
  ]

  return (
    <Card className="w-full border border-default-100 shadow-sm bg-white/50 backdrop-blur-sm">
      <CardBody className="p-2">
        <Tabs
          aria-label="用户活动"
          variant="light"
          color="primary"
          fullWidth
          selectedKey={lastSegment}
          classNames={{
            tabList: 'gap-4',
            cursor: 'w-full bg-blue-500',
            tab: 'max-w-fit px-4 h-10',
            tabContent: 'group-data-[selected=true]:text-blue-600 font-medium'
          }}
        >
          {tabs.map(({ key, title, href }) => (
            <Tab key={key} as={Link} title={title} href={href} />
          ))}
        </Tabs>
      </CardBody>
    </Card>
  )
}
