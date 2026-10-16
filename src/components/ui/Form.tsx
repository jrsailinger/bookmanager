import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

/** 表单字段容器：统一 标签 + 内容 + 错误提示 的排版 */
interface FieldProps {
  label: string
  /** 是否必填（当前仅书名必填） */
  required?: boolean
  /** 校验错误文案 */
  error?: string
  /** 字段说明 */
  hint?: string
  children: ReactNode
  className?: string
}

export function Field({ label, required, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <label className="wb-label">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      ) : null}
    </div>
  )
}

/** 文本输入框 */
export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  // 由 aria-invalid 驱动错误态描边，保持样式与校验状态联动
  const invalid = rest['aria-invalid'] === true || rest['aria-invalid'] === 'true'
  return (
    <input
      className={cn(
        'wb-input',
        invalid && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
        className,
      )}
      {...rest}
    />
  )
}

/** 文本域 */
export function Textarea({ className, rows = 3, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn('wb-input resize-y', className)} {...rest} />
}

/** 下拉选择 */
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('wb-input cursor-pointer pr-8', className)} {...rest}>
      {children}
    </select>
  )
}
