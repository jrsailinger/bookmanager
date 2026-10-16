import { ArrowDownUp, Filter, RotateCcw, Search } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Form'
import { useBookStore } from '../../store/useBookStore'
import type { SortKey } from '../../types/book'

/**
 * 列表工具栏：搜索 + 分类筛选 + 存放位置筛选 + 排序
 */
interface FilterBarProps {
  categoryOptions: string[]
  locationOptions: string[]
  /** 当前结果数量 */
  resultCount: number
  totalCount: number
}

/** 排序选项 */
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'createdAtDesc', label: '录入时间（新→旧）' },
  { value: 'createdAtAsc', label: '录入时间（旧→新）' },
  { value: 'titleAsc', label: '书名（A→Z）' },
  { value: 'authorAsc', label: '作者（A→Z）' },
]

export function FilterBar({ categoryOptions, locationOptions, resultCount, totalCount }: FilterBarProps) {
  const filters = useBookStore((s) => s.filters)
  const setFilter = useBookStore((s) => s.setFilter)
  const resetFilters = useBookStore((s) => s.resetFilters)

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* 全文检索：书名 / 作者 / ISBN / 备注 */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={filters.keyword}
            onChange={(e) => setFilter('keyword', e.target.value)}
            placeholder="搜索书名、作者、ISBN 或备注…"
            className="pl-9"
            aria-label="搜索藏书"
          />
        </div>

        <div className="flex gap-2">
          {/* 分类筛选 */}
          <Select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            aria-label="按分类筛选"
            className="min-w-0 flex-1 sm:w-36 sm:flex-none"
          >
            <option value="">全部分类</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          {/* 存放位置筛选 */}
          <Select
            value={filters.location}
            onChange={(e) => setFilter('location', e.target.value)}
            aria-label="按存放位置筛选"
            className="min-w-0 flex-1 sm:w-40 sm:flex-none"
          >
            <option value="">全部位置</option>
            {locationOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          {/* 排序 */}
          <Select
            value={filters.sortBy}
            onChange={(e) => setFilter('sortBy', e.target.value as SortKey)}
            aria-label="排序方式"
            className="min-w-0 flex-1 sm:w-44 sm:flex-none"
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 结果统计 + 重置 */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Filter className="h-3.5 w-3.5" />
        <span>
          共 {totalCount} 本，当前显示 <span className="font-medium text-zinc-700 dark:text-zinc-200">{resultCount}</span> 本
        </span>
        <ArrowDownUp className="ml-2 h-3.5 w-3.5" />
        <Button variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={resetFilters}>
          重置
        </Button>
      </div>
    </div>
  )
}
