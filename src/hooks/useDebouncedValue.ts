import { useEffect, useState } from 'react'

/**
 * 防抖值 hook
 * 搜索框输入时避免每次按键都触发全量过滤（个人藏书量不大，但体验更稳）。
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
