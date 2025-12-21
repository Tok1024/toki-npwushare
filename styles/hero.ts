import { heroui } from '@heroui/react'

export default heroui({
  themes: {
    light: {
      colors: {
        background: '#FFFFFF',
        foreground: '#11181C',
        primary: {
          DEFAULT: '#006FEE',
          foreground: '#FFFFFF'
        }
      }
    },
    dark: {
      colors: {
        background: '#09090b', // Zinc 950
        foreground: '#ECEDEE',
        content1: '#18181b', // Zinc 900
        content2: '#27272a', // Zinc 800
        content3: '#3f3f46', // Zinc 700
        content4: '#52525b', // Zinc 600
        primary: {
          DEFAULT: '#006FEE',
          foreground: '#FFFFFF'
        }
      }
    }
  }
})
