import { Download, Menu, Moon, Plus, Sun, Upload } from 'lucide-react'
import { Button } from '../ui/Button'
import { useUiStore } from '../../store/useUiStore'
import { useThemeStore } from '../../store/useThemeStore'

/** 顶部工具栏：全局操作入口（导入 / 导出 / 新增） */
interface HeaderProps {
  title: string
  subtitle?: string
  onImport: () => void
  onExport: () => void
  exporting?: boolean
}

export function Header({ title, subtitle, onImport, onExport, exporting }: HeaderProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const openEditor = useUiStore((s) => s.openEditor)
  const mode = useThemeStore((s) => s.mode)
  const toggleTheme = useThemeStore((s) => s.toggle)

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => toggleSidebar()}
          aria-label="打开导航"
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="切换主题"
            className="sm:hidden"
          >
            {mode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Button variant="secondary" size="sm" icon={<Upload className="h-3.5 w-3.5" />} onClick={onImport}>
            <span className="hidden sm:inline">导入</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="h-3.5 w-3.5" />}
            onClick={onExport}
            loading={exporting}
          >
            <span className="hidden sm:inline">导出备份</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => openEditor('new')}
          >
            新增藏书
          </Button>
        </div>
      </div>
    </header>
  )
}
