import { Chip } from '@heroui/chip'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Image } from '@heroui/image'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { RESOURCE_STATUS_COLOR, getStatusText } from '~/constants/statusColor'

import type { UserResource as UserResourceType } from '~/types/api/user'

interface Props {
  resource: UserResourceType
  isSelf?: boolean
  onChanged?: () => void
}

export const UserResourceCard = ({ resource, isSelf, onChanged }: Props) => {
  const bannerImageSrc = '/default-resource.avif'

  return (
    <Card
      isPressable
      as={Link}
      href={`/${resource.patchUniqueId}`}
      className="w-full"
    >
      <CardBody className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:h-auto sm:w-40">
            <Image
              src={bannerImageSrc}
              alt={resource.title}
              className="object-cover rounded-lg size-full max-h-52"
              radius="lg"
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <h2 className="text-lg font-semibold transition-colors line-clamp-2 hover:text-primary-500">
                {resource.title}
              </h2>
              <div className="flex items-center gap-2">
                {resource.status && (
                  <Chip size="sm" variant="flat" color={RESOURCE_STATUS_COLOR[resource.status]}>
                    {resource.status}
                  </Chip>
                )}
                <Chip variant="flat">{formatDistanceToNow(resource.created)}</Chip>
              </div>
            </div>

            {isSelf && (
              <div className="flex items-center gap-2">
                {resource.status === 'draft' && (
                  <Button
                    size="sm"
                    color="primary"
                    onPress={async (e) => {
                      e.preventDefault()
                      try {
                        const res = await fetch(`/api/resource/${resource.id}/status`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'pending' })
                        })
                        const data = await res.json().catch(() => null)
                        if (!res.ok || typeof data === 'string') return toast.error(typeof data === 'string' ? data : '提交失败')
                        toast.success('已提交审核')
                        onChanged?.()
                      } catch {
                        toast.error('请求失败')
                      }
                    }}
                  >
                    提交审核
                  </Button>
                )}
                {resource.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={async (e) => {
                      e.preventDefault()
                      try {
                        const res = await fetch(`/api/resource/${resource.id}/status`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'draft' })
                        })
                        const data = await res.json().catch(() => null)
                        if (!res.ok || typeof data === 'string') return toast.error(typeof data === 'string' ? data : '操作失败')
                        toast.success('已转为草稿')
                        onChanged?.()
                      } catch {
                        toast.error('请求失败')
                      }
                    }}
                  >
                    转为草稿
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
