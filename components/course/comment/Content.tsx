import DOMPurify from 'isomorphic-dompurify'
import type { Comment } from '~/types/api/comment'

export const CommentContent = ({ comment }: { comment: Comment }) => {
  return (
    <div
      className="kun-prose max-w-none"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
    />
  )
}
