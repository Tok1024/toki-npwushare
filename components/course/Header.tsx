'use client'

import { useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Tabs, Tab } from '@heroui/tabs'
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

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-2">
          <div className="text-small text-default-500">{dept}</div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <div className="text-small text-default-500 flex flex-wrap gap-2">
            <span>资源 {course.resource_count}</span>
            <span>帖子 {course.post_count}</span>
            {course.heart_count > 0 && <span>红心 {course.heart_count}</span>}
            {course.difficulty_votes > 0 && (
              <span>
                难度 {course.difficulty_avg?.toFixed(1)} (
                {course.difficulty_votes} 票)
              </span>
            )}
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
