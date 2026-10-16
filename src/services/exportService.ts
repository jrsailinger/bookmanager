import { getAllBooks } from './bookService'
import { blobToDataURL } from '../utils/cover'
import { buildBackupFileName, downloadBlob } from '../utils/format'

/**
 * 数据导出服务
 * ------------------------------------------------------------------
 * 导出全部藏书为 JSON（含封面 base64、录入时间），文件名 藏书备份_YYYYMMDD.json。
 * 全程在浏览器完成，不经过任何服务器。
 */

/** 备份文件中的单条记录结构（与 Book 一致，但封面为 base64 字符串） */
export interface BackupRecord {
  title: string
  author: string
  isbn: string
  publisher: string
  publishYear: string
  category: string
  location: string
  purchaseDate: string
  notes: string
  cover: string | null
  coverMime: string | null
  createdAt: number
  createdAtText: string
  updatedAt: number
}

export interface BackupFile {
  app: string
  appVersion: string
  type: 'paper-book-backup'
  exportedAt: string
  total: number
  books: BackupRecord[]
}

/** 生成备份对象（不写文件，便于单测/复用） */
export async function buildBackup(): Promise<BackupFile> {
  const books = await getAllBooks()

  const records: BackupRecord[] = []
  for (const book of books) {
    let cover: string | null = null
    if (book.cover instanceof Blob) {
      try {
        cover = await blobToDataURL(book.cover)
      } catch {
        cover = null
      }
    }

    records.push({
      title: book.title ?? '',
      author: book.author ?? '',
      isbn: book.isbn ?? '',
      publisher: book.publisher ?? '',
      publishYear: book.publishYear ?? '',
      category: book.category ?? '',
      location: book.location ?? '',
      purchaseDate: book.purchaseDate ?? '',
      notes: book.notes ?? '',
      cover,
      coverMime: cover ? (book.coverMime ?? null) : null,
      createdAt: book.createdAt,
      createdAtText: new Date(book.createdAt).toLocaleString('zh-CN'),
      updatedAt: book.updatedAt,
    })
  }

  return {
    app: 'PaperBookManager',
    appVersion: '1.0.0',
    type: 'paper-book-backup',
    exportedAt: new Date().toISOString(),
    total: records.length,
    books: records,
  }
}

/**
 * 导出全部藏书为 JSON 文件并触发下载
 * @returns 导出的条目数
 */
export async function exportAllBooks(): Promise<number> {
  const backup = await buildBackup()
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  downloadBlob(blob, buildBackupFileName())
  return backup.total
}
