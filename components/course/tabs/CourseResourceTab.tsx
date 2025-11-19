'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Button, Chip, Link } from '@heroui/react'
import { ArchiveRestore, ExternalLink, FileText } from 'lucide-react'
import { kunFetchGet } from '~/utils/kunFetch'
import { formatDistanceToNow } from '~/utils/formatDistanceToNow'
import { KunNull } from '~/components/kun/Null'

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

  const renderList = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card
              key={`resource-skeleton-${idx}`}
              className="border border-default-100 bg-white/80"
            >
              <CardBody className="flex items-center gap-4 animate-pulse p-4 sm:p-5">
                <div className="h-12 w-12 rounded-xl bg-default-100" />
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-2/5 rounded bg-default-100" />
                  <div className="h-4 w-3/4 rounded bg-default-100" />
                  <div className="h-3 w-1/3 rounded bg-default-100" />
                </div>
                <div className="hidden h-8 w-20 rounded bg-default-100 sm:block" />
              </CardBody>
            </Card>
          ))}
        </div>
      )
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
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {resources.map((resource) => (
          <Card
            key={resource.id}
            className="w-full border border-default-100 shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-sm"
          >
            <CardBody className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex flex-1 items-start gap-3">
                <div className="flex items-center justify-center rounded-xl bg-blue-50 p-3 text-blue-500">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-default-500 sm:text-xs">
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

                  <h3 className="text-sm font-semibold text-default-900 sm:text-base line-clamp-2">
                    {resource.title}
                  </h3>

                  {resource.author && (
                    <p className="pt-1 text-[11px] text-default-500 sm:text-xs">
                      由 <span className="font-medium">{resource.author.name}</span> 上传
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                {resource.links && resource.links.length > 0 && (
                  <Button
                    as={Link}
                    href={resource.links[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    color="secondary"
                    variant="flat"
                    endContent={<ExternalLink className="size-3.5" />}
                  >
                    打开资源
                  </Button>
                )}
                {resource.links && resource.links.length > 1 && (
                  <span className="text-[11px] text-default-400 sm:text-[10px]">
                    还有 {resource.links.length - 1} 个链接
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default-100 bg-white/80 px-4 py-3 text-small text-default-600 shadow-sm">
        <p>平台只保存链接，如遇失效可以留言或自行补充。</p>
        <Button
          as={Link}
          href="/edit/create"
          color="primary"
          size="sm"
          startContent={<ArchiveRestore className="size-4" />}
        >
          我要上传
        </Button>
      </div>

      {renderList()}
    </div>
  )
}
