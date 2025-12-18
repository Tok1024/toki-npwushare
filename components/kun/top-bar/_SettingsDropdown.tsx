'use client'

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react'
import { Settings } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'

export const SettingsDropdown = () => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" isIconOnly radius="full" className="w-10 h-10">
          <Settings className="size-6 text-default-500" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Settings" className="min-w-[240px]">
        <DropdownItem key="theme" textValue="主题切换" className="h-12">
          <ThemeSwitcher />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
