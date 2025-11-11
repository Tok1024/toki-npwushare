'use client'

import { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner
} from '@heroui/react'
import {
  courseResourceCreateSchema,
  RESOURCE_TYPES
} from '~/validations/course'
import { kunFetchPost } from '~/utils/kunFetch'

type DepartmentOption = {
  id: number
  name: string
  slug: string
  courses: { id: number; name: string; slug: string }[]
}

const RESOURCE_TYPE_LABELS: Record<(typeof RESOURCE_TYPES)[number], string> = {
  note: '课堂笔记',
  slides: '课件 / PPT',
  assignment: '作业',
  exam: '试卷',
  solution: '答案 / 解析',
  link: '参考链接',
  other: '其他'
}

const uploadResourceFormSchema = courseResourceCreateSchema
  .extend({
    deptSlug: z.string().trim().min(1, { message: '请选择学院' }),
    courseSlug: z.string().trim().min(1, { message: '请输入课程标识' }),
    courseName: z.string().trim().optional(),
    mode: z.enum(['existing', 'new'])
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'existing' && !data.courseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['courseId'],
        message: '请选择一个课程'
      })
    }
    if (data.mode === 'new' && !data.courseName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['courseName'],
        message: '请输入课程名称'
      })
    }
  })

type UploadResourceFormValues = z.infer<typeof uploadResourceFormSchema>

const slugify = (input: string) =>
  input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const UploadResourceForm = () => {
  const [submitting, setSubmitting] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const { data: departments, isLoading } = useSWR<DepartmentOption[]>(
    '/api/department/list',
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('学院列表加载失败')
      }
      return res.json()
    }
  )

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<UploadResourceFormValues>({
    resolver: zodResolver(uploadResourceFormSchema),
    defaultValues: {
      deptSlug: '',
      courseId: undefined,
      courseSlug: '',
      courseName: '',
      mode: 'existing',
      title: '',
      type: 'note',
      links: [''],
      term: '',
      teacherId: undefined
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'links'
  })

  const deptSlug = watch('deptSlug')
  const selectedCourseId = watch('courseId')
  const courseName = watch('courseName')
  const mode = watch('mode')
  const courseSlug = watch('courseSlug')
  const linkErrors = Array.isArray(errors.links) ? errors.links : undefined
  const linksRootError = !Array.isArray(errors.links)
    ? (errors.links as { root?: { message?: string } } | undefined)?.root
        ?.message
    : undefined

  const selectedDept = useMemo(
    () => departments?.find((dept) => dept.slug === deptSlug),
    [departments, deptSlug]
  )
  const availableCourses = selectedDept?.courses ?? []
  const selectedCourse = useMemo(
    () => availableCourses.find((course) => course.id === selectedCourseId),
    [availableCourses, selectedCourseId]
  )

  const handleDeptSelect = useCallback(
    (slug: string) => {
      setValue('deptSlug', slug, { shouldValidate: true })
      setValue('courseId', undefined)
      setValue('courseSlug', '')
      setValue('courseName', '')
      setValue('mode', 'existing')
      setSlugEdited(false)
    },
    [setValue]
  )

  const handleCourseSelect = useCallback(
    (courseId: number) => {
      const course = availableCourses.find((c) => c.id === courseId)
      if (!course) return

      setValue('mode', 'existing', { shouldValidate: true })
      setValue('courseId', course.id, { shouldValidate: true })
      setValue('courseSlug', course.slug, { shouldValidate: true })
      setValue('courseName', course.name)
      setSlugEdited(false)
    },
    [availableCourses, setValue]
  )

  const handleToggleNewCourse = () => {
    if (mode === 'new') {
      setValue('mode', 'existing')
      setValue('courseName', '')
      setValue('courseSlug', selectedCourse?.slug ?? '')
      setSlugEdited(false)
    } else {
      setValue('mode', 'new')
      setValue('courseId', undefined)
      setValue('courseName', '')
      setValue('courseSlug', '')
      setSlugEdited(false)
    }
  }

  const handleCourseNameChange = (value: string) => {
    setValue('courseName', value, { shouldValidate: true })
    if (!slugEdited) {
      setValue('courseSlug', slugify(value), { shouldValidate: true })
    }
  }

  const handleCourseSlugChange = (value: string) => {
    setSlugEdited(true)
    setValue('courseSlug', slugify(value), { shouldValidate: true })
  }

  const onSubmit = async (values: UploadResourceFormValues) => {
    setSubmitting(true)
    try {
      const {
        deptSlug: dept,
        courseSlug: slug,
        mode,
        courseName,
        courseId,
        links,
        ...rest
      } = values
      const payload = {
        ...rest,
        courseId: mode === 'existing' ? courseId : undefined,
        courseName: mode === 'new' ? courseName : undefined,
        links: links.map((link) => link.trim())
      }

      const response = await kunFetchPost(
        `/course/${dept}/${slug}/resources`,
        payload
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success('资源已提交，等待审核')
      reset({
        deptSlug: dept,
        courseId: mode === 'existing' ? courseId : undefined,
        courseSlug: mode === 'existing' ? slug : '',
        courseName: '',
        mode: 'existing',
        title: '',
        type: 'note',
        links: [''],
        term: '',
        teacherId: undefined
      })
      setSlugEdited(false)
    } catch (error) {
      toast.error('提交失败，请稍后再试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardBody className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Select
                label="学院"
                placeholder="选择学院"
                selectedKeys={deptSlug ? [deptSlug] : []}
                isLoading={isLoading}
                onSelectionChange={(keys) => {
                  const first = Array.from(keys)[0] as string | undefined
                  if (first) handleDeptSelect(first)
                }}
              >
                {departments?.map((dept) => (
                  <SelectItem key={dept.slug} textValue={dept.name}>
                    {dept.name}（{dept.slug}）
                  </SelectItem>
                ))}
              </Select>
              {errors.deptSlug && (
                <p className="text-tiny text-danger">
                  {errors.deptSlug.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Select
                label="课程"
                placeholder={
                  deptSlug ? '选择课程或下方创建新课程' : '请先选择学院'
                }
                isDisabled={!deptSlug || mode === 'new'}
                selectedKeys={
                  selectedCourseId ? [String(selectedCourseId)] : []
                }
                onSelectionChange={(keys) => {
                  const first = Array.from(keys)[0]
                  if (first) handleCourseSelect(Number(first))
                }}
              >
                {availableCourses.length === 0 ? (
                  <SelectItem key="empty" textValue="暂无课程" isDisabled>
                    <span className="text-default-400">该学院暂无课程</span>
                  </SelectItem>
                ) : (
                  availableCourses.map((course) => (
                    <SelectItem
                      key={course.id.toString()}
                      textValue={course.name}
                    >
                      {course.name}
                    </SelectItem>
                  ))
                )}
              </Select>
              {errors.courseId && mode === 'existing' && (
                <p className="text-tiny text-danger">
                  {errors.courseId.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Divider className="flex-1" />
            <Button
              variant="light"
              size="sm"
              type="button"
              onPress={handleToggleNewCourse}
            >
              {mode === 'new' ? '取消新增课程' : '课程未收录？新增课程'}
            </Button>
            <Divider className="flex-1" />
          </div>

          {mode === 'new' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Input
                  label="课程名称"
                  placeholder="信号与系统"
                  value={courseName ?? ''}
                  onValueChange={handleCourseNameChange}
                />
                {errors.courseName && (
                  <p className="text-tiny text-danger">
                    {errors.courseName.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  label="课程标识（slug）"
                  placeholder="signal-and-system"
                  value={courseSlug}
                  onValueChange={handleCourseSlugChange}
                  description="URL 将使用该标识，如 /course/cs/signal-and-system"
                />
                {errors.courseSlug && (
                  <p className="text-tiny text-danger">
                    {errors.courseSlug.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <Divider />

          <div className="space-y-3">
            <Input
              label="资源标题"
              placeholder="2024 秋 信号与系统 作业 1"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-tiny text-danger">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Select
                label="资源类型"
                selectedKeys={watch('type') ? [watch('type')] : []}
                onSelectionChange={(keys) => {
                  const first = Array.from(keys)[0] as
                    | UploadResourceFormValues['type']
                    | undefined
                  if (first) {
                    setValue('type', first, { shouldValidate: true })
                  }
                }}
              >
                {RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type} textValue={RESOURCE_TYPE_LABELS[type]}>
                    {RESOURCE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </Select>
              {errors.type && (
                <p className="text-tiny text-danger">{errors.type.message}</p>
              )}
            </div>
            <Input
              label="学期 / 学年"
              placeholder="2024-Fall"
              {...register('term')}
            />
          </div>

          <div className="space-y-3">
            <label className="text-small font-medium">资源链接</label>
            <p className="text-tiny text-default-500">
              我们不会保存文件，仅记录外部链接。可一次提交多个链接。
            </p>

            {fields.map((field, index) => {
              const linkError =
                linkErrors && linkErrors[index]
                  ? (linkErrors[index]?.message as string | undefined)
                  : undefined
              return (
                <div key={field.id} className="space-y-1">
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      placeholder="https://example.com/resource.pdf"
                      {...register(`links.${index}` as const)}
                    />
                    {fields.length > 1 && (
                      <Button
                        color="danger"
                        variant="light"
                        type="button"
                        onPress={() => remove(index)}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                  {linkError && (
                    <p className="text-tiny text-danger">{linkError}</p>
                  )}
                </div>
              )
            })}

            {fields.length < 20 && (
              <Button variant="light" type="button" onPress={() => append('')}>
                添加更多链接
              </Button>
            )}
            {linksRootError && (
              <p className="text-tiny text-danger">{linksRootError}</p>
            )}
          </div>

          <Button
            color="primary"
            type="submit"
            isLoading={submitting}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" color="default" /> 正在提交
              </span>
            ) : (
              '提交资源'
            )}
          </Button>
        </CardBody>
      </form>
    </Card>
  )
}
