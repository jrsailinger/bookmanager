import { useState } from 'react'
import {
  AlertTriangle,
  Database,
  Download,
  HardDrive,
  Info,
  Moon,
  ShieldCheck,
  Sun,
  Upload,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { useThemeStore } from '../../store/useThemeStore'
import { exportAllBooks } from '../../services/exportService'
import { toastError, toastSuccess, toastLoading, useToastStore } from '../../store/useToastStore'
import { formatDateTime } from '../../utils/format'

/**
 * 设置与备份页
 * ------------------------------------------------------------------
 * 固定展示「⚠️ 重要提醒」文案，并提供主题切换与备份导出/导入入口。
 */
interface SettingsPanelProps {
  total: number
  withCoverCount: number
  /** 最近一次数据变动时间（取录入时间最大值） */
  lastUpdated?: number
  onImport: () => void
}

export function SettingsPanel({ total, withCoverCount, lastUpdated, onImport }: SettingsPanelProps) {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const [exporting, setExporting] = useState(false)

  /** 一键导出全部藏书为 JSON 备份 */
  const handleExport = async () => {
    const toastId = toastLoading('正在生成备份文件…')
    setExporting(true)
    try {
      const count = await exportAllBooks()
      useToastStore.getState().dismiss(toastId)
      toastSuccess(`已导出 ${count} 本藏书备份（含封面图片）`)
    } catch (err) {
      useToastStore.getState().dismiss(toastId)
      toastError(`导出失败：${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* 重要提醒（固定展示，不可关闭） */}
      <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-700/60 dark:bg-amber-950/30">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          ⚠️ 重要提醒
        </h2>
        <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-amber-900/90 dark:text-amber-200/90">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
            本书单数据全部存储在浏览器本地，请勿清除浏览器缓存、网站数据，否则藏书数据永久丢失
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
            建议定期导出 JSON 备份文件，保存至电脑、手机或网盘
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
            更换设备、浏览器后，可通过导入备份文件恢复全部藏书与封面图片
          </li>
        </ul>
      </section>

      {/* 数据备份 */}
      <section className="wb-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          <Database className="h-4 w-4 text-zinc-400" />
          数据备份与恢复
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          导出的 JSON 文件包含全部字段、封面 base64 与录入时间，可直接作为备份保存，也可在任意设备导入恢复。
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">藏书总量</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {total} 本
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">含封面图片</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {withCoverCount} 本
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">最近更新</p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {lastUpdated ? formatDateTime(lastUpdated) : '—'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" onClick={handleExport} loading={exporting} icon={<Download className="h-3.5 w-3.5" />}>
            导出全部数据（JSON）
          </Button>
          <Button variant="secondary" onClick={onImport} icon={<Upload className="h-3.5 w-3.5" />}>
            导入备份 / CSV
          </Button>
        </div>
      </section>

      {/* 外观 */}
      <section className="wb-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          <Sun className="h-4 w-4 text-zinc-400" />
          外观主题
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          主题偏好会保存在本机浏览器中，下次打开自动应用。
        </p>
        <div className="mt-3 inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          {(
            [
              { key: 'light', label: '浅色', icon: Sun },
              { key: 'dark', label: '深色', icon: Moon },
            ] as const
          ).map((item) => {
            const Icon = item.icon
            const active = mode === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* 关于 */}
      <section className="wb-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          <Info className="h-4 w-4 text-zinc-400" />
          关于本工具
        </h2>
        <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            纯前端实现：无后端、无账号、不请求任何外部网络接口，全部资源本地加载
          </li>
          <li className="flex gap-2">
            <HardDrive className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            数据存储于浏览器 IndexedDB（数据库名 PaperBookManagerDB），封面图片以 Blob 存储
          </li>
          <li className="flex gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
            仅管理实体纸质藏书：不提供扫码 ISBN、不接入图书 API、不含借阅管理，全部字段手动录入
          </li>
        </ul>
      </section>
    </div>
  )
}
