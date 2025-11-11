import { convert } from 'html-to-text'
import type { PatchComment } from '~/types/api/patch'

export const nestCourseComments = (flatComments: PatchComment[]): PatchComment[] => {
  const commentMap: { [key: number]: PatchComment } = {}
  flatComments.forEach((c) => {
    c.reply = []
    commentMap[c.id] = { ...c, quotedContent: null }
  })
  const nested: PatchComment[] = []
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

