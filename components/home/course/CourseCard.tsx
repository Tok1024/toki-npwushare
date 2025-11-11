import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'

export interface SimpleCourse {
  id: number
  name: string
  slug: string
  deptSlug: string
  coverUrl?: string | null
  tags?: string[]
  ratingAvg?: number | null
  ratingCount: number
  resourceCount: number
  postCount: number
}

export const CourseCard = ({ c }: { c: SimpleCourse }) => {
  return (
    <Card
      isPressable
      as={Link}
      href={`/course/${c.deptSlug}/${c.slug}`}
      className="w-full"
    >
      <CardBody className="space-y-2">
        <div className="text-small text-default-500">{c.deptSlug}</div>
        <h3 className="font-semibold line-clamp-2">{c.name}</h3>
        <div className="text-tiny text-default-500">
          资源 {c.resourceCount} · 帖子 {c.postCount}
          {typeof c.ratingAvg === 'number' && ` · 评分 ${c.ratingAvg.toFixed(1)} (${c.ratingCount})`}
        </div>
      </CardBody>
    </Card>
  )
}

