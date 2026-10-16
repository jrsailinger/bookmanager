import { useEffect, useState } from 'react'

/**
 * 把 Blob 封面转成可渲染的 object URL，并在组件卸载或封面变化时自动回收，
 * 避免频繁编辑封面造成内存泄漏。
 */
export function useCoverUrl(cover?: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!(cover instanceof Blob)) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(cover)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [cover])

  return url
}
