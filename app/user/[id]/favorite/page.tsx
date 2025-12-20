import { UserFavoritesContainer } from '~/components/user/favorite/CoursesContainer'
import { kunGetFavorites } from './get-actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'

export const revalidate = 3

interface Props {
  params: Promise<{ id: string }>
}

export default async function Kun({ params }: Props) {
  const { id } = await params
  const userId = Number(id)

  const payload = await verifyHeaderCookie()

  const response = await kunGetFavorites(userId, 1)

  if (response.error || !response.data) {
    return <ErrorComponent error={response.error || '获取收藏列表失败'} />
  }

  return (
    <UserFavoritesContainer
      initialData={response.data}
      initialTotal={response.total}
      initialPage={response.page}
      userId={userId}
      currentUserUid={payload?.uid || 0}
    />
  )
}

