import type { Book, BookStats, Bucket } from '../types/book'

/**
 * 统计服务
 * ------------------------------------------------------------------
 * 只做「总量 + 分类占比 + 存放位置分布」这类简易统计，
 * 用纯文字 + 条形块展示，不引入图表库。
 */

/** 未填写分类 / 位置时的统一占位名 */
export const UNCATEGORIZED = '未分类'
export const UNKNOWN_LOCATION = '未记录位置'

/** 把列表聚合成 name/count/percent 结构，按数量倒序 */
function aggregate(books: Book[], pick: (book: Book) => string, fallback: string): Bucket[] {
  const counter = new Map<string, number>()

  for (const book of books) {
    const raw = (pick(book) ?? '').trim()
    const name = raw || fallback
    counter.set(name, (counter.get(name) ?? 0) + 1)
  }

  const total = books.length
  const buckets: Bucket[] = Array.from(counter.entries()).map(([name, count]) => ({
    name,
    count,
    percent: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
  }))

  return buckets.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-Hans-CN'))
}

/** 计算统计面板所需的全部数据 */
export function computeStats(books: Book[]): BookStats {
  const categories = new Set<string>()
  const locations = new Set<string>()
  let withCoverCount = 0

  for (const book of books) {
    const category = (book.category ?? '').trim()
    const location = (book.location ?? '').trim()
    if (category) categories.add(category)
    if (location) locations.add(location)
    if (book.cover instanceof Blob) withCoverCount += 1
  }

  return {
    total: books.length,
    categoryCount: categories.size,
    locationCount: locations.size,
    withCoverCount,
    byCategory: aggregate(books, (b) => b.category ?? '', UNCATEGORIZED),
    byLocation: aggregate(books, (b) => b.location ?? '', UNKNOWN_LOCATION),
  }
}
