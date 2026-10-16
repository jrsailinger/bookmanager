import Dexie, { type Table } from 'dexie'
import type { Book } from '../types/book'

/**
 * IndexedDB 数据库定义（通过 Dexie 封装）
 * ------------------------------------------------------------------
 * 业务数据一律存放于此，禁止写入 localStorage。
 * localStorage 仅用于「主题偏好」「提示条是否已关闭」这类非业务偏好。
 *
 * 注意：用户清除浏览器缓存/站点数据会连 IndexedDB 一并清空，
 * 因此设置页提供醒目的数据风险提示与导出备份引导。
 */
export class BookDatabase extends Dexie {
  books!: Table<Book, number>

  constructor() {
    super('PaperBookManagerDB')

    // 索引字段：仅对需要检索/排序的列建立索引，其余列作为普通字段存整条对象
    this.version(1).stores({
      books: '++id, title, author, isbn, category, location, publishYear, createdAt, updatedAt',
    })
  }
}

export const db = new BookDatabase()

/** 探测 IndexedDB 是否可用（隐私模式 / 禁用存储时给出友好提示） */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await db.open()
    return true
  } catch {
    return false
  }
}
