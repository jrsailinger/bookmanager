/** 通用格式化工具 */

/** 时间戳 -> YYYY-MM-DD */
export function formatDate(ts: number): string {
  const d = new Date(ts)
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** 时间戳 -> YYYY-MM-DD HH:mm */
export function formatDateTime(ts: number): string {
  const d = new Date(ts)
  const hh = `${d.getHours()}`.padStart(2, '0')
  const mm = `${d.getMinutes()}`.padStart(2, '0')
  return `${formatDate(ts)} ${hh}:${mm}`
}

/** 生成导出文件名：藏书备份_YYYYMMDD.json */
export function buildBackupFileName(prefix = '藏书备份'): string {
  const d = new Date()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${prefix}_${d.getFullYear()}${m}${day}.json`
}

/** 触发浏览器下载（纯前端，不经过任何服务端） */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 释放对象 URL，避免内存泄漏
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
