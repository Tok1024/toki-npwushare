import type { OverviewData } from '~/types/api/admin'

export const APPLICANT_STATUS_MAP: Record<number, string> = {
  0: '待处理',
  1: '已处理',
  2: '已同意',
  3: '已拒绝'
}

export const ADMIN_LOG_TYPE_MAP: Record<string, string> = {
  create: '创建',
  delete: '删除',
  approve: '同意',
  decline: '拒绝',
  update: '更改'
}

export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/wmv', 'video/webm']

export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.wmv', '.webm']

export const ADMIN_STATS_MAP: Record<keyof OverviewData, string> = {
  newUser: '新注册用户',
  newActiveUser: '新活跃用户',
  newCourse: '新发布课程',
  newResource: '新发布资源',
  newComment: '新发布评论'
}

export const ADMIN_STATS_SUM_MAP: Record<string, string> = {
  userCount: '用户总数',
  courseCount: '课程总数',
  resourceCount: '资源总数',
  commentCount: '评论总数',
  departmentCount: '学院总数'
}
