import { BarChart3, BookOpen, Library, Moon, Settings, ShieldAlert, Sun, X } from 'lucide-react'
import { useUiStore, type ViewKey } from '../../store/useUiStore'
import { useThemeStore } from '../../store/useThemeStore'
import { useBookStore } from '../../store/useBookStore'
import { cn } from '../../utils/cn'

/** 侧边导航项 */
const NAV_ITEMS: { key: ViewKey; label: string; icon: typeof Library }[] = [
  { key: 'library', label: '我的藏书', icon: Library },
  { key: 'stats', label: '统计面板', icon: BarChart3 },
  { key: 'settings', label: '设置与备份', icon: Settings },
]

/**
 * 左侧导航栏
 * 桌面端常驻固定，窄屏（<lg）作为抽屉展开。
 */
export function Sidebar() {
  const view = useUiStore((s) => s.view)
  const setView = useUiStore((s) => s.setView)
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const mode = useThemeStore((s) => s.mode)
  const toggleTheme = useThemeStore((s) => s.toggle)

  const total = useBookStore((s) => s.books.length)

  return (
    <>
      {/* 窄屏遮罩 */}
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-zinc-900/40 lg:hidden"
          onClick={() => toggleSidebar(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-200',
          'dark:border-zinc-800 dark:bg-zinc-950',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* 品牌区 */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <BookOpen className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">我的藏书</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">纸质书本地管理</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleSidebar(false)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-200 lg:hidden dark:hover:bg-zinc-800"
            aria-label="收起导航"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = view === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setView(item.key)}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                    : 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.key === 'library' ? (
                  <span className="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    {total}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto space-y-3 px-3 pb-5">
          {/* 主题切换 */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            {mode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            切换到{mode === 'dark' ? '浅色' : '深色'}主题
          </button>

          {/* 常驻风险提示（侧边栏简版） */}
          <div className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2.5 dark:border-amber-800/60 dark:bg-amber-950/30">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-3.5 w-3.5" />
              数据仅存本机浏览器
            </p>
            <p className="mt-1 text-[11px] leading-4 text-amber-700 dark:text-amber-400/90">
              清缓存会丢数据，请定期导出备份。
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
