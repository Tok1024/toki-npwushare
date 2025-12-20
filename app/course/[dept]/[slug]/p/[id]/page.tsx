import { prisma } from '~/prisma'
import { notFound } from 'next/navigation'
import { markdownToHtmlExtend } from '~/app/api/utils/render/markdownToHtmlExtend'
import { PostMeta } from '~/components/post/PostMeta'

export default async function PostDetailPage({
  params
}: {
  params: Promise<{ dept: string; slug: string; id: string }>
}) {
  const { dept, slug, id } = await params

  const department = await prisma.department.findUnique({ where: { slug: dept } })
  if (!department) notFound()

  const course = await prisma.course.findUnique({
    where: { department_id_slug: { department_id: department.id, slug } },
    select: { id: true, name: true }
  })
  if (!course) notFound()

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      title: true,
      content: true,
      created: true,
      status: true,
      author: { select: { id: true, name: true, avatar: true } }
    }
  })
  if (!post || !post) notFound()
  // optional: ensure post belongs to course
  // if (post.course_id !== course.id) notFound()

  const html = await markdownToHtmlExtend(post.content)
  const statusLabel = post.status !== 'published' ? post.status : undefined

  return (
    <div className="w-full bg-default-50 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold">{post.title}</h1>
        <PostMeta
          authorName={post.author?.name}
          authorAvatar={post.author?.avatar ?? undefined}
          authorId={post.author?.id}
          created={post.created}
          statusLabel={statusLabel}
        />
        <article className="kun-prose max-w-none bg-white rounded-lg p-8 shadow-sm">
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: server-rendered markdown */}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </div>
  )
}
