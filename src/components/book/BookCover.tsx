import { BookOpen } from 'lucide-react'
import { useCoverUrl } from '../../hooks/useCoverUrl'
import { colorFromString, getTitleInitial } from '../../utils/cover'
import { cn } from '../../utils/cn'

/**
 * 图书封面
 * - 有封面时渲染 Blob 图片
 * - 无封面时用「书名首字 + 稳定色块」生成占位图形
 */
interface BookCoverProps {
  title: string
  cover?: Blob | null
  className?: string
  /** 占位图字号档位 */
  size?: 'sm' | 'md' | 'lg'
}

const INITIAL_SIZE = {
  sm: 'text-lg',
  md: 'text-3xl',
  lg: 'text-5xl',
}

export function BookCover({ title, cover, className, size = 'md' }: BookCoverProps) {
  const url = useCoverUrl(cover)

  if (url) {
    return (
      <img
        src={url}
        alt={`${title} 封面`}
        loading="lazy"
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  const { bg, fg } = colorFromString(title || 'book')

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-1',
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
      aria-label={`${title} 暂无封面`}
    >
      <BookOpen className="h-4 w-4 opacity-50" />
      <span className={cn('font-semibold leading-none', INITIAL_SIZE[size])}>
        {getTitleInitial(title)}
      </span>
    </div>
  )
}
