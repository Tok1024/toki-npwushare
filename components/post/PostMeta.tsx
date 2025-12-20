import { CalendarDays } from 'lucide-react'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { formatDate } from '~/utils/time'

interface Props {
  authorName?: string
  authorAvatar?: string | null
  authorId?: number | string
  created?: string | Date
  statusLabel?: string
}

const safeAuthorName = (name?: string): string => name ?? '匿名用户'

export const PostMeta = ({
  authorName,
  authorAvatar,
  authorId,
  created,
  statusLabel
}: Props) => {
  const renderAvatar = () => {
    if (typeof authorId !== 'number') {
      return null
    }
    return (
      <KunAvatar
        uid={authorId}
        avatarProps={{
          radius: 'full',
          size: 'sm',
          name: safeAuthorName(authorName),
          src: authorAvatar || '',
          className: 'shrink-0'
        }}
      />
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-default-500">
      <div className="flex items-center gap-2">
        {renderAvatar()}
        <span className="font-medium text-default-700">{safeAuthorName(authorName)}</span>
      </div>

      {created && (
        <div className="flex items-center gap-1 text-default-500">
          <CalendarDays className="h-4 w-4" />
          <time>{formatDate(created, { isPrecise: true, isShowYear: true })}</time>
        </div>
      )}

      {statusLabel && (
        <span className="inline-flex items-center rounded border border-warning-200 bg-warning-50 px-2 py-0.5 text-xs text-warning-700">
          {statusLabel}
        </span>
      )}
    </div>
  )
}
