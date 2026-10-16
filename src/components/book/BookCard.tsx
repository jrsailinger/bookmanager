import { MapPin, Pencil, Trash2 } from 'lucide-react'
import type { Book } from '../../types/book'
import { BookCover } from './BookCover'
import { Badge } from '../ui/Badge'
import { useUiStore } from '../../store/useUiStore'
import { formatDate } from '../../utils/format'

/**
 * 藏书卡片
 * 点击卡片查看详情；右上角悬浮操作按钮可编辑 / 删除。
 */
export function BookCard({ book, onDelete }: { book: Book; onDelete: (book: Book) => void }) {
  const openDetail = useUiStore((s) => s.openDetail)
  const openEditor = useUiStore((s) => s.openEditor)

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* 封面区 */}
      <button
        type="button"
        onClick={() => openDetail(book)}
        className="block aspect-[3/4] w-full overflow-hidden bg-zinc-100 text-left dark:bg-zinc-800"
        title="查看详情"
      >
        <BookCover title={book.title} cover={book.cover} />
      </button>

      {/* 悬浮操作 */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          aria-label="编辑"
          onClick={() => openEditor(book.id!)}
          className="rounded-md bg-white/90 p-1.5 text-zinc-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-brand-600 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="删除"
          onClick={() => onDelete(book)}
          className="rounded-md bg-white/90 p-1.5 text-zinc-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-red-600 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 信息区 */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <button
          type="button"
          onClick={() => openDetail(book)}
          className="line-clamp-2 text-left text-sm font-semibold leading-5 text-zinc-900 hover:text-brand-600 dark:text-zinc-50 dark:hover:text-brand-400"
        >
          {book.title}
        </button>

        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {book.author?.trim() || '佚名'}
          {book.publishYear?.trim() ? ` · ${book.publishYear}` : ''}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1.5">
          {book.category?.trim() ? <Badge tone="brand">{book.category}</Badge> : null}
          {book.location?.trim() ? (
            <Badge>
              <MapPin className="mr-0.5 h-2.5 w-2.5" />
              {book.location}
            </Badge>
          ) : null}
        </div>

        <p className="pt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
          录入于 {formatDate(book.createdAt)}
        </p>
      </div>
    </article>
  )
}
