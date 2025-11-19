"use client"

import { useEffect, useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Button, Chip, Link } from '@heroui/react'
import { ArchiveRestore, ExternalLink } from 'lucide-react'
import { kunFetchGet } from '~/utils/kunFetch'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import { KunLoading } from '~/components/kun/Loading'
import { KunNull } from '~/components/kun/Null'
import { KunUser } from '~/components/kun/floating-card/KunUser'

type ApiResp = {
  total: number
  page: number
  pageSize: number
  list: {
    id: number
    title: string
    type: string
    term?: string | null
    created: string
    links?: string[]
    author?: { id: number; name: string; avatar: string; role: number }
  }[]
}

const TYPE_LABEL: Record<string, string> = {
  note: '课堂笔记',
  slides: '课件 / PPT',
  assignment: '作业',
  exam: '试卷',
  solution: '答案',
  link: '参考链接',
  other: '其他'
}

export const CourseResourceTab = ({
  dept,
  slug
}: {
  dept: string
  slug: string
  courseId: number
}) => {
  const [resources, setResources] = useState<ApiResp['list']>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const res = await kunFetchGet<ApiResp | string>(
        `/course/${dept}/${slug}/resources`,
        { page: 1, pageSize: 100 }
      )
      if (typeof res !== 'string') {
        setResources(res.list)
      }
      setLoading(false)
    }

    run()
  }, [dept, slug])

  if (loading) {
    return <KunLoading hint="正在加载课程资源..." />
  }

  if (!resources.length) {
    return (
      <KunNull
        message="暂时没有资源，欢迎成为第一位贡献者"
        action={
          <Button as={Link} href="/edit/create" color="primary">
            上传资源
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-small text-default-500">
          平台只保存链接，如遇失效可以留言或自行补充。
        </p>
        <Button
          as={Link}
          href="/edit/create"
          color="primary"
          startContent={<ArchiveRestore className="size-4" />}
        >
          我要上传
        </Button>
      </div>

      {resources.map((resource) => (
        <Card key={resource.id}>
          <CardBody className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{resource.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-tiny text-default-500">
                  <Chip size="sm" color="primary" variant="flat">
                    {TYPE_LABEL[resource.type] ?? resource.type}
                  </Chip>
                  {resource.term && (
                    <Chip size="sm" variant="flat">
                      {resource.term}
                    </Chip>
                  )}
                  <span>{formatDistanceToNow(resource.created)}</span>
                </div>
              </div>

              {resource.author && (
                <KunUser
                  user={resource.author}
                  userProps={{
                    name: resource.author.name,
                    description: '上传者',
                    avatarProps: {
                      showFallback: true,
                      src: resource.author.avatar,
                      name: resource.author.name
                    }
                  }}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {(resource.links ?? []).map((link, index) => (
                <Button
                  key={`${resource.id}-${index}`}
                  as={Link}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="flat"
                  color="secondary"
                  endContent={<ExternalLink className="size-4" />}
                >
                  链接 {index + 1}
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
