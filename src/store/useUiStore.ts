import { create } from 'zustand'
import type { Book } from '../types/book'

/**
 * 界面交互状态 store
 * 收纳路由式视图、侧边栏、各类弹层，避免层层传 props。
 */
export type ViewKey = 'library' | 'stats' | 'settings'

interface UiState {
  view: ViewKey
  /** 移动/窄屏下的侧边栏开关 */
  sidebarOpen: boolean
  /** 新增/编辑弹窗：null 表示关闭；'new' 表示新增；数字表示编辑指定 id */
  editing: 'new' | number | null
  /** 详情弹窗 */
  detailBook: Book | null
  /** 导入弹窗 */
  importOpen: boolean
  /** 数据风险提示条是否被手动关闭（仅本次会话） */
  riskBannerDismissed: boolean

  setView: (view: ViewKey) => void
  toggleSidebar: (open?: boolean) => void
  openEditor: (target: 'new' | number) => void
  closeEditor: () => void
  openDetail: (book: Book) => void
  closeDetail: () => void
  setImportOpen: (open: boolean) => void
  dismissRiskBanner: () => void
}

export const useUiStore = create<UiState>((set) => ({
  view: 'library',
  sidebarOpen: false,
  editing: null,
  detailBook: null,
  importOpen: false,
  riskBannerDismissed: false,

  setView: (view) => set({ view, sidebarOpen: false }),

  toggleSidebar: (open) => set((state) => ({ sidebarOpen: open ?? !state.sidebarOpen })),

  openEditor: (target) => set({ editing: target, detailBook: null }),

  closeEditor: () => set({ editing: null }),

  openDetail: (book) => set({ detailBook: book }),

  closeDetail: () => set({ detailBook: null }),

  setImportOpen: (open) => set({ importOpen: open }),

  dismissRiskBanner: () => set({ riskBannerDismissed: true }),
}))
