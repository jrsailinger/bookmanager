import type { Book } from '../../types/book'
import { DataRiskBanner } from '../layout/DataRiskBanner'
import { FilterBar } from './FilterBar'
import { BookGrid } from './BookGrid'
import { LoadingBlock } from '../ui/LoadingBlock'
import { useBookStore } from '../../store/useBookStore'

/**
 * 藏书列表视图
 * 组成：数据风险提示条 + 检索筛选栏 + 卡片网格（含空状态 / 加载态）
 */
interface LibraryViewProps {
  books: Book[]
  visibleBooks: Book[]
  loading: boolean
  categoryOptions: string[]
  locationOptions: string[]
  hasActiveFilter: boolean
  onDelete: (book: Book) => void
}

export function LibraryView({
  books,
  visibleBooks,
  loading,
  categoryOptions,
  locationOptions,
  hasActiveFilter,
  onDelete,
}: LibraryViewProps) {
  const resetFilters = useBookStore((s) => s.resetFilters)

  return (
    <div>
      <DataRiskBanner />

      <FilterBar
        categoryOptions={categoryOptions}
        locationOptions={locationOptions}
        resultCount={visibleBooks.length}
        totalCount={books.length}
      />

      {loading ? (
        <LoadingBlock />
      ) : (
        <BookGrid
          books={visibleBooks}
          hasActiveFilter={hasActiveFilter}
          hasAnyBook={books.length > 0}
          onDelete={onDelete}
          onResetFilters={resetFilters}
        />
      )}
    </div>
  )
}
