import DOMPurify from 'isomorphic-dompurify'
import type { PatchComment } from '~/types/api/patch'

export const CommentContent = ({ comment }: { comment: PatchComment }) => {
  return (
    <div
      className="kun-prose max-w-none"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
    />
  )
}

