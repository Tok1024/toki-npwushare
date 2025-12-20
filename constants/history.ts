export const HISTORY_ACTION_TYPE = [
  'create',
  'update',
  'delete',
  'merge',
  'decline'
] as const

export const HISTORY_ACTION_TYPE_MAP: Record<string, string> = {
  create: '创建了',
  update: '更新了',
  delete: '删除了',
  merge: '合并了',
  decline: '拒绝了'
}

export const HISTORY_TYPE = [
  'course',
  'resource',
  'department',
  'comment',
  'post'
] as const

export const HISTORY_TYPE_MAP: Record<string, string> = {
  course: '课程',
  resource: '资源',
  department: '学院',
  comment: '评论',
  post: '帖子'
}
