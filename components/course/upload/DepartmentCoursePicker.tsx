'use client'

import useSWR from 'swr'
import { Select, SelectItem, Input } from '@heroui/react'

interface Props {
  deptSlug: string
  courseId: string
  onDeptChange: (value: string) => void
  onCourseSelect: (id: string) => void
}

export const DepartmentCoursePicker = ({
  deptSlug,
  courseId,
  onDeptChange,
  onCourseSelect
}: Props) => {
  const { data: departments } = useSWR('/api/department/list', async (url) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error('加载失败')
    return res.json()
  })

  return (
    <div className="space-y-2">
      <label className="text-small text-default-500">
        选择已有课程（可选）
      </label>
      <Select
        placeholder="直接选择已有课程"
        selectedKeys={courseId ? [courseId] : []}
        onSelectionChange={(keys) => {
          const id = Array.from(keys)[0] as string
          onCourseSelect(id)
        }}
        aria-label="选择课程"
        className="max-h-60"
      >
        {departments?.flatMap((dept: any) =>
          dept.courses.map((course: any) => (
            <SelectItem
              key={course.id}
              textValue={`${dept.name} - ${course.name}`}
            >
              {`${dept.name} - ${course.name}`}
            </SelectItem>
          ))
        )}
      </Select>
      <p className="text-tiny text-default-400">
        若列表中没有你要的课程，请在下方填写学院/课程简称，系统会自动创建。
      </p>
      <Input
        label="学院简称（例如 cs、ee）"
        variant="bordered"
        value={deptSlug}
        onValueChange={onDeptChange}
      />
    </div>
  )
}
