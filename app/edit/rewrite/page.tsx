import { kunMetadata } from './metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = kunMetadata

export default async function Kun() {
  return (
    <div className="flex items-center justify-center flex-1 max-w-5xl mx-auto w-96">
      <p>Patch editing feature not available</p>
    </div>
  )
}
