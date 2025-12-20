import { Card, CardBody } from '@heroui/card'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { ThumbsUp } from 'lucide-react'
import { formatDate } from '~/utils/time'
import Link from 'next/link'
import type { Comment } from '~/types/api/comment'

interface Props {
  comment: Comment
}

export const CommentCard = ({ comment }: Props) => {
  return (
    <Card
      isPressable
      as={Link}
      href={`/${comment.uniqueId}`}
      className="w-full border border-default-100 shadow-sm hover:shadow-md transition-all bg-white/50 backdrop-blur-sm"
    >
      <CardBody className="p-4">
        <div className="flex gap-4">
          <KunAvatar
            uid={comment.user.id}
            avatarProps={{
              name: comment.user.name,
              src: comment.user.avatar,
              className: 'w-10 h-10'
            }}
          />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-slate-800">{comment.user.name}</h2>
              <span className="text-xs text-slate-400">
                评论在{' '}
                <span className="text-blue-500 font-medium">
                  {comment.patchName}
                </span>
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {comment.content}
            </p>
            <div className="flex items-center gap-4 mt-2 pt-1">
              <div className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 transition-colors">
                <ThumbsUp size={14} />
                {comment.like}
              </div>
              <span className="text-xs text-slate-400">
                {formatDate(comment.created, {
                  isPrecise: true,
                  isShowYear: true
                })}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
