import { BookPlus, SearchX } from 'lucide-react'
import type { Book } from '../../types/book'
import { BookCard } from './BookCard'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { useUiStore } from '../../store/useUiStore'

/**
 * 藏书卡片网格
 * 区分两种空状态：库里真没书（引导新增）与筛选无结果（引导清空条件）。
 */
interface BookGridProps {
  books: Book[]
  /** 是否存在生效中的筛选条件 */
  hasActiveFilter: boolean
  /** 库里是否存在任何藏书 */
  hasAnyBook: boolean
  onDelete: (book: Book) => void
  onResetFilters: () => void
}

export function BookGrid({ books, hasActiveFilter, hasAnyBook, onDelete, onResetFilters }: BookGridProps) {
  const openEditor = useUiStore((s) => s.openEditor)

  // 空状态 1：搜索/筛选无结果
  if (books.length === 0 && hasActiveFilter) {
    return (
      <EmptyState
        icon={<SearchX className="h-5 w-5" />}
        title="没有符合条件的藏书"
        description="换个关键词试试，或清空当前的分类、存放位置筛选条件。"
        action={
          <Button variant="secondary" size="sm" onClick={onResetFilters}>
            清空筛选条件
          </Button>
        }
      />
    )
  }

  // 空状态 2：完全没有任何藏书
  if (books.length === 0 && !hasAnyBook) {
    return (
      <EmptyState
        icon={<BookPlus className="h-5 w-5" />}
        title="书架还是空的"
        description="点击「新增藏书」手动录入你的第一本纸质书。本工具不扫码、不联网，全部字段手动填写，只有书名必填。"
        action={
          <Button variant="primary" size="sm" onClick={() => openEditor('new')}>
            新增第一本书
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onDelete={onDelete} />
      ))}
    </div>
  )
}
