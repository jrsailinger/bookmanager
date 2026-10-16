import { bulkAddBooks, buildDedupeKey, getExistingDedupeKeys } from './bookService'
import { parseCSV } from '../utils/csv'
import { dataURLToBlob, mimeFromDataURL } from '../utils/cover'
import type { BookFormValues, ImportResult } from '../types/book'

/**
 * 数据导入服务（CSV / JSON）
 * ------------------------------------------------------------------
 * 核心规则：
 * 1. 增量导入，绝不覆盖或清空已有数据；
 * 2. 去重判定：
 *    - ISBN 非空 → 仅比对规范化后的 ISBN，完全一致视为重复；
 *    - ISBN 为空 → 比对「书名 + 作者」，完全一致视为重复；
 *    - 同一书名不同 ISBN（不同版本）→ 视为两本独立图书，正常新增。
 * 3. 文件字段允许缺失，缺失即留空。
 */

/** 表头别名映射：兼容中英文、大小写、空格差异（coverMime 为派生字段，不参与导入） */
type ImportableField = Exclude<keyof BookFormValues, 'coverMime'>

const HEADER_ALIASES: Record<ImportableField, string[]> = {
  title: ['title', '书名', '名称', '图书名称'],
  author: ['author', '作者', '著者'],
  isbn: ['isbn', 'isbn号', '国际标准书号', '书号'],
  publisher: ['publisher', '出版社', '出版', '出版商'],
  publishYear: ['publishyear', 'year', '出版年份', '出版年', '年份'],
  category: ['category', 'tag', 'tags', '分类', '标签', '类别'],
  location: ['location', 'shelf', 'place', '存放位置', '位置', '存放地点'],
  purchaseDate: ['purchasedate', 'buydate', '购入日期', '购买日期', '入手日期'],
  notes: ['notes', 'note', 'remark', 'remarks', '备注', '说明'],
  cover: ['cover', 'coverbase64', 'image', '图片', '封面', '封面base64'],
}

/** 规范化表头文本，便于匹配别名 */
function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '')
}

/** 根据表头行构建「列索引 -> 字段名」映射 */
function buildHeaderMap(headerRow: string[]): Record<number, string> {
  const map: Record<number, string> = {}
  headerRow.forEach((raw, index) => {
    const normalized = normalizeHeader(raw)
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.some((alias) => normalizeHeader(alias) === normalized)) {
        map[index] = field
        return
      }
    }
  })
  return map
}

/** 把任意原始值安全转成字符串 */
function toStr(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

/** 从原始对象（CSV 行对象 / JSON 对象）构造一条待入库记录 */
function toBookValues(raw: Record<string, unknown>): { values: BookFormValues; coverError?: string } {
  const values: BookFormValues = {
    title: toStr(raw.title),
    author: toStr(raw.author),
    isbn: toStr(raw.isbn),
    publisher: toStr(raw.publisher),
    publishYear: toStr(raw.publishYear),
    category: toStr(raw.category),
    location: toStr(raw.location),
    purchaseDate: normalizeDate(toStr(raw.purchaseDate)),
    notes: toStr(raw.notes),
    cover: null,
    coverMime: undefined,
  }

  // 封面：仅支持备份文件里的 base64 dataURL；外部图片链接一律忽略（不请求网络）
  const coverRaw = toStr(raw.cover)
  let coverError: string | undefined
  if (coverRaw.startsWith('data:image')) {
    const blob = dataURLToBlob(coverRaw)
    if (blob) {
      values.cover = blob
      values.coverMime = mimeFromDataURL(coverRaw)
    } else {
      coverError = '封面 base64 解析失败，已忽略封面'
    }
  } else if (coverRaw) {
    coverError = '封面字段非 base64 图片，已忽略封面'
  }

  return { values, coverError }
}

/** 归一化日期：把 2021/5/3、2021.5.3 等写法统一为 YYYY-MM-DD */
function normalizeDate(input: string): string {
  if (!input) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(input)
  if (match) {
    const [, y, m, d] = match
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return input
}

/** 解析 CSV 文本为原始记录数组 */
export function parseCSVToRecords(text: string): Record<string, unknown>[] {
  const rows = parseCSV(text)
  if (rows.length === 0) return []

  const headerMap = buildHeaderMap(rows[0])
  const hasRecognizedHeader = Object.keys(headerMap).length > 0

  // 若首行没有任何可识别的表头，说明文件无表头，则按固定字段顺序解析
  const fallbackOrder: (keyof BookFormValues | 'cover')[] = [
    'title',
    'author',
    'isbn',
    'publisher',
    'publishYear',
    'category',
    'location',
    'purchaseDate',
    'notes',
    'cover',
  ]

  const dataRows = hasRecognizedHeader ? rows.slice(1) : rows

  return dataRows.map((row) => {
    const record: Record<string, unknown> = {}
    if (hasRecognizedHeader) {
      Object.entries(headerMap).forEach(([indexStr, field]) => {
        record[field] = row[Number(indexStr)] ?? ''
      })
    } else {
      fallbackOrder.forEach((field, index) => {
        record[field] = row[index] ?? ''
      })
    }
    return record
  })
}

/** 解析 JSON 文本为原始记录数组（兼容数组、{books:[]}、{data:[]} 三种结构） */
export function parseJSONToRecords(text: string): Record<string, unknown>[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('JSON 文件格式错误，无法解析')
  }

  let list: unknown[] = []
  if (Array.isArray(data)) {
    list = data
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.books)) list = obj.books
    else if (Array.isArray(obj.data)) list = obj.data
    else if (Array.isArray(obj.items)) list = obj.items
    else throw new Error('JSON 结构无法识别：应为数组或包含 books/data/items 数组字段的对象')
  } else {
    throw new Error('JSON 结构无法识别：根节点应为数组或对象')
  }

  return list.map((item) => {
    if (!item || typeof item !== 'object') return {}
    const obj = item as Record<string, unknown>
    // 兼容 book 字段嵌套写法
    const source = obj.book && typeof obj.book === 'object' ? (obj.book as Record<string, unknown>) : obj
    return {
      title: source.title ?? source['书名'],
      author: source.author ?? source['作者'],
      isbn: source.isbn ?? source.ISBN ?? source['书号'],
      publisher: source.publisher ?? source['出版社'],
      publishYear: source.publishYear ?? source.year ?? source['出版年份'],
      category: source.category ?? source.tag ?? source['分类'] ?? source['标签'],
      location: source.location ?? source['存放位置'],
      purchaseDate: source.purchaseDate ?? source['购入日期'],
      notes: source.notes ?? source.note ?? source['备注'],
      cover: source.cover ?? source.coverBase64 ?? source['封面'],
    }
  })
}

/** 从 File 对象读取文本内容 */
function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('文件读取失败，请重试'))
    reader.readAsText(file, 'utf-8')
  })
}

/** 依据文件名后缀判断导入格式 */
export function detectFormat(fileName: string): 'csv' | 'json' | null {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.csv') || lower.endsWith('.txt')) return 'csv'
  if (lower.endsWith('.json')) return 'json'
  return null
}

/**
 * 执行增量导入
 * @param file 用户选择的 CSV / JSON 文件
 */
export async function importBooksFromFile(file: File): Promise<ImportResult> {
  const format = detectFormat(file.name)
  if (!format) {
    throw new Error('仅支持 .csv 或 .json 文件')
  }

  const text = await readFileText(file)
  if (!text.trim()) {
    throw new Error('文件内容为空')
  }

  const records = format === 'csv' ? parseCSVToRecords(text) : parseJSONToRecords(text)
  if (records.length === 0) {
    throw new Error('文件中未解析到任何数据行')
  }

  // 1) 取出库内已有去重键
  const existingKeys = await getExistingDedupeKeys()
  const errors: string[] = []
  const pending: BookFormValues[] = []

  let invalid = 0
  let skipped = 0

  records.forEach((record, index) => {
    const rowNo = index + 1
    const { values, coverError } = toBookValues(record)
    if (coverError) errors.push(`第 ${rowNo} 行：${coverError}`)

    // 书名为空 → 无效记录，跳过
    if (!values.title) {
      invalid += 1
      if (errors.length < 20) errors.push(`第 ${rowNo} 行：缺少书名，已跳过`)
      return
    }

    // 2) 去重判定
    const key = buildDedupeKey(values)
    const dedupeKey = key.isbn ? `isbn:${key.isbn}` : `ta:${key.titleAuthor}`

    if (existingKeys.has(dedupeKey)) {
      skipped += 1
      if (errors.length < 20) errors.push(`第 ${rowNo} 行：「${values.title}」与已有藏书重复，已跳过`)
      return
    }

    // 3) 命中即登记，保证同一文件内部也不重复导入
    existingKeys.add(dedupeKey)
    pending.push(values)
  })

  let added = 0
  if (pending.length > 0) {
    try {
      added = await bulkAddBooks(pending)
    } catch (err) {
      throw new Error(`写入本地数据库失败：${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return {
    parsed: records.length,
    added,
    skipped,
    invalid,
    errors,
    fileName: file.name,
    format,
  }
}
