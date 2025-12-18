'use client'

import { Chip } from '@heroui/chip'
import {
  SUPPORTED_LANGUAGE_MAP,
  SUPPORTED_PLATFORM_MAP,
  SUPPORTED_TYPE_MAP
} from '~/constants/resource'

interface Props {
  types: string[]
  languages?: string[]
  platforms?: string[]
  size?: 'lg' | 'md' | 'sm'
}

export const KunPatchAttribute = ({
  types,
  languages = [],
  platforms = [],
  size = 'md'
}: Props) => {
  const hasContent = types.length > 0 || languages.length > 0 || platforms.length > 0

  if (!hasContent) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {types.filter(Boolean).map((type) => (
        <Chip key={type} variant="flat" color="primary" size={size}>
          {SUPPORTED_TYPE_MAP[type] || type}
        </Chip>
      ))}
      {languages?.filter(Boolean).map((lang) => (
        <Chip key={lang} variant="flat" color="secondary" size={size}>
          {SUPPORTED_LANGUAGE_MAP[lang] || lang}
        </Chip>
      ))}
      {platforms?.filter(Boolean).map((platform) => (
        <Chip key={platform} variant="flat" color="success" size={size}>
          {SUPPORTED_PLATFORM_MAP[platform] || platform}
        </Chip>
      ))}
    </div>
  )
}
