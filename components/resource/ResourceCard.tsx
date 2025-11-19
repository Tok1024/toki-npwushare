import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Download, Heart, FileText } from 'lucide-react'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import { KunPatchAttribute } from '~/components/kun/PatchAttribute'
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
      className="w-full border border-default-100 shadow-sm hover:shadow-md transition-all bg-white/50 backdrop-blur-sm group"
    >
      <CardBody className="p-4 gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {resource.patchName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <KunUser
                  user={resource.user}
                  userProps={{
                    name: resource.user.name,
                    description: '',
                    avatarProps: {
                      size: 'sm',
                      className: 'w-4 h-4',
                      src: resource.user.avatar,
                      name: resource.user.name.charAt(0).toUpperCase()
                    }
                  }}
                />
                <span>•</span>
                <span>{formatDistanceToNow(resource.created)}</span>
              </div>
            </div>
          </div>

          <Chip
            size="sm"
            variant="flat"
            className="bg-slate-100 text-slate-600"
          >
            {resource.size}
          </Chip>
        </div>

        {resource.name && (
          <p className="text-sm text-slate-600 line-clamp-2 pl-[3.25rem]">
            {resource.name}
          </p>
        )}

        <div className="pl-[3.25rem]">
          <KunPatchAttribute
            types={resource.type}
            languages={resource.language}
            platforms={resource.platform}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 pl-[3.25rem] mt-1">
          <div className="flex items-center gap-1 hover:text-rose-500 transition-colors">
            <Heart className="w-3.5 h-3.5" />
            {resource.likeCount}
          </div>
          <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Download className="w-3.5 h-3.5" />
            {resource.download}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
