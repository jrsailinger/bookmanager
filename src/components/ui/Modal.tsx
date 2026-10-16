import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * 通用弹窗
 * - 通过 Portal 渲染到 body，避免被父级 overflow 裁剪
 * - 支持 ESC 关闭、点击遮罩关闭、打开时锁定页面滚动
 */
interface ModalProps {
  open: boolean
  title: ReactNode
  description?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** 宽度档位 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否允许点击遮罩 / ESC 关闭（如导入进行中可关闭） */
  dismissible?: boolean
}

const SIZE_CLASS = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
  dismissible = true,
}: ModalProps) {
  // 打开时锁定 body 滚动
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // ESC 关闭
  useEffect(() => {
    if (!open || !dismissible) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, dismissible, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/45 p-4 backdrop-blur-[2px] animate-fade-in sm:items-center"
      onMouseDown={(event) => {
        if (!dismissible) return
        // 仅点击遮罩本身时关闭
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'my-4 w-full rounded-xl border border-zinc-200 bg-white shadow-pop animate-slide-up',
          'dark:border-zinc-800 dark:bg-zinc-900',
          SIZE_CLASS[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="px-5 py-4">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
