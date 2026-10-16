import { create } from 'zustand'
import type { Book, BookFilters, BookFormValues, ImportResult } from '../types/book'
import {
  addBook as dbAddBook,
  deleteBook as dbDeleteBook,
  getAllBooks,
  updateBook as dbUpdateBook,
  applyFilters,
} from '../services/bookService'
import { importBooksFromFile } from '../services/importService'
import { useToastStore } from './useToastStore'

/**
 * 藏书主 store
 * ------------------------------------------------------------------
 * 只保留「原始数据 + 筛选条件 + 加载状态」，派生结果由 selector 实时计算，
 * 避免把过滤后的列表再存一份导致状态不同步。
 */
interface BookState {
  /** 全量藏书（原始数据，始终与 IndexedDB 保持一致） */
  books: Book[]
  /** 是否正在读取数据库 */
  loading: boolean
  /** 数据库是否可用（隐私模式等场景会失败） */
  dbError: string | null
  filters: BookFilters

  loadBooks: () => Promise<void>
  createBook: (values: BookFormValues) => Promise<void>
  editBook: (id: number, values: BookFormValues) => Promise<void>
  removeBook: (id: number) => Promise<void>
  importFromFile: (file: File) => Promise<ImportResult>
  setFilter: <K extends keyof BookFilters>(key: K, value: BookFilters[K]) => void
  resetFilters: () => void
  /** 根据当前筛选条件返回可见列表 */
  getVisibleBooks: () => Book[]
}

/** 默认筛选条件：按录入时间倒序（最新录入在前） */
export const DEFAULT_FILTERS: BookFilters = {
  keyword: '',
  category: '',
  location: '',
  sortBy: 'createdAtDesc',
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  loading: true,
  dbError: null,
  filters: { ...DEFAULT_FILTERS },

  loadBooks: async () => {
    set({ loading: true })
    try {
      const books = await getAllBooks()
      set({ books, dbError: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ dbError: message })
      useToastStore.getState().push({
        type: 'error',
        message: `读取本地数据库失败：${message}`,
        duration: 5000,
      })
    } finally {
      set({ loading: false })
    }
  },

  createBook: async (values) => {
    await dbAddBook(values)
    await get().loadBooks()
  },

  editBook: async (id, values) => {
    await dbUpdateBook(id, values)
    await get().loadBooks()
  },

  removeBook: async (id) => {
    await dbDeleteBook(id)
    await get().loadBooks()
  },

  importFromFile: async (file) => {
    const result = await importBooksFromFile(file)
    // 导入是增量操作，完成后重新拉取全量数据
    await get().loadBooks()
    return result
  },

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  getVisibleBooks: () => {
    const { books, filters } = get()
    return applyFilters(books, filters)
  },
}))
