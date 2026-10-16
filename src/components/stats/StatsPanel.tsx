import { BarChart3, BookOpen, Image, MapPin, Tag } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Bucket } from '../../types/book'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { useUiStore } from '../../store/useUiStore'
import { UNCATEGORIZED } from '../../services/statsService'
import { cn } from '../../utils/cn'

/**
 * 统计面板
 * 仅做简易统计：总量 + 各分类占比 + 存放位置分布，纯文字 + 简易条形，不引入图表库。
 */
interface StatsPanelProps {
  total: number
  categoryCount: number
  locationCount: number
  withCoverCount: number
  byCategory: Bucket[]
  byLocation: Bucket[]
}

/** 概览数字卡 */
function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: number
  hint?: string
}) {
  return (
    <div className="wb-card px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{hint}</p> : null}
    </div>
  )
}

/** 简易条形分布 */
function BarList({ title, buckets, total, fallbackName }: {
  title: string
  buckets: Bucket[]
  total: number
  fallbackName: string
}) {
  return (
    <div className="wb-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">共 {buckets.length} 类</span>
      </div>

      {buckets.length === 0 ? (
        <p className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">暂无数据</p>
      ) : (
        <ul className="space-y-2.5">
          {buckets.map((bucket) => (
            <li key={bucket.name}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                <span
                  className={cn(
                    'truncate',
                    bucket.name === fallbackName
                      ? 'text-zinc-400 dark:text-zinc-500'
                      : 'text-zinc-700 dark:text-zinc-200',
                  )}
                  title={bucket.name}
                >
                  {bucket.name}
                </span>
                <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                  {bucket.count} 本 · {bucket.percent}%
                </span>
              </div>
              {/* 条形宽度按占比渲染 */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all dark:bg-brand-400"
                  style={{ width: `${Math.max(bucket.percent, total === 0 ? 0 : 1.5)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function StatsPanel({
  total,
  categoryCount,
  locationCount,
  withCoverCount,
  byCategory,
  byLocation,
}: StatsPanelProps) {
  const openEditor = useUiStore((s) => s.openEditor)

  if (total === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-5 w-5" />}
        title="还没有可统计的数据"
        description="录入第一本藏书后，这里会展示藏书总量、各分类占比与存放位置分布。"
        action={
          <Button variant="primary" size="sm" onClick={() => openEditor('new')}>
            新增藏书
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<BookOpen className="h-3.5 w-3.5" />} label="藏书总量" value={total} hint="本" />
        <StatCard
          icon={<Tag className="h-3.5 w-3.5" />}
          label="分类数量"
          value={categoryCount}
          hint={categoryCount === 0 ? '还没有填写分类' : '个分类'}
        />
        <StatCard
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="存放位置"
          value={locationCount}
          hint={locationCount === 0 ? '还没有填写位置' : '个位置'}
        />
        <StatCard
          icon={<Image className="h-3.5 w-3.5" />}
          label="含封面"
          value={withCoverCount}
          hint={`${Math.round((withCoverCount / total) * 100)}% 的藏书有封面`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarList
          title="各分类藏书占比"
          buckets={byCategory}
          total={total}
          fallbackName={UNCATEGORIZED}
        />
        <BarList title="存放位置分布" buckets={byLocation} total={total} fallbackName="未记录位置" />
      </div>
    </div>
  )
}
