import { useEffect, useRef } from 'react'
import { useThemeStore } from '../store/useThemeStore'
import { useBookStore } from '../store/useBookStore'
import { isDatabaseAvailable } from '../services/db'
import { toastError } from '../store/useToastStore'

/**
 * 应用启动初始化
 * 1. 恢复主题偏好并同步到 <html>
 * 2. 检测 IndexedDB 可用性（隐私模式/禁用存储时给出明确错误）
 * 3. 加载全量藏书
 */
export function useAppInit() {
  const initTheme = useThemeStore((s) => s.init)
  const loadBooks = useBookStore((s) => s.loadBooks)
  const started = useRef(false)

  useEffect(() => {
    // React StrictMode 下 effect 会执行两次，这里加锁保证只初始化一次
    if (started.current) return
    started.current = true

    initTheme()

    void (async () => {
      const available = await isDatabaseAvailable()
      if (!available) {
        toastError('浏览器本地数据库不可用，请关闭无痕/隐私模式后重试')
        return
      }
      await loadBooks()
    })()
  }, [initTheme, loadBooks])
}
