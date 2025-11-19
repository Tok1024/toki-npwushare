'use client'

import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Link } from '@heroui/link'
import { Tooltip } from '@heroui/tooltip'
import { Heart } from 'lucide-react'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import type { UserComment } from '~/types/api/user'

interface Props {
  comment: UserComment
}

export const UserCommentCard = ({ comment }: Props) => {
  return (
    <Card className="border border-default-100 shadow-sm hover:shadow-md transition-all bg-white/50 backdrop-blur-sm">
      <CardBody className="space-y-3 p-4">
        {comment.quotedUserUid && (
          <h4 className="space-x-2 text-sm">
            <span className="text-slate-400">回复给</span>
            <Link
              href={`/user/${comment.quotedUserUid}/resource`}
              className="text-blue-500 font-medium"
            >
              {comment.quotedUsername}
            </Link>
          </h4>
        )}

        <p className="text-slate-700 text-sm leading-relaxed">
          {comment.content}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-default-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">
              发布于 {formatDistanceToNow(comment.created)}
            </span>
            <div className="text-xs text-slate-500">
              位置{' '}
              <Link
                size="sm"
                href={`/${comment.patchUniqueId}`}
                className="text-blue-500 hover:underline"
              >
                {comment.patchName}
              </Link>
            </div>
          </div>

          <Tooltip content="点赞数">
            <div className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors cursor-default">
              <Heart className="size-3.5" />
              {comment.like}
            </div>
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  )
}
