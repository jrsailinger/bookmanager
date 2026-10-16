import { useMemo } from 'react'
import { useBookStore } from '../store/useBookStore'
import { applyFilters, extractOptions } from '../services/bookService'
import { computeStats } from '../services/statsService'
import type { Book, BookStats } from '../types/book'

/**
 * 藏书数据 hook
 * ------------------------------------------------------------------
 * 把「原始数据 + 筛选条件」派生为列表、下拉选项、统计数据，
 * 用 useMemo 缓存，避免每次渲染都重新过滤。
 */
export interface UseBooksResult {
  /** 全量藏书 */
  books: Book[]
  /** 应用筛选与排序后的藏书 */
  visibleBooks: Book[]
  /** 是否正在加载 */
  loading: boolean
  /** 分类选项 */
  categoryOptions: string[]
  /** 存放位置选项 */
  locationOptions: string[]
  /** 统计信息 */
  stats: BookStats
  /** 是否存在筛选条件（用于区分「无数据」与「无结果」两种空状态） */
  hasActiveFilter: boolean
}

export function useBooks(): UseBooksResult {
  const books = useBookStore((s) => s.books)
  const loading = useBookStore((s) => s.loading)
  const filters = useBookStore((s) => s.filters)

  const visibleBooks = useMemo(() => applyFilters(books, filters), [books, filters])
  const categoryOptions = useMemo(() => extractOptions(books, 'category'), [books])
  const locationOptions = useMemo(() => extractOptions(books, 'location'), [books])
  const stats = useMemo(() => computeStats(books), [books])

  const hasActiveFilter = Boolean(
    filters.keyword.trim() || filters.category || filters.location,
  )

  return {
    books,
    visibleBooks,
    loading,
    categoryOptions,
    locationOptions,
    stats,
    hasActiveFilter,
  }
}

/** 按 id 取单本藏书（编辑弹窗复用；'new' 或 null 时返回 undefined） */
export function useBookById(id: 'new' | number | null): Book | undefined {
  return useBookStore((s) =>
    typeof id === 'number' ? s.books.find((b) => b.id === id) : undefined,
  )
}
