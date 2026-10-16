import { AlertTriangle, X } from 'lucide-react'
import { useUiStore } from '../../store/useUiStore'

/**
 * 数据风险提示条
 * 醒目地告知用户：数据仅存浏览器本地，清缓存即丢，务必定期导出备份。
 */
export function DataRiskBanner() {
  const dismissed = useUiStore((s) => s.riskBannerDismissed)
  const dismiss = useUiStore((s) => s.dismissRiskBanner)

  if (dismissed) return null

  return (
    <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700/60 dark:bg-amber-950/40">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="min-w-0 flex-1 text-xs leading-5 text-amber-900 dark:text-amber-200">
        <p className="font-semibold">数据保存在本机浏览器中，请务必留意</p>
        <p className="mt-0.5">
          清除浏览器缓存 / 网站数据会导致全部藏书（含封面）永久丢失；建议定期点击右上角「导出备份」保存 JSON
          文件到电脑或网盘。更换设备或浏览器后，可用「导入」恢复。
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="关闭提示"
        className="rounded p-1 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
