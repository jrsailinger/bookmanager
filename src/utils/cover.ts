/**
 * 图书封面相关工具
 * - 无封面时用「书名首字 + 稳定色块」生成占位图
 * - Blob <-> base64 互转（导出/导入备份用）
 */

/** 从书名提取用于占位图的首字：优先中文/字母，取第一个非空白可见字符 */
export function getTitleInitial(title: string): string {
  const clean = (title || '').trim()
  if (!clean) return '书'
  const ch = Array.from(clean)[0]
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch
}

/**
 * 依据字符串稳定生成一个色相，使同一本书每次渲染颜色一致。
 * 用简单散列代替随机，避免刷新后颜色跳变。
 */
export function colorFromString(input: string): { bg: string; fg: string } {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 100000
  }
  const hue = hash % 360
  return {
    bg: `hsl(${hue} 52% 88%)`,
    fg: `hsl(${hue} 45% 32%)`,
  }
}

/** Blob -> dataURL（base64），用于导出 JSON */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('封面图片读取失败'))
    reader.readAsDataURL(blob)
  })
}

/** dataURL -> Blob，用于从备份文件恢复封面 */
export function dataURLToBlob(dataURL: string): Blob | null {
  try {
    const [meta, base64] = dataURL.split(',')
    if (!base64) return null
    const mimeMatch = /data:([^;]+);base64/.exec(meta)
    const mime = mimeMatch ? mimeMatch[1] : 'image/png'
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new Blob([bytes], { type: mime })
  } catch {
    return null
  }
}

/** dataURL -> MIME 类型 */
export function mimeFromDataURL(dataURL: string): string {
  const match = /data:([^;]+);base64/.exec(dataURL)
  return match ? match[1] : 'image/png'
}
