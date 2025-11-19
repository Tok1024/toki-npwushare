import Link from 'next/link'
import { Button } from '@heroui/button'
import { Tooltip } from '@heroui/tooltip'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Sparkles } from 'lucide-react'
import { KunCarousel } from '../carousel/KunCarousel'
import { getKunPosts } from '../carousel/mdx'
import { Discord } from '~/components/kun/icons/Discord'
import { KunHomeNavigationItems } from '../NavigationItems'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { homeNavigationItems } from '~/constants/home'

export const HomeHero = () => {
  const posts = getKunPosts()

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary-50 text-primary-500 group-hover:bg-primary-100'
      case 'secondary':
        return 'bg-secondary-50 text-secondary-500 group-hover:bg-secondary-100'
      case 'success':
        return 'bg-success-50 text-success-500 group-hover:bg-success-100'
      case 'warning':
        return 'bg-warning-50 text-warning-500 group-hover:bg-warning-100'
      default:
        return 'bg-default-50 text-default-500'
    }
  }

  return (
    <div className="w-full mx-auto">
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6 min-h-[300px]"> */}
        <div className="flex-col justify-center hidden space-y-2 sm:flex sm:space-y-6">
          <Card className="h-full border-none bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-100 shadow-md overflow-visible">
            <CardBody className="flex flex-col justify-between gap-6 p-8 sm:p-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <Chip
                  classNames={{
                    base: 'bg-white/60 border-blue-100 backdrop-blur-md shadow-sm',
                    content: 'text-blue-700 font-medium',
                  }}
                  variant="flat"
                >
                  欢迎来到 {kunMoyuMoe.titleShort}
                </Chip>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-transparent xl:text-5xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text drop-shadow-sm">
                  瓜大课程资料与经验共建共享
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                  上传课件链接、记录心得、邀请同学一起讨论学习路线。
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  className="bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700"
                  variant="solid"
                  size="lg"
                  href="/course"
                  as="a"
                >
                  浏览课程
                </Button>
                <Button
                  className="bg-white text-blue-600 font-medium shadow-sm hover:bg-blue-50"
                  variant="flat"
                  size="lg"
                  href="/resource"
                  as="a"
                >
                  最新资源
                </Button>
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {homeNavigationItems.map((item) => (
              <Card
                key={item.href}
                isPressable
                as={Link}
                href={item.href}
                className="border-none shadow-sm hover:shadow-md transition-all bg-white group"
              >
                <CardBody className="flex flex-row items-center gap-4 p-4">
                  <div
                    className={`p-3 rounded-xl transition-colors ${getColorStyles(
                      item.color
                    )}`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-slate-700 text-lg">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.description}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* <KunCarousel posts={posts} /> */}
      {/* </div> */}
    </div>
  )
}
