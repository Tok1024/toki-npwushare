"use client"

import { useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Tabs, Tab } from '@heroui/tabs'
import { CourseResourceTab } from './tabs/CourseResourceTab'
import { CourseIntroTab } from './tabs/CourseIntroTab'
import { CourseComments } from './comment/Comments'
import { CourseRatings } from './rating/Ratings'

interface Props {
  dept: string
  slug: string
  course: any
  teachers: { id: number; name: string }[]
}

export const CourseHeader = ({ dept, slug, course, teachers }: Props) => {
  const [selected, setSelected] = useState<string>('introduction')

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-2">
          <div className="text-small text-default-500">{dept}</div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <div className="text-small text-default-500">
            资源 {course.resource_count} · 帖子 {course.post_count}
            {typeof course.rating_avg === 'number' && ` · 评分 ${course.rating_avg.toFixed(1)} (${course.rating_count})`}
          </div>
          {teachers?.length > 0 && (
            <div className="text-small text-default-500">
              参与教师：{teachers.map((t) => t.name).join('、')}
            </div>
          )}
        </CardBody>
      </Card>

      <Tabs
        className="w-full my-2 overflow-hidden shadow-medium rounded-large"
        fullWidth
        selectedKey={selected}
        onSelectionChange={(v) => setSelected(String(v))}
      >
        <Tab key="introduction" title="课程信息" className="p-0 min-w-20">
          <CourseIntroTab
            course={course}
            teachers={teachers as any}
          />
        </Tab>
        <Tab key="resources" title="课程资源" className="p-0 min-w-20">
          <CourseResourceTab dept={dept} slug={slug} />
        </Tab>
        <Tab key="comments" title="讨论版" className="p-0 min-w-20">
          <CourseComments dept={dept} slug={slug} courseId={course.id} />
        </Tab>
        <Tab key="rating" title="课程评价" className="p-0 min-w-20">
          <CourseRatings dept={dept} slug={slug} courseId={course.id} />
        </Tab>
      </Tabs>
    </div>
  )
}
