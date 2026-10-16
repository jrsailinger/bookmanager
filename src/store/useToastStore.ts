import { create } from 'zustand'

/**
 * 全局 Toast 提示 store
 * 统一处理「加载中 / 成功 / 失败 / 信息」四类交互反馈。
 */
export type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  /** 自动关闭延时（ms），loading 类型不自动关闭 */
  duration?: number
}

interface ToastState {
  toasts: ToastItem[]
  /** 推入一条提示，返回 id 便于后续 update */
  push: (toast: Omit<ToastItem, 'id'>) => string
  /** 更新已有提示（典型用法：loading -> success） */
  update: (id: string, patch: Partial<Omit<ToastItem, 'id'>>) => void
  dismiss: (id: string) => void
}

let seq = 0
const nextId = () => `t_${Date.now()}_${(seq += 1)}`

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (toast) => {
    const id = nextId()
    set((state) => ({
      // 最多同时保留 4 条，避免遮挡界面
      toasts: [...state.toasts.slice(-3), { ...toast, id }],
    }))
    return id
  },

  update: (id, patch) =>
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

/** 语法糖：成功提示 */
export const toastSuccess = (message: string) =>
  useToastStore.getState().push({ type: 'success', message, duration: 2600 })

/** 语法糖：错误提示 */
export const toastError = (message: string) =>
  useToastStore.getState().push({ type: 'error', message, duration: 4200 })

/** 语法糖：普通信息 */
export const toastInfo = (message: string) =>
  useToastStore.getState().push({ type: 'info', message, duration: 3000 })

/** 语法糖：加载中（不自动关闭） */
export const toastLoading = (message: string) =>
  useToastStore.getState().push({ type: 'loading', message })
