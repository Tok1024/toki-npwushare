import { HomeContainer } from '~/components/home/Container'
export const revalidate = 3

export default async function Kun() {
  return (
    <div className="container mx-auto my-4 space-y-6">
      <HomeContainer />
    </div>
  )
}
