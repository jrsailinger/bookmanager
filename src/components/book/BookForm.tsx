import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ImagePlus, Loader2, Save, Trash2 } from 'lucide-react'
import type { Book, BookFormValues } from '../../types/book'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, Input, Textarea } from '../ui/Form'
import { useBookStore } from '../../store/useBookStore'
import { toastError, toastSuccess, toastLoading, useToastStore } from '../../store/useToastStore'
import { useCoverUrl } from '../../hooks/useCoverUrl'
import { formatDate } from '../../utils/format'

/**
 * 新增 / 编辑藏书表单
 * ------------------------------------------------------------------
 * 校验规则：仅【书名】必填，其余字段全部选填。
 * 封面以 Blob 形式存 IndexedDB，支持上传、更换、删除。
 */
interface BookFormProps {
  /** null = 关闭；'new' = 新增；number = 编辑指定 id */
  target: 'new' | number | null
  /** 编辑目标数据（新增时为 undefined） */
  book?: Book
  onClose: () => void
}

/** 封面文件大小上限 */
const MAX_COVER_SIZE = 8 * 1024 * 1024

/** 空表单初始值 */
const EMPTY_FORM: BookFormValues = {
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  publishYear: '',
  category: '',
  location: '',
  purchaseDate: '',
  notes: '',
  cover: null,
  coverMime: undefined,
}

export function BookForm({ target, book, onClose }: BookFormProps) {
  const open = target !== null
  const isEdit = typeof target === 'number'

  const createBook = useBookStore((s) => s.createBook)
  const editBook = useBookStore((s) => s.editBook)

  const [values, setValues] = useState<BookFormValues>(EMPTY_FORM)
  const [titleError, setTitleError] = useState('')
  const [saving, setSaving] = useState(false)

  // 打开弹窗时同步初始数据（编辑带出原值，新增置空）
  useEffect(() => {
    if (!open) return
    if (book) {
      setValues({
        title: book.title ?? '',
        author: book.author ?? '',
        isbn: book.isbn ?? '',
        publisher: book.publisher ?? '',
        publishYear: book.publishYear ?? '',
        category: book.category ?? '',
        location: book.location ?? '',
        purchaseDate: book.purchaseDate ?? '',
        notes: book.notes ?? '',
        cover: book.cover ?? null,
        coverMime: book.coverMime,
      })
    } else {
      setValues(EMPTY_FORM)
    }
    setTitleError('')
  }, [open, book])

  const previewUrl = useCoverUrl(values.cover)

  /** 更新单个字段 */
  const setField = <K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (key === 'title') setTitleError('')
  }

  /** 选择封面图片 */
  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // 允许重复选择同一文件
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toastError('请选择图片文件（jpg / png / webp 等）')
      return
    }
    if (file.size > MAX_COVER_SIZE) {
      toastError('封面图片不能超过 8MB')
      return
    }
    setValues((prev) => ({ ...prev, cover: file, coverMime: file.type }))
  }

  /** 删除封面（仅清空当前表单中的封面，保存后生效） */
  const handleCoverRemove = () => {
    setValues((prev) => ({ ...prev, cover: null, coverMime: undefined }))
  }

  const titleTrimmed = useMemo(() => values.title.trim(), [values.title])

  /** 提交保存 */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    // 唯一校验：书名不能为空
    if (!titleTrimmed) {
      setTitleError('书名不能为空')
      toastError('请填写书名')
      return
    }

    const payload: BookFormValues = {
      ...values,
      title: titleTrimmed,
      // 文本字段统一去首尾空格
      author: values.author?.trim() ?? '',
      isbn: values.isbn?.trim() ?? '',
      publisher: values.publisher?.trim() ?? '',
      publishYear: values.publishYear?.trim() ?? '',
      category: values.category?.trim() ?? '',
      location: values.location?.trim() ?? '',
      notes: values.notes?.trim() ?? '',
    }

    const toastId = toastLoading(isEdit ? '正在保存修改…' : '正在保存…')
    setSaving(true)
    const dismissToast = () => useToastStore.getState().dismiss(toastId)
    try {
      if (isEdit && typeof target === 'number') {
        await editBook(target, payload)
      } else {
        await createBook(payload)
      }
      dismissToast()
      toastSuccess(isEdit ? '修改已保存' : '藏书已添加')
      onClose()
    } catch (err) {
      dismissToast()
      toastError(`保存失败：${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      size="lg"
      dismissible={!saving}
      onClose={onClose}
      title={isEdit ? '编辑藏书' : '新增藏书'}
      description="除「书名」外其余字段均为选填，随时可以回来修改。"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button
            type="submit"
            form="book-form"
            variant="primary"
            loading={saving}
            icon={<Save className="h-3.5 w-3.5" />}
          >
            {isEdit ? '保存修改' : '保存藏书'}
          </Button>
        </>
      }
    >
      <form id="book-form" onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[200px_1fr]">
        {/* 左：封面 */}
        <div>
          <label className="wb-label">封面图片</label>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60">
            {previewUrl ? (
              <img src={previewUrl} alt="封面预览" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center text-zinc-400 dark:text-zinc-500">
                <ImagePlus className="h-5 w-5" />
                <p className="text-[11px] leading-4">未上传封面时将自动生成书名首字色块占位图</p>
              </div>
            )}
            {saving && previewUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex gap-2">
            <label className="inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <ImagePlus className="h-3.5 w-3.5" />
              {previewUrl ? '更换封面' : '上传封面'}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </label>
            {previewUrl ? (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={handleCoverRemove}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                删除
              </Button>
            ) : null}
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-zinc-400 dark:text-zinc-500">
            支持 jpg / png / webp，单张不超过 8MB，图片保存在浏览器本地数据库。
          </p>
        </div>

        {/* 右：字段 */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="书名" required error={titleError} className="sm:col-span-2">
            <Input
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="例如：百年孤独"
              aria-invalid={Boolean(titleError)}
              autoFocus
            />
          </Field>

          <Field label="作者">
            <Input
              value={values.author}
              onChange={(e) => setField('author', e.target.value)}
              placeholder="例如：加西亚·马尔克斯"
            />
          </Field>

          <Field label="ISBN">
            <Input
              value={values.isbn}
              onChange={(e) => setField('isbn', e.target.value)}
              placeholder="例如：978-7-5442-5399-4"
            />
          </Field>

          <Field label="出版社">
            <Input
              value={values.publisher}
              onChange={(e) => setField('publisher', e.target.value)}
              placeholder="例如：南海出版公司"
            />
          </Field>

          <Field label="出版年份">
            <Input
              value={values.publishYear}
              onChange={(e) => setField('publishYear', e.target.value)}
              placeholder="例如：2011"
            />
          </Field>

          <Field label="分类 / 标签" hint="建议使用统一写法，便于筛选与统计">
            <Input
              value={values.category}
              onChange={(e) => setField('category', e.target.value)}
              placeholder="例如：文学 / 历史 / 技术"
            />
          </Field>

          <Field label="存放位置">
            <Input
              value={values.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="例如：书房 A 架 2 层"
            />
          </Field>

          <Field label="购入日期">
            <Input
              type="date"
              value={values.purchaseDate}
              onChange={(e) => setField('purchaseDate', e.target.value)}
            />
          </Field>

          <Field
            label="录入日期"
            hint={book ? `本书记录于 ${formatDate(book.createdAt)}` : '保存后由系统自动记录，无需填写'}
            className="sm:col-span-1"
          >
            <Input value={book ? formatDate(book.createdAt) : '保存时自动生成'} disabled readOnly />
          </Field>

          <Field label="备注" className="sm:col-span-2">
            <Textarea
              value={values.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="版本、品相、读后感想、借出记录等自由记录…"
              rows={3}
            />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
