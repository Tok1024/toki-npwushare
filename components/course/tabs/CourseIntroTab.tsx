import { Card, CardBody } from '@heroui/card'

export const CourseIntroTab = ({
  course,
  teachers
}: {
  course: any
  teachers: { id: number; name: string }[]
}) => {
  return (
    <Card className="p-1 sm:p-8">
      <CardBody className="p-4 space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-medium">课程信息</h2>
          <div className="text-small text-default-500">
            开设学院：{course?.department?.name ?? '—'}
          </div>
          {course?.code && (
            <div className="text-small text-default-500">课程代码：{course.code}</div>
          )}
          {teachers?.length > 0 && (
            <div className="text-small text-default-500">
              授课教师：{teachers.map((t) => t.name).join('、')}
            </div>
          )}
          {course?.instructor_name && (
            <div className="text-small text-default-500">
              课程负责人：{course.instructor_name}
            </div>
          )}
          {Array.isArray(course?.tags) && course.tags.length > 0 && (
            <div className="text-small text-default-500">
              标签：{course.tags.join('、')}
            </div>
          )}
          {course?.description && (
            <p className="text-small text-default-600 whitespace-pre-wrap">
              {course.description}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
