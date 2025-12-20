import {
  isCoursePath,
  isDepartmentPath,
  isUserPath,
  isDocPath
} from './matcher'
import { keyLabelMap } from './constants'
import { nwpushare } from '~/config/nwpushare'
import type { KunBreadcrumbItem } from './constants'

type NextParams = Record<string, string | Array<string> | undefined>

const pathToIgnore = ['/resource', '/register', '/redirect', '/settings']

const createCourseBreadcrumb = (
  params: NextParams,
  defaultItem: KunBreadcrumbItem,
  pageTitle: string
) => {
  const dept = params.dept as string
  const slug = params.slug as string
  return {
    ...defaultItem,
    key: `/course/${dept}/${slug}`,
    label: pageTitle,
    href: `/course/${dept}/${slug}`
  }
}

const createDepartmentBreadcrumb = (
  params: NextParams,
  defaultItem: KunBreadcrumbItem,
  pageTitle: string
) => {
  return {
    ...defaultItem,
    key: `/department/${params.slug}`,
    label: pageTitle,
    href: `/department/${params.slug}`
  }
}

const createUserBreadcrumb = (
  params: NextParams,
  defaultItem: KunBreadcrumbItem,
  pageTitle: string
) => {
  return {
    ...defaultItem,
    key: `/user/${params.id}`,
    label: pageTitle,
    href: `/user/${params.id}/resource`
  }
}

const createDocBreadcrumb = (
  params: NextParams,
  defaultItem: KunBreadcrumbItem,
  pageTitle: string
) => {
  return {
    ...defaultItem,
    key: `/doc/${params.slug}`,
    label: pageTitle,
    href: `/doc/${params.slug}`
  }
}

export const getKunPathLabel = (pathname: string): string => {
  const hasIgnorePath = pathToIgnore.some((p) => p === pathname)
  if (hasIgnorePath) {
    return keyLabelMap[pathname]
  }
  if (isDocPath(pathname)) {
    return pathname
  }

  for (const key in keyLabelMap) {
    const regex = new RegExp(`^${key.replace(/\[id\]/g, '\\d+')}$`)
    if (regex.test(pathname)) {
      return keyLabelMap[key]
    }
  }

  return keyLabelMap[pathname]
}

export const createBreadcrumbItem = (
  pathname: string,
  params: NextParams
): KunBreadcrumbItem[] => {
  if (pathname === '/') {
    return []
  }

  const label = getKunPathLabel(pathname)
  if (!label) {
    return []
  }

  const defaultItem: KunBreadcrumbItem = {
    key: pathname,
    label,
    href: pathname
  }

  const pageTitle = document.title
    .replace(` - ${nwpushare.titleShort}`, '')
    .replace(/\|.*$/, '')

  const hasIgnorePath = pathToIgnore.some((p) => p === pathname)
  if (hasIgnorePath) {
    return [defaultItem]
  }

  if (isCoursePath(pathname)) {
    const allCourseRoute: KunBreadcrumbItem = {
      key: 'course',
      label: '课程列表',
      href: '/course'
    }
    return [
      allCourseRoute,
      createCourseBreadcrumb(params, defaultItem, pageTitle)
    ]
  }
  if (isDepartmentPath(pathname)) {
    const allDepartmentRoute: KunBreadcrumbItem = {
      key: 'department',
      label: '学院列表',
      href: '/department'
    }
    return [
      allDepartmentRoute,
      createDepartmentBreadcrumb(params, defaultItem, pageTitle)
    ]
  }
  if (isUserPath(pathname)) {
    return [createUserBreadcrumb(params, defaultItem, pageTitle)]
  }
  if (isDocPath(pathname)) {
    const allDocRoute: KunBreadcrumbItem = {
      key: 'doc',
      label: '帮助文档',
      href: '/doc'
    }
    return [allDocRoute, createDocBreadcrumb(params, defaultItem, pageTitle)]
  }

  return [defaultItem]
}
