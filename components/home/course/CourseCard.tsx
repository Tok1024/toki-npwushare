import Link from 'next/link'
import { Card, CardBody, CardFooter } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { BookOpen, FileText, Heart, BarChart3 } from 'lucide-react'

export interface SimpleCourse {
  id: number
  name: string
  slug: string
  deptSlug: string
  coverUrl?: string | null
  tags?: string[]
  heartCount: number
  difficultyAvg: number
  difficultyVotes: number
  resourceCount: number
  postCount: number
}

export const CourseCard = ({ c }: { c: SimpleCourse }) => {
  return (
    <Card
      isPressable
      as={Link}
      href={`/course/${c.deptSlug}/${c.slug}`}
      className="w-full border border-default-100 shadow-sm hover:shadow-md transition-all bg-white/50 backdrop-blur-sm"
    >
      <CardBody className="p-5 gap-3">
        <div className="flex justify-between items-start">
          <Chip
            size="sm"
            variant="flat"
            classNames={{
              base: 'bg-blue-50 text-blue-600 h-6',
              content: 'font-medium text-xs px-2'
            }}
          >
            {c.deptSlug}
          </Chip>
          {c.heartCount > 0 && (
            <div className="flex items-center gap-1 text-rose-500 text-xs font-medium bg-rose-50 px-2 py-0.5 rounded-full">
              <Heart className="w-3 h-3 fill-current" />
              {c.heartCount}
            </div>
          )}
        </div>

        <h3 className="font-bold text-lg leading-snug text-slate-800 line-clamp-2 min-h-[3.5rem]">
          {c.name}
        </h3>
      </CardBody>

      <CardFooter className="px-5 pb-5 pt-0 flex gap-4 text-slate-400">
        <div className="flex items-center gap-1.5 text-xs hover:text-blue-500 transition-colors">
          <FileText className="w-3.5 h-3.5" />
          <span>{c.resourceCount} 资源</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs hover:text-blue-500 transition-colors">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{c.postCount} 帖子</span>
        </div>
        {c.difficultyVotes > 0 && (
          <div className="flex items-center gap-1.5 text-xs ml-auto text-slate-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{c.difficultyAvg.toFixed(1)}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
