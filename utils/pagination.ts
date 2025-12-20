/**
 * 分页计算工具函数
 */

/**
 * 计算数据库查询的偏移量
 * @param page - 当前页码（从1开始）
 * @param limit - 每页数量
 * @returns 偏移量
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * 计算总页数
 * @param total - 总记录数
 * @param limit - 每页数量
 * @returns 总页数
 */
export function calculateTotalPages(total: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.ceil(total / limit)
}

/**
 * 获取分页信息（用于API响应）
 * @param page - 当前页码
 * @param limit - 每页数量
 * @param total - 总记录数
 * @returns 分页信息对象
 */
export function getPaginationInfo(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: calculateTotalPages(total, limit),
    hasNext: page < calculateTotalPages(total, limit),
    hasPrev: page > 1
  }
}

/**
 * 生成Prisma的skip/take参数
 * @param page - 当前页码
 * @param limit - 每页数量
 * @returns Prisma分页参数对象
 */
export function getPrismaSkipTake(page: number, limit: number) {
  return {
    skip: calculateOffset(page, limit),
    take: limit
  }
}
