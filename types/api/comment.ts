export interface Comment {
  id: number
  uniqueId: string
  user: KunUser
  content: string
  patchName?: string
  patchId?: number
  like?: number
  created: Date | string
  updated?: Date | string
  isLike?: boolean
  likeCount?: number
  parentId?: number | null
  userId?: number
  reply?: Comment[]
  quotedContent?: string | null
  quotedUsername?: string | null
}
