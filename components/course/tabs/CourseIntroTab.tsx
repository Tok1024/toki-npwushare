import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'

export const CourseIntroTab = ({
  course,
  teachers
}: {
  course: any
  teachers: { id: number; name: string }[]
}) => {
  const tags = Array.isArray(course?.tags) ? course.tags : []

  return (
    <Card className="border-none bg-white/90 shadow-sm backdrop-blur-sm min-h-[360px]">
      <CardBody className="space-y-6 p-4 sm:p-6 md:p-7">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-default-900 sm:text-2xl">
            课程信息
          </h2>
          <p className="text-small text-default-500">
            基本信息来自学院与同学补充，如有错误欢迎在讨论版指出或提交修改。
          </p>
        </div>

        <div className="grid gap-4 text-small text-default-600 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-default-500">开设学院</p>
            <p className="text-sm">
              {course?.department?.name ?? '—'}
            </p>
          </div>

          {course?.code && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500">课程代码</p>
              <p className="text-sm">{course.code}</p>
            </div>
          )}

          {teachers?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500">授课教师</p>
              <p className="text-sm">
                {teachers.map((t) => t.name).join('、')}
              </p>
            </div>
          )}

          {course?.instructor_name && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500">课程负责人</p>
              <p className="text-sm">{course.instructor_name}</p>
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-default-500">标签</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: 'bg-default-50 border-default-100',
                    content: 'text-default-600 text-xs'
                  }}
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {course?.description && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-default-500">课程简介</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-default-700">
              {course.description}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
