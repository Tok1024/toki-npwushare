'use client'

import { useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Tabs, Tab } from '@heroui/tabs'
import { BookOpen, FileText, Heart, BarChart3 } from 'lucide-react'
import { CourseResourceTab } from './tabs/CourseResourceTab'
import { CourseIntroTab } from './tabs/CourseIntroTab'
import { CourseComments } from './comment/Comments'
import { CourseFeedbackSection } from './feedback/FeedbackSection'

interface Props {
  dept: string
  slug: string
  course: any
  teachers: { id: number; name: string }[]
}

export const CourseHeader = ({ dept, slug, course, teachers }: Props) => {
  const [selected, setSelected] = useState<string>('introduction')

  const departmentName = course?.department?.name ?? dept.toUpperCase()

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-medium bg-white/80 backdrop-blur-md">
        <CardBody className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  classNames={{
                    base: 'bg-primary-50 border border-primary-100',
                    content: 'font-semibold text-primary-600'
                  }}
                >
                  {departmentName}
                </Chip>
                {course?.code && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {course.code}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {course.name}
              </h1>
            </div>

            {teachers?.length > 0 && (
              <div className="flex flex-wrap gap-2 md:justify-end max-w-xs">
                {teachers.map((t) => (
                  <Chip
                    key={t.id}
                    size="sm"
                    variant="flat"
                    className="bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {t.name}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          {course?.description && (
            <p className="text-base text-slate-600 leading-relaxed max-w-4xl">
              {course.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900 font-semibold">
                  {course.resource_count}
                </strong>{' '}
                份资源
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>
                <strong className="text-slate-900 font-semibold">
                  {course.post_count}
                </strong>{' '}
                篇帖子
              </span>
            </div>

            {course.heart_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-rose-600">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span className="font-semibold">{course.heart_count}</span>
              </div>
            )}

            {course.difficulty_votes > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">
                  {course.difficulty_avg?.toFixed(1)}
                </span>
                <span className="text-slate-400 text-xs">
                  ({course.difficulty_votes} 票)
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Tabs
        aria-label="课程详情"
        variant="underlined"
        classNames={{
          base: 'w-full mt-8',
          tabList:
            'gap-6 w-full relative rounded-none p-0 border-b border-divider',
          cursor: 'w-full bg-primary',
          tab: 'max-w-fit px-0 h-12',
          tabContent:
            'group-data-[selected=true]:text-primary font-medium text-base text-slate-500'
        }}
        selectedKey={selected}
        onSelectionChange={(v) => setSelected(String(v))}
      >
        <Tab key="introduction" title="课程信息" className="p-0 min-w-20">
          <CourseIntroTab course={course} teachers={teachers as any} />
        </Tab>
        <Tab key="resources" title="课程资源" className="p-0 min-w-20">
          <CourseResourceTab dept={dept} slug={slug} courseId={course.id} />
        </Tab>
        <Tab key="comments" title="讨论版" className="p-0 min-w-20">
          <CourseComments dept={dept} slug={slug} courseId={course.id} />
        </Tab>
        <Tab key="feedback" title="课程反馈" className="p-0 min-w-20">
          <CourseFeedbackSection dept={dept} slug={slug} courseId={course.id} />
        </Tab>
      </Tabs>
    </div>
  )
}
