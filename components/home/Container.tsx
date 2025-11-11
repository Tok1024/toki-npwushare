import { HomeHero } from './hero/HomeHero'
import { HomeCourseSection } from './course/HomeCourseSection'
import { HomeLatestResourceSection } from './resource/HomeLatestResourceSection'

export const HomeContainer = () => {
  return (
    <div className="mx-auto space-y-8 max-w-7xl">
      <HomeHero />

      <section className="space-y-4">
        <h2 className="text-lg font-bold sm:text-2xl">NWPUShare</h2>
        <p className="text-default-500">
          我们希望把零散在网盘、群聊、个人博客里的课程资料集中整理，并给每门课一个“家”。这里的每个链接都指回作者自己的存储空间，平台只做聚合与讨论。
        </p>
      </section>

      <HomeCourseSection />
      <HomeLatestResourceSection />
    </div>
  )
}
