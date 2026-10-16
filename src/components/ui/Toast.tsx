import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Info, Loader2, X } from 'lucide-react'
import { useToastStore, type ToastItem } from '../../store/useToastStore'
import { cn } from '../../utils/cn'

/** 不同提示类型的图标与配色 */
const TOAST_STYLE: Record<ToastItem['type'], { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: AlertCircle, className: 'text-red-600 dark:text-red-400' },
  info: { icon: Info, className: 'text-brand-600 dark:text-brand-400' },
  loading: { icon: Loader2, className: 'text-zinc-500 dark:text-zinc-400' },
}

/** 单条提示：非 loading 类型到点自动关闭 */
function ToastCard({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const { icon: Icon, className } = TOAST_STYLE[toast.type]

  useEffect(() => {
    if (toast.type === 'loading') return
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration ?? 3000)
    return () => window.clearTimeout(timer)
  }, [toast.id, toast.type, toast.duration, dismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-2.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-3 shadow-pop animate-toast-in',
        'dark:border-zinc-800 dark:bg-zinc-900',
      )}
      role="status"
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', className, toast.type === 'loading' && 'animate-spin')} />
      <p className="flex-1 text-sm leading-5 text-zinc-700 dark:text-zinc-200">{toast.message}</p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="关闭提示"
        className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

/** 右下角提示容器 */
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}
