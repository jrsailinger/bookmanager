import { db } from './db'
import type { Book, BookFilters, BookFormValues, DedupeKey, SortKey } from '../types/book'

/**
 * 图书数据访问层
 * ------------------------------------------------------------------
 * 所有对 IndexedDB 的读写都集中在这里，组件只调用本文件导出的函数，
 * 保证数据操作可测试、可复用。
 */

/** 规范化 ISBN：去掉连字符、空格，转大写 */
export function normalizeIsbn(isbn?: string): string {
  return (isbn ?? '').replace(/[\s-]/g, '').toUpperCase()
}

/** 规范化一般文本：去首尾空格、压缩内部空白、转小写，用于比对 */
function normalizeText(value?: string): string {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
}

/** 生成一条记录的去重键 */
export function buildDedupeKey(book: Pick<Book, 'isbn' | 'title' | 'author'>): DedupeKey {
  return {
    isbn: normalizeIsbn(book.isbn),
    titleAuthor: `${normalizeText(book.title)}||${normalizeText(book.author)}`,
  }
}

/** 读取全部藏书（按录入时间倒序） */
export async function getAllBooks(): Promise<Book[]> {
  const list = await db.books.orderBy('createdAt').reverse().toArray()
  return list
}

/** 按 id 读取单本 */
export async function getBookById(id: number): Promise<Book | undefined> {
  return db.books.get(id)
}

/** 新增一本藏书，自动写入录入时间与更新时间 */
export async function addBook(values: BookFormValues): Promise<number> {
  const now = Date.now()
  return db.books.add({
    ...values,
    title: values.title.trim(),
    createdAt: now,
    updatedAt: now,
  })
}

/** 更新一本藏书，保留原始 createdAt */
export async function updateBook(id: number, values: BookFormValues): Promise<void> {
  await db.books.update(id, {
    ...values,
    title: values.title.trim(),
    updatedAt: Date.now(),
  })
}

/** 删除一本藏书 */
export async function deleteBook(id: number): Promise<void> {
  await db.books.delete(id)
}

/** 批量新增（导入用），走事务保证要么全成功要么回滚 */
export async function bulkAddBooks(values: BookFormValues[]): Promise<number> {
  if (values.length === 0) return 0
  const now = Date.now()
  const rows: Book[] = values.map((v, index) => ({
    ...v,
    title: v.title.trim(),
    // 同一批次内微小错开时间戳，保证「录入时间」排序稳定
    createdAt: now + index,
    updatedAt: now + index,
  }))
  await db.transaction('rw', db.books, async () => {
    await db.books.bulkAdd(rows)
  })
  return rows.length
}

/** 取出已有藏书的全部去重键，用于导入时增量判重 */
export async function getExistingDedupeKeys(): Promise<Set<string>> {
  const rows = await db.books.toArray()
  const keys = new Set<string>()
  for (const row of rows) {
    const key = buildDedupeKey(row)
    // ISBN 优先：非空则仅以 ISBN 作为判重依据
    if (key.isbn) keys.add(`isbn:${key.isbn}`)
    else keys.add(`ta:${key.titleAuthor}`)
  }
  return keys
}

/** 依据筛选条件过滤 + 排序（数据量级为个人藏书，内存中处理足够且更灵活） */
export function applyFilters(books: Book[], filters: BookFilters): Book[] {
  const keyword = filters.keyword.trim().toLowerCase()

  const filtered = books.filter((book) => {
    // 分类筛选
    if (filters.category && (book.category ?? '') !== filters.category) return false
    // 存放位置筛选
    if (filters.location && (book.location ?? '') !== filters.location) return false
    // 关键词全文检索：书名 / 作者 / ISBN / 备注
    if (keyword) {
      const haystack = [book.title, book.author, book.isbn, book.notes]
        .map((v) => (v ?? '').toLowerCase())
        .join('\n')
      if (!haystack.includes(keyword)) return false
    }
    return true
  })

  return sortBooks(filtered, filters.sortBy)
}

/** 排序 */
export function sortBooks(books: Book[], sortBy: SortKey): Book[] {
  const collator = new Intl.Collator('zh-Hans-CN', { numeric: true, sensitivity: 'base' })
  const list = [...books]

  switch (sortBy) {
    case 'createdAtAsc':
      return list.sort((a, b) => a.createdAt - b.createdAt)
    case 'titleAsc':
      return list.sort((a, b) => collator.compare(a.title ?? '', b.title ?? ''))
    case 'authorAsc':
      return list.sort((a, b) => {
        // 作者为空时排到最后，避免空值干扰
        const av = (a.author ?? '').trim()
        const bv = (b.author ?? '').trim()
        if (!av && !bv) return collator.compare(a.title ?? '', b.title ?? '')
        if (!av) return 1
        if (!bv) return -1
        return collator.compare(av, bv)
      })
    case 'createdAtDesc':
    default:
      return list.sort((a, b) => b.createdAt - a.createdAt)
  }
}

/** 抽取某字段的全部去重值（用于筛选下拉选项） */
export function extractOptions(books: Book[], field: 'category' | 'location'): string[] {
  const set = new Set<string>()
  for (const book of books) {
    const value = (book[field] ?? '').trim()
    if (value) set.add(value)
  }
  return Array.from(set).sort((a, b) => new Intl.Collator('zh-Hans-CN').compare(a, b))
}
