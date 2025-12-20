import { Card, CardBody } from '@heroui/card'
import { FileText, MessageCircle, MessageSquareMore, Star } from 'lucide-react'
import type { UserInfo } from '~/types/api/user'

export const UserStats = ({ user }: { user: UserInfo }) => {
  const stats = [
    {
      label: '发布资源',
      value: user.resource_upload_count || 0,
      icon: FileText
    },
    { label: '评论', value: user._count.comments || 0, icon: MessageCircle },
    { label: '消息', value: user._count.send_message || 0, icon: MessageSquareMore },
    { label: '收藏', value: user._count.course_favorites || 0, icon: Star }
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="w-full">
          <CardBody className="flex flex-row items-center gap-4 p-4">
            <stat.icon className="size-8 text-primary" />
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-small text-default-500">{stat.label}</p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
