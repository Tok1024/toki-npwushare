import { HomeHero } from './hero/HomeHero'
import { HomeCourseSection } from './course/HomeCourseSection'
import { HomeLatestResourceSection } from './resource/HomeLatestResourceSection'

export const HomeContainer = () => {
  return (
    <div className="mx-auto space-y-8 max-w-7xl">
      <HomeHero />

      <section className="relative p-6 overflow-hidden border border-default-100 rounded-2xl bg-gradient-to-r from-default-50 to-transparent">
        <div className="relative z-10 space-y-3">
          <h2 className="text-xl font-bold text-default-900">关于 NWPUShare</h2>
          <p className="leading-relaxed text-default-600 max-w-4xl">
            我们希望把零散在网盘、群聊、个人博客里的课程资料集中整理，并给每门课一个“家”。这里的每个链接都指回作者自己的存储空间，平台只做聚合与讨论。
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-primary-500/5 blur-3xl pointer-events-none" />
      </section>

      <HomeCourseSection />
      <HomeLatestResourceSection />
    </div>
  )
}
