import { create } from 'zustand'

/**
 * 主题 store
 * ------------------------------------------------------------------
 * 主题偏好属于「非业务数据」，允许写入 localStorage（业务数据一律在 IndexedDB）。
 * 默认跟随系统，一旦用户手动切换则记住其选择。
 */
export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'pbm:theme'

interface ThemeState {
  mode: ThemeMode
  /** 是否已初始化，避免重复初始化导致闪烁 */
  ready: boolean
  init: () => void
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

/** 读取用户偏好；无偏好时跟随系统 */
function resolveInitialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* localStorage 不可用时忽略 */
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

/** 把主题写到 <html> 的 class 上，供 Tailwind dark: 变体使用 */
function applyMode(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  ready: false,

  init: () => {
    const mode = resolveInitialMode()
    applyMode(mode)
    set({ mode, ready: true })
  },

  setMode: (mode) => {
    applyMode(mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* 忽略写入失败 */
    }
    set({ mode })
  },

  toggle: () => get().setMode(get().mode === 'dark' ? 'light' : 'dark'),
}))
