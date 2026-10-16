import { Loader2 } from 'lucide-react'

/** 全屏加载占位 */
export function LoadingBlock({ text = '正在读取本地藏书…' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-400 dark:text-zinc-500">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-xs">{text}</p>
    </div>
  )
}
