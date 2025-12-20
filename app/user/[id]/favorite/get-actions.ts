'use server'

import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { kunFetchGet } from '~/utils/kunFetch'

export const kunGetFavorites = async (userId: number, page: number = 1) => {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return { error: '用户登陆失效' }
  }

  try {
    const response = await kunFetchGet(
      `/user/favorite/list?userId=${userId}&page=${page}&limit=10`
    )
    return response
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return { error: '获取收藏列表失败' }
  }
}
