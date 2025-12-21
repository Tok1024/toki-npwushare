import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Download, Heart, FileText } from 'lucide-react'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import { KunUser } from '../kun/floating-card/KunUser'
import type { PatchResource } from '~/types/api/resource'

interface Props {
  resource: PatchResource
}

export const ResourceCard = ({ resource }: Props) => {
  return (
    <Card
      isPressable
      as={Link}
      href={`/${resource.uniqueId}`}
      className="w-full border-none shadow-sm hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50/80 group"
    >
      <CardBody className="p-5 gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
            <FileText className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-2">
              {resource.patchName}
            </h2>

            {resource.name && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {resource.name}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <KunUser
                user={resource.user}
                userProps={{
                  name: resource.user.name,
                  description: '',
                  avatarProps: {
                    size: 'sm',
                    className: 'w-5 h-5',
                    src: resource.user.avatar,
                    name: resource.user.name.charAt(0).toUpperCase()
                  }
                }}
              />
              <span className="text-gray-300">•</span>
              <span>{formatDistanceToNow(resource.created)}</span>
              {resource.size && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium text-gray-600">{resource.size}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {(resource.type.length > 0 || resource.language.length > 0 || resource.platform.length > 0) && (
          <div className="pt-1 flex flex-wrap gap-2">
            {resource.type.map((t) => (
              <Chip key={`type-${t}`} size="sm" variant="flat" color="primary">
                {t}
              </Chip>
            ))}
            {resource.language.map((l) => (
              <Chip key={`lang-${l}`} size="sm" variant="flat" color="secondary">
                {l}
              </Chip>
            ))}
            {resource.platform.map((p) => (
              <Chip key={`plat-${p}`} size="sm" variant="flat">
                {p}
              </Chip>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-500 transition-colors cursor-pointer">
              <Heart className="w-4 h-4" />
              <span className="font-medium">{resource.likeCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors cursor-pointer">
              <Download className="w-4 h-4" />
              <span className="font-medium">{resource.download}</span>
            </div>
          </div>

          <div className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            查看详情 →
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
