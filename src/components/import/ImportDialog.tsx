import { useState, type ChangeEvent } from 'react'
import { AlertCircle, CheckCircle2, Download, FileJson, FileSpreadsheet, Upload, X } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useBookStore } from '../../store/useBookStore'
import { toastError, toastSuccess, toastLoading, useToastStore } from '../../store/useToastStore'
import type { ImportResult } from '../../types/book'
import { toCSV } from '../../utils/csv'
import { downloadBlob } from '../../utils/format'

/**
 * 数据导入弹窗（CSV / JSON，增量导入）
 * ------------------------------------------------------------------
 * 去重规则（由 importService 实现）：
 * 1. ISBN 非空且完全一致 → 重复，跳过；
 * 2. ISBN 为空时，书名 + 作者完全一致 → 重复，跳过；
 * 3. 同一书名不同 ISBN（不同版本）→ 视为两本独立图书，正常新增。
 * 绝不覆盖或清空既有数据。
 */
interface ImportDialogProps {
  open: boolean
  onClose: () => void
}

/** 模板列顺序 */
const TEMPLATE_HEADERS = [
  '书名',
  '作者',
  'ISBN',
  '出版社',
  '出版年份',
  '分类',
  '存放位置',
  '购入日期',
  '备注',
]

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const importFromFile = useBookStore((s) => s.importFromFile)

  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  /** 关闭时重置状态，避免下次打开残留上次结果 */
  const handleClose = () => {
    setFile(null)
    setResult(null)
    onClose()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0]
    event.target.value = ''
    if (!picked) return
    const lower = picked.name.toLowerCase()
    if (!lower.endsWith('.csv') && !lower.endsWith('.json') && !lower.endsWith('.txt')) {
      toastError('仅支持 .csv 或 .json 文件')
      return
    }
    setResult(null)
    setFile(picked)
  }

  /** 执行导入 */
  const handleImport = async () => {
    if (!file) {
      toastError('请先选择要导入的文件')
      return
    }
    const toastId = toastLoading('正在解析并导入，请稍候…')
    setImporting(true)
    try {
      const res = await importFromFile(file)
      useToastStore.getState().dismiss(toastId)
      setResult(res)
      if (res.added > 0) {
        toastSuccess(`导入完成：新增 ${res.added} 本，跳过重复 ${res.skipped} 本`)
      } else {
        toastError('未新增任何藏书，请检查文件内容或去重规则')
      }
    } catch (err) {
      useToastStore.getState().dismiss(toastId)
      toastError(`导入失败：${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setImporting(false)
    }
  }

  /** 下载 CSV 模板（纯本地生成，不请求网络） */
  const handleDownloadTemplate = () => {
    const rows = [
      TEMPLATE_HEADERS,
      [
        '百年孤独',
        '加西亚·马尔克斯',
        '978-7-5442-5399-4',
        '南海出版公司',
        '2011',
        '文学',
        '书房 A 架 2 层',
        '2024-03-15',
        '精装版，品相良好',
      ],
    ]
    // 加 BOM 让 Excel 正确识别 UTF-8 中文
    const csv = `\uFEFF${toCSV(rows)}`
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), '藏书导入模板.csv')
    toastSuccess('模板已下载')
  }

  return (
    <Modal
      open={open}
      size="md"
      dismissible={!importing}
      onClose={handleClose}
      title="导入藏书数据"
      description="支持 CSV / JSON，仅做增量新增，不会覆盖或清空已有藏书。"
      footer={
        <>
          <Button variant="ghost" onClick={handleDownloadTemplate} icon={<Download className="h-3.5 w-3.5" />}>
            下载 CSV 模板
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={importing}>
              {result ? '完成' : '取消'}
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              loading={importing}
              disabled={!file}
              icon={<Upload className="h-3.5 w-3.5" />}
            >
              开始导入
            </Button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {/* 文件选择区 */}
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-brand-600 dark:hover:bg-brand-950/20">
          <div className="flex gap-2 text-zinc-400">
            <FileSpreadsheet className="h-5 w-5" />
            <FileJson className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {file ? file.name : '点击选择 CSV 或 JSON 文件'}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB · 点击可重新选择`
              : '缺字段没关系，缺失项会留空；不会覆盖已有数据'}
          </p>
          <input type="file" accept=".csv,.json,.txt" className="hidden" onChange={handleFileChange} />
        </label>

        {file ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 text-xs dark:border-zinc-800">
            <span className="truncate text-zinc-600 dark:text-zinc-300">{file.name}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setResult(null)
              }}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-3 w-3" />
              移除
            </button>
          </div>
        ) : null}

        {/* 导入结果 */}
        {result ? (
          <div className="rounded-lg border border-zinc-200 p-3.5 dark:border-zinc-800">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              导入完成 · {result.fileName}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <ResultStat label="解析记录" value={result.parsed} />
              <ResultStat label="成功新增" value={result.added} tone="ok" />
              <ResultStat label="跳过重复" value={result.skipped} tone="warn" />
              <ResultStat label="无效记录" value={result.invalid} tone={result.invalid > 0 ? 'warn' : undefined} />
            </div>

            {result.errors.length > 0 ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-amber-600 dark:text-amber-400">
                  查看明细（{result.errors.length} 条）
                </summary>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
                  {result.errors.map((err, index) => (
                    <li key={index} className="flex gap-1.5 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                      {err}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}

        {/* 规则说明 */}
        <div className="rounded-lg bg-zinc-50 p-3.5 text-[11px] leading-5 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
          <p className="mb-1 font-semibold text-zinc-600 dark:text-zinc-300">去重判定规则</p>
          <ul className="list-inside list-disc space-y-0.5">
            <li>
              <b>有 ISBN</b>：ISBN 非空且一致 → 判定重复，跳过不新增
            </li>
            <li>
              <b>无 ISBN</b>：书名 + 作者完全一致 → 判定重复，跳过不新增
            </li>
            <li>
              <b>同一书名不同 ISBN</b>（不同版本）→ 视为两本独立图书，正常新增
            </li>
          </ul>
          <p className="mt-1.5">
            表头支持中英文（书名/title、作者/author、ISBN、分类/category 等），顺序不限；JSON 支持数组、
            {' {books:[]} '} 或导出备份文件原样导入（含封面 base64）。
          </p>
        </div>
      </div>
    </Modal>
  )
}

/** 结果数字块 */
function ResultStat({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'warn' }) {
  const color =
    tone === 'ok'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'warn'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-zinc-800 dark:text-zinc-100'
  return (
    <div className="rounded-md border border-zinc-200 px-2.5 py-2 dark:border-zinc-800">
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}
