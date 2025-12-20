export interface KunBreadcrumbItem {
  key: string
  label: string
  href: string
  icon?: string
}

export const keyLabelMap: Record<string, string> = {
  '/': '主页',
  '/doc': '帮助文档',
  '/admin/comment': '评论管理',
  '/admin/creator': '创作者管理',
  '/admin/log': '管理日志',
  '/admin': '管理页面',
  '/admin/resource': '资源管理',
  '/admin/user': '用户管理',
  '/apply': '创作者申请',
  '/apply/pending': '正在申请中',
  '/apply/success': '申请成功',
  '/auth/forgot': '忘记密码',
  '/comment': '评论',
  '/edit/create': '创建资源',
  '/course': '课程列表',
  '/department': '学院列表',
  '/login': '登录',
  '/message/follow': '关注消息',
  '/message/notice': '通知消息',
  '/message/system': '系统消息',
  '/register': '注册',
  '/resource': '资源浏览',
  '/search': '搜索',
  '/settings/user': '用户设置',
  '/user/[id]/comment': '用户评论',
  '/user/[id]/contribute': '用户贡献',
  '/user/[id]/resource': '用户资源'
}

export const dynamicRoutes = ['user', 'course', 'department', 'doc']
