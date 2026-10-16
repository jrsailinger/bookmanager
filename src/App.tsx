import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { LibraryView } from './components/book/LibraryView'
import { BookForm } from './components/book/BookForm'
import { BookDetailModal } from './components/book/BookDetailModal'
import { ImportDialog } from './components/import/ImportDialog'
import { StatsPanel } from './components/stats/StatsPanel'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import { ToastContainer } from './components/ui/Toast'
import { LoadingBlock } from './components/ui/LoadingBlock'
import { useAppInit } from './hooks/useAppInit'
import { useBooks, useBookById } from './hooks/useBooks'
import { useUiStore, type ViewKey } from './store/useUiStore'
import { useBookStore } from './store/useBookStore'
import { toastError, toastSuccess, toastLoading, useToastStore } from './store/useToastStore'
import { exportAllBooks } from './services/exportService'
import type { Book } from './types/book'

/** 各视图的标题与副标题 */
const VIEW_META: Record<ViewKey, { title: string; subtitle: string }> = {
  library: { title: '我的藏书', subtitle: '仅管理实体纸质藏书，全部字段手动录入' },
  stats: { title: '统计面板', subtitle: '藏书总量、分类占比与存放位置分布' },
  settings: { title: '设置与备份', subtitle: '数据备份、主题外观与使用说明' },
}

/**
 * 应用根组件
 * ------------------------------------------------------------------
 * 组装布局、视图切换与全局弹层（新增/编辑、详情、导入、删除确认、Toast）。
 */
export default function App() {
  // 启动初始化：主题 + IndexedDB 可用性检测 + 加载藏书
  useAppInit()

  const view = useUiStore((s) => s.view)
  const editing = useUiStore((s) => s.editing)
  const detailBook = useUiStore((s) => s.detailBook)
  const importOpen = useUiStore((s) => s.importOpen)
  const closeEditor = useUiStore((s) => s.closeEditor)
  const closeDetail = useUiStore((s) => s.closeDetail)
  const setImportOpen = useUiStore((s) => s.setImportOpen)
  const openEditor = useUiStore((s) => s.openEditor)

  const { books, visibleBooks, loading, categoryOptions, locationOptions, stats, hasActiveFilter } =
    useBooks()
  const editingBook = useBookById(editing)

  const removeBook = useBookStore((s) => s.removeBook)

  // 删除确认弹窗状态
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  /** 一键导出全部藏书 */
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

  /** 确认删除 */
  const handleConfirmDelete = async () => {
    if (!pendingDelete?.id) return
    setDeleting(true)
    try {
      await removeBook(pendingDelete.id)
      toastSuccess(`已删除《${pendingDelete.title}》`)
      setPendingDelete(null)
      closeDetail()
    } catch (err) {
      toastError(`删除失败：${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setDeleting(false)
    }
  }

  /** 最近一次数据变动时间，用于设置页展示 */
  const lastUpdated = books.reduce((max, book) => Math.max(max, book.updatedAt ?? 0), 0)

  const meta = VIEW_META[view]
  const subtitle =
    view === 'library' ? `${meta.subtitle} · 共 ${books.length} 本` : meta.subtitle

  return (
    <div className="min-h-screen bg-white text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar />

      <div className="lg:pl-64">
        <Header
          title={meta.title}
          subtitle={subtitle}
          onImport={() => setImportOpen(true)}
          onExport={handleExport}
          exporting={exporting}
        />

        <main className="px-4 py-5 sm:px-6 sm:py-6">
          {/* 数据库读取失败时的显式错误态 */}
          <DbErrorNotice />

          {view === 'library' ? (
            <LibraryView
              books={books}
              visibleBooks={visibleBooks}
              loading={loading}
              categoryOptions={categoryOptions}
              locationOptions={locationOptions}
              hasActiveFilter={hasActiveFilter}
              onDelete={setPendingDelete}
            />
          ) : null}

          {view === 'stats' ? (
            loading ? (
              <LoadingBlock />
            ) : (
              <StatsPanel
                total={stats.total}
                categoryCount={stats.categoryCount}
                locationCount={stats.locationCount}
                withCoverCount={stats.withCoverCount}
                byCategory={stats.byCategory}
                byLocation={stats.byLocation}
              />
            )
          ) : null}

          {view === 'settings' ? (
            <SettingsPanel
              total={stats.total}
              withCoverCount={stats.withCoverCount}
              lastUpdated={lastUpdated || undefined}
              onImport={() => setImportOpen(true)}
            />
          ) : null}
        </main>
      </div>

      {/* ---------------- 全局弹层 ---------------- */}

      {/* 新增 / 编辑 */}
      <BookForm target={editing} book={editingBook} onClose={closeEditor} />

      {/* 详情 */}
      <BookDetailModal
        book={detailBook}
        onClose={closeDetail}
        onEdit={(book) => openEditor(book.id!)}
        onDelete={(book) => setPendingDelete(book)}
      />

      {/* 导入 */}
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />

      {/* 删除确认 */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        danger
        loading={deleting}
        title="删除这本藏书？"
        message={`即将删除《${pendingDelete?.title ?? ''}》，删除后无法撤销。如需保留请先导出备份文件。`}
        confirmText="确认删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* 全局提示 */}
      <ToastContainer />
    </div>
  )
}

/** IndexedDB 读取失败提示（隐私模式 / 存储被禁用） */
function DbErrorNotice() {
  const dbError = useBookStore((s) => s.dbError)
  if (!dbError) return null
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">本地数据库读取失败</p>
        <p className="mt-0.5">{dbError}</p>
        <p className="mt-0.5">请确认浏览器未处于无痕模式、未禁用网站存储，然后刷新页面重试。</p>
      </div>
    </div>
  )
}
