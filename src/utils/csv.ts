/**
 * 极简 CSV 解析 / 序列化工具
 * 支持 RFC4180 风格的引号转义、字段内换行、逗号与制表符分隔。
 * 不依赖任何第三方库。
 */

/** 自动探测分隔符：比较首行中逗号 / 分号 / 制表符出现次数，取最多者 */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] ?? ''
  const candidates = [',', ';', '\t']
  let best = ','
  let bestCount = -1
  for (const c of candidates) {
    const count = firstLine.split(c).length - 1
    if (count > bestCount) {
      bestCount = count
      best = c
    }
  }
  return best
}

/** 将 CSV 文本解析为二维数组 */
export function parseCSV(input: string, delimiter?: string): string[][] {
  // 去掉 BOM，否则第一个表头会带上不可见字符
  const text = input.replace(/^\uFEFF/, '')
  const sep = delimiter ?? detectDelimiter(text)

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          // 转义的引号
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === sep) {
      row.push(field)
      field = ''
    } else if (char === '\r') {
      // 忽略 CR，交给 LF 处理换行
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  // 收尾：最后一行可能没有换行符
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // 过滤掉完全空白的行
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

/** 单个字段转 CSV 单元格：含分隔符/引号/换行时加引号并转义 */
function escapeCell(value: string, sep: string): string {
  const needQuote =
    value.includes(sep) || value.includes('"') || value.includes('\n') || value.includes('\r')
  const escaped = value.replace(/"/g, '""')
  return needQuote ? `"${escaped}"` : escaped
}

/** 二维数组 -> CSV 文本 */
export function toCSV(rows: string[][], delimiter = ','): string {
  return rows.map((r) => r.map((c) => escapeCell(c ?? '', delimiter)).join(delimiter)).join('\r\n')
}
