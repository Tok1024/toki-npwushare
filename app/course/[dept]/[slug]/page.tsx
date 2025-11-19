import { notFound } from 'next/navigation'
import { CourseHeader } from '~/components/course/Header'

async function getCourseDetail(dept: string, slug: string) {
  const base =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV
      : process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD
  const res = await fetch(`${base}/api/course/${dept}/${slug}`, {
    cache: 'no-store'
  })
  // console.log(`[API] Received request for: ${dept}/${slug}`);
  if (!res.ok) return null
  return res.json() as Promise<{ course: any; teachers: any[] } | string>
}

export default async function Page({
  params
}: {
  params: Promise<{ dept: string; slug: string }>
}) {
  const { dept, slug } = await params
  const data = await getCourseDetail(dept, slug)
  if (!data || typeof data === 'string') return notFound()

  const { course, teachers } = data

  return (
    <div className="container py-6 mx-auto space-y-6">
      <CourseHeader
        dept={dept}
        slug={slug}
        course={course}
        teachers={teachers}
      />
    </div>
  )
}
