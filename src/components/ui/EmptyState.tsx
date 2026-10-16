import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

/** 空状态提示：无数据 / 搜索无结果 / 加载失败共用 */
interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center',
        'dark:border-zinc-700',
        className,
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-xs leading-5 text-zinc-500 dark:text-zinc-400">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex items-center gap-2">{action}</div> : null}
    </div>
  )
}
