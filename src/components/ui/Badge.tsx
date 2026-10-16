import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

/** 小标签：分类 / 存放位置 / 年份 */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'brand' | 'amber'
  className?: string
}) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-4',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
