/**
 * 安全解析JSON字段
 * 用于处理MySQL中存储为TEXT的JSON字符串（如course.tags, resource.links）
 */

/**
 * 解析JSON字符串为数组
 * @param value - 可能是JSON字符串或已解析的数组
 * @param defaultValue - 解析失败时的默认值
 * @returns 解析后的数组
 */
export function parseJsonArray<T = string>(
  value: string | T[] | null | undefined,
  defaultValue: T[] = []
): T[] {
  // 如果为空，返回默认值
  if (!value) {
    return defaultValue
  }

  // 如果已经是数组，直接返回
  if (Array.isArray(value)) {
    return value
  }

  // 如果是字符串，尝试解析
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      // 确保解析结果是数组
      return Array.isArray(parsed) ? parsed : defaultValue
    } catch (error) {
      console.warn('Failed to parse JSON field:', error)
      return defaultValue
    }
  }

  // 其他类型返回默认值
  return defaultValue
}

/**
 * 将数组序列化为JSON字符串（用于存储到数据库）
 * @param value - 要序列化的数组
 * @returns JSON字符串
 */
export function stringifyJsonArray<T = string>(value: T[]): string {
  if (!Array.isArray(value)) {
    console.warn('stringifyJsonArray received non-array value:', value)
    return JSON.stringify([])
  }
  return JSON.stringify(value)
}

/**
 * 解析课程标签
 * @param tags - course.tags 字段值
 * @returns 标签数组
 */
export function parseCourseTags(
  tags: string | string[] | null | undefined
): string[] {
  return parseJsonArray<string>(tags, [])
}

/**
 * 解析资源链接
 * @param links - resource.links 字段值
 * @returns 链接数组
 */
export function parseResourceLinks(
  links: string | string[] | null | undefined
): string[] {
  return parseJsonArray<string>(links, [])
}
