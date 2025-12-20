'use client'

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react'
import { Button } from '@heroui/button'
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { useUserStore } from '~/store/userStore'
import { kunFetchDelete, kunFetchPut } from '~/utils/kunFetch'
import toast from 'react-hot-toast'
import type { Comment } from '~/types/api/comment'

export const CommentDropdown = ({
  comment,
  dept,
  slug,
  courseId,
  setComments
}: {
  comment: Comment
  dept: string
  slug: string
  courseId: number
  setComments: (updater: any) => void
}) => {
  const { user } = useUserStore((s) => s)
  const canEdit = user.uid === comment.user.id || user.role >= 3

  const handleDelete = async () => {
    if (!canEdit) return toast.error('您没有权限删除该评论')
    const res = await kunFetchDelete<KunResponse<{}>>(
      `/course/${dept}/${slug}/comment`,
      { commentId: comment.id }
    )
    if (typeof res === 'string') return toast.error(res)
    setComments((prev: Comment[]) =>
      prev.filter((c) => c.id !== comment.id)
    )
    toast.success('评论删除成功')
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" isIconOnly>
          <MoreHorizontal aria-label="资源操作" className="size-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Comment actions"
        disabledKeys={canEdit ? [] : ['edit', 'delete']}
      >
        <DropdownItem key="edit" startContent={<Edit className="size-4" />}>
          编辑（待实现）
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Trash2 className="size-4" />}
          onPress={handleDelete}
        >
          删除
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
