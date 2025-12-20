/**
 * 资源状态颜色映射
 * 用于统一UI中的状态显示
 */

export type ResourceStatus = 'draft' | 'pending' | 'published' | 'rejected'

export type StatusColor = 'default' | 'warning' | 'success' | 'danger'

/**
 * 资源状态对应的颜色
 */
export const RESOURCE_STATUS_COLOR: Record<ResourceStatus, StatusColor> = {
  draft: 'default',
  pending: 'warning',
  published: 'success',
  rejected: 'danger'
} as const

/**
 * 资源状态对应的中文名称
 */
export const RESOURCE_STATUS_TEXT: Record<ResourceStatus, string> = {
  draft: '草稿',
  pending: '审核中',
  published: '已发布',
  rejected: '已拒绝'
} as const

/**
 * 获取状态颜色
 */
export function getStatusColor(status: ResourceStatus): StatusColor {
  return RESOURCE_STATUS_COLOR[status] || 'default'
}

/**
 * 获取状态文本
 */
export function getStatusText(status: ResourceStatus): string {
  return RESOURCE_STATUS_TEXT[status] || status
}
