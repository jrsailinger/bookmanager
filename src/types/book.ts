/**
 * 全局业务类型定义
 * ------------------------------------------------------------------
 * 本应用只管理「实体纸质藏书」，不含借阅、不含扫码 ISBN、不调用外部图API。
 */

/** 图书实体（IndexedDB 表 books 的行结构） */
export interface Book {
  /** 主键，自增，新增时无需传入 */
  id?: number
  /** 书名 —— 唯一必填字段 */
  title: string
  /** 作者 */
  author?: string
  /** ISBN（允许带连字符，去重时会被规范化） */
  isbn?: string
  /** 出版社 */
  publisher?: string
  /** 出版年份（用字符串存，允许 "2021" / "2021年" 等自由写法） */
  publishYear?: string
  /** 分类 / 标签 */
  category?: string
  /** 存放位置，例如「书房 A 架 2 层」 */
  location?: string
  /** 购入日期，格式 YYYY-MM-DD */
  purchaseDate?: string
  /** 备注 */
  notes?: string
  /** 封面图片，以 Blob 形式存入 IndexedDB（不是 localStorage） */
  cover?: Blob | null
  /** 封面 MIME 类型，导出 base64 时用于拼 data URL */
  coverMime?: string
  /** 录入时间（系统自动记录，用户不可编辑） */
  createdAt: number
  /** 最近修改时间 */
  updatedAt: number
}

/** 表单可编辑字段集合（不含 id / 时间戳） */
export type BookFormValues = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>

/** 列表排序方式 */
export type SortKey = 'createdAtDesc' | 'createdAtAsc' | 'titleAsc' | 'authorAsc'

/** 列表筛选条件 */
export interface BookFilters {
  /** 关键词：书名 / 作者 / ISBN / 备注 全文检索 */
  keyword: string
  /** 分类筛选，空字符串表示全部 */
  category: string
  /** 存放位置筛选，空字符串表示全部 */
  location: string
  /** 排序方式 */
  sortBy: SortKey
}

/** 导入结果统计 */
export interface ImportResult {
  /** 文件中解析出的有效记录条数 */
  parsed: number
  /** 成功新增数量 */
  added: number
  /** 因重复而被跳过的数量 */
  skipped: number
  /** 因缺少书名等被判定无效的数量 */
  invalid: number
  /** 错误明细（最多展示若干条） */
  errors: string[]
  /** 来源文件名 */
  fileName: string
  /** 来源格式 */
  format: 'csv' | 'json'
}

/** 导入过程中用于去重的轻量键 */
export interface DedupeKey {
  /** 规范化后的 ISBN */
  isbn: string
  /** 规范化后的「书名+作者」 */
  titleAuthor: string
}

/** 统计面板数据 */
export interface BookStats {
  total: number
  categoryCount: number
  locationCount: number
  withCoverCount: number
  /** 各分类占比，按数量倒序 */
  byCategory: Bucket[]
  /** 各存放位置分布，按数量倒序 */
  byLocation: Bucket[]
}

export interface Bucket {
  name: string
  count: number
  /** 百分比，保留一位小数 */
  percent: number
}
