import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { Image } from '@heroui/image'
import { KunCardStats } from '~/components/kun/CardStats'

interface Props {
  patch: GalgameCard
}

export const PatchCard = ({ patch }: Props) => {
  return (
    <Card
      isPressable
      as={Link}
      href={`/${patch.uniqueId}`}
      className="w-full border border-default-100 shadow-sm hover:shadow-md transition-all bg-white/50 backdrop-blur-sm group"
    >
      <CardBody className="p-3">
        <div className="relative w-full pb-[56.25%] overflow-hidden rounded-lg">
          <Image
            removeWrapper
            src={patch.banner.replace(/\.avif$/, '-mini.avif')}
            alt={patch.name}
            className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            radius="none"
          />
        </div>
        <div className="mt-3 space-y-2 px-1 pb-1">
          <h2 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {patch.name}
          </h2>
          <KunCardStats patch={patch} isMobile={true} />
        </div>
      </CardBody>
    </Card>
  )
}
