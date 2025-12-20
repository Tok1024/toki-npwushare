import { getAllPosts } from '~/lib/mdx/getPosts'
import { KunAboutHeader } from '~/components/doc/Header'
import { PostList } from '~/components/post/PostList'
import { kunMetadata } from './metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = kunMetadata

export default function Kun() {
  const posts = getAllPosts()

  return (
    <div className="w-full px-6 pb-6">
      <KunAboutHeader />

      <PostList
        items={posts.map((post) => ({
          id: post.slug,
          title: post.title,
          date: post.date,
          href: `/doc/${post.slug}`
        }))}
        emptyText="暂无经验帖"
      />
    </div>
  )
}
