"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { KunEditor } from '~/components/kun/milkdown/Editor'
import toast from 'react-hot-toast'
import { kunFetchPost } from '~/utils/kunFetch'

export default function NewPostPage({
  params
}: {
  params: Promise<{ dept: string; slug: string }>
}) {
  const [title, setTitle] = useState('')
  const [markdown, setMarkdown] = useState('')
  const router = useRouter()

  const onSubmit = async () => {
    if (!title.trim()) return toast.error('请输入标题')
    if (!markdown.trim()) return toast.error('请输入正文')
    const { dept, slug } = await params
    const res = await kunFetchPost<{ id: number; status: string } | string>(
      `/course/${dept}/${slug}/posts`,
      { title: title.trim(), content: markdown }
    )
    if (typeof res === 'string') return toast.error(res)
    toast.success('已发布')
    router.push(`/course/${dept}/${slug}/p/${res.id}`)
  }

  return (
    <div className="w-full min-h-screen bg-default-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">发布经验贴</h1>
          <Button as={Link} href=".." variant="light" size="sm">
            返回课程
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardBody className="space-y-6 p-8">
            <Input
              label="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="一句话概括你的经验"
              size="lg"
              variant="bordered"
            />
            <div className="border-2 border-default-200 rounded-lg p-4 min-h-[600px]">
              <KunEditor
                valueMarkdown={markdown}
                saveMarkdown={(md) => setMarkdown(md)}
                disableImageUpload
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button as={Link} href=".." variant="bordered" size="lg">
                取消
              </Button>
              <Button color="primary" onPress={onSubmit} size="lg">
                发布
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
