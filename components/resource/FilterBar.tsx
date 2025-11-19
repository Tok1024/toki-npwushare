'use client'

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/dropdown'
import { Button } from '@heroui/button'
import { Card, CardHeader } from '@heroui/card'
import { ArrowDownAZ, ArrowUpAZ, ChevronDown } from 'lucide-react'
import type { SortDirection, SortOption } from './_sort'

interface Props {
  sortField: SortOption
  setSortField: (option: SortOption) => void
  sortOrder: SortDirection
  setSortOrder: (direction: SortDirection) => void
}

const sortFieldLabelMap: Record<string, string> = {
  created: '创建时间',
  download: '下载数',
  like: '点赞数'
}

export const FilterBar = ({
  sortField,
  setSortField,
  sortOrder,
  setSortOrder
}: Props) => {
  return (
    <Card className="w-full border border-default-100 shadow-sm bg-white/50 backdrop-blur-sm">
      <div className="p-3 flex items-center gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              className="bg-white border border-default-200 text-slate-600"
              endContent={<ChevronDown className="size-4 text-slate-400" />}
              size="sm"
            >
              {sortFieldLabelMap[sortField]}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="排序选项"
            onAction={(key) => setSortField(key as SortOption)}
            className="min-w-[120px]"
          >
            <DropdownItem key="created" className="text-slate-600">
              创建时间
            </DropdownItem>
            <DropdownItem key="download" className="text-slate-600">
              下载数
            </DropdownItem>
            <DropdownItem key="like" className="text-slate-600">
              点赞数
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Button
          variant="flat"
          className="bg-white border border-default-200 text-slate-600"
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          startContent={
            sortOrder === 'asc' ? (
              <ArrowUpAZ className="size-4 text-slate-400" />
            ) : (
              <ArrowDownAZ className="size-4 text-slate-400" />
            )
          }
          size="sm"
        >
          {sortOrder === 'asc' ? '升序' : '降序'}
        </Button>
      </div>
    </Card>
  )
}
