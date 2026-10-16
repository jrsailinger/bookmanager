import { Calendar, Clock, Hash, MapPin, Pencil, Tag, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Book } from '../../types/book'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { BookCover } from './BookCover'
import { formatDate, formatDateTime } from '../../utils/format'

/**
 * 藏书详情弹窗
 * 展示全部字段，并提供编辑 / 删除入口。
 */
interface BookDetailModalProps {
  book: Book | null
  onClose: () => void
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

/** 详情行：字段名 + 值 */
function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex gap-2.5 py-1.5">
      <span className="mt-0.5 text-zinc-400 dark:text-zinc-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{label}</p>
        <p className="break-words text-sm text-zinc-800 dark:text-zinc-100">{value?.trim() || '—'}</p>
      </div>
    </div>
  )
}

export function BookDetailModal({ book, onClose, onEdit, onDelete }: BookDetailModalProps) {
  return (
    <Modal
      open={Boolean(book)}
      size="md"
      onClose={onClose}
      title={book?.title ?? ''}
      description={book?.author?.trim() || '未填写作者'}
      footer={
        book ? (
          <>
            <Button
              variant="ghost"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => onDelete(book)}
              className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              删除
            </Button>
            <Button variant="secondary" onClick={onClose}>
              关闭
            </Button>
            <Button variant="primary" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => onEdit(book)}>
              编辑
            </Button>
          </>
        ) : null
      }
    >
      {book ? (
        <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
            <BookCover title={book.title} cover={book.cover} size="lg" />
          </div>

          <div className="min-w-0 divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="grid grid-cols-2 gap-x-3">
              <DetailRow icon={<Hash className="h-3.5 w-3.5" />} label="ISBN" value={book.isbn} />
              <DetailRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="出版年份"
                value={book.publishYear}
              />
              <DetailRow icon={<Tag className="h-3.5 w-3.5" />} label="出版社" value={book.publisher} />
              <DetailRow
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="存放位置"
                value={book.location}
              />
              <DetailRow icon={<Tag className="h-3.5 w-3.5" />} label="分类 / 标签" value={book.category} />
              <DetailRow
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="购入日期"
                value={book.purchaseDate}
              />
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">备注</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                {book.notes?.trim() || '—'}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                录入于 {formatDateTime(book.createdAt)}
              </span>
              {book.updatedAt !== book.createdAt ? <span>最近修改 {formatDate(book.updatedAt)}</span> : null}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
