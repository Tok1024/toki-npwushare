import { convert } from 'html-to-text'
import type { Comment } from '~/types/api/comment'

export const nestCourseComments = (flatComments: Comment[]): Comment[] => {
  const commentMap: { [key: number]: Comment } = {}
  flatComments.forEach((c) => {
    c.reply = []
    commentMap[c.id] = { ...c, quotedContent: null }
  })
  const nested: Comment[] = []
  flatComments.forEach((c) => {
    if (c.parentId) {
      const parent = commentMap[c.parentId]
      if (parent) {
        parent.reply.push(c)
        c.quotedContent = convert(commentMap[c.parentId].content).slice(0, 107)
        c.quotedUsername = commentMap[c.parentId].user.name
      }
    } else {
      nested.push(c)
    }
  })
  return nested
}
