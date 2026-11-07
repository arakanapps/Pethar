import React from 'react'
import { cn } from '../../lib/utils'

export type AdminTone = 'amber' | 'emerald' | 'rose' | 'blue' | 'indigo' | 'slate'

const toneStyles: Record<
  AdminTone,
  {
    text: string
    softText: string
    bg: string
    border: string
    dot: string
    bar: string
    ring: string
  }
> = {
  amber: {
    text: 'text-sky-600 dark:text-sky-400',
    softText: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-500/10 dark:bg-sky-400/10',
    border: 'border-sky-500/25 dark:border-sky-400/20',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
    ring: 'ring-sky-500/20',
  },
  emerald: {
    text: 'text-emerald-600 dark:text-emerald-400',
    softText: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    border: 'border-emerald-500/25 dark:border-emerald-400/20',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-400',
    softText: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-500/10 dark:bg-rose-400/10',
    border: 'border-rose-500/25 dark:border-rose-400/20',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    ring: 'ring-rose-500/20',
  },
  blue: {
    text: 'text-sky-600 dark:text-sky-400',
    softText: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-500/10 dark:bg-sky-400/10',
    border: 'border-sky-500/25 dark:border-sky-400/20',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
    ring: 'ring-sky-500/20',
  },
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    softText: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-500/10 dark:bg-indigo-400/10',
    border: 'border-indigo-500/25 dark:border-indigo-400/20',
    dot: 'bg-indigo-500',
    bar: 'bg-indigo-500',
    ring: 'ring-indigo-500/20',
  },
  slate: {
    text: 'text-slate-600 dark:text-slate-300',
    softText: 'text-slate-700 dark:text-slate-200',
    bg: 'bg-slate-500/10 dark:bg-white/5',
    border: 'border-slate-300/70 dark:border-white/10',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
    ring: 'ring-slate-500/10',
  },
}

export const adminPanel = (_isDarkMode: boolean) =>
  'border-white/[0.07] bg-white/[0.035] shadow-[0_18px_60px_-34px_rgba(0,0,0,0.95)] backdrop-blur-2xl'

export const adminInset = (_isDarkMode: boolean) =>
  'border-white/[0.06] bg-white/[0.025]'

export const adminText = (_isDarkMode: boolean) => 'text-slate-100'

export const adminMuted = (_isDarkMode: boolean) => 'text-slate-400'

export const adminInput = (_isDarkMode: boolean) =>
  'border-white/[0.08] bg-white/[0.03] text-slate-100 placeholder-slate-600 focus:border-indigo-400/50'

export function DeskHeader({
  eyebrow,
  title,
  description,
  actions,
  isDarkMode,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: React.ReactNode
  isDarkMode: boolean
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-indigo-500" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-500">
            {eyebrow}
          </span>
        </div>
        <h1
          className={cn(
            'mt-2 text-xl font-black tracking-tight sm:text-2xl',
            adminText(isDarkMode),
          )}
        >
          {title}
        </h1>
        {description && (
          <p className={cn('mt-1 max-w-2xl text-xs leading-relaxed', adminMuted(isDarkMode))}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  isDarkMode,
}: {
  title?: React.ReactNode
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  isDarkMode: boolean
}) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border', adminPanel(isDarkMode), className)}>
      {(title || actions) && (
        <div
          className={cn(
            'flex flex-col gap-3 border-b px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5',
            isDarkMode ? 'border-white/[0.06]' : 'border-slate-100',
          )}
        >
          <div className="min-w-0">
            {title && (
              <h2 className={cn('text-sm font-bold tracking-tight', adminText(isDarkMode))}>
                {title}
              </h2>
            )}
            {description && (
              <p className={cn('mt-0.5 text-[11px]', adminMuted(isDarkMode))}>{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'slate',
  isDarkMode,
  onClick,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: React.ReactNode
  tone?: AdminTone
  isDarkMode: boolean
  onClick?: () => void
}) {
  const t = toneStyles[tone]
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 transition-all',
        adminPanel(isDarkMode),
        onClick && 'cursor-pointer hover:-translate-y-0.5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'font-mono text-[10px] font-bold uppercase tracking-[0.14em]',
            adminMuted(isDarkMode),
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border',
            t.bg,
            t.border,
            t.text,
          )}
        >
          {icon}
        </span>
      </div>
      <div className={cn('mt-3 font-mono text-2xl font-black tracking-tight', adminText(isDarkMode))}>
        {value}
      </div>
      {hint && <div className={cn('mt-1 text-[10px] font-medium', adminMuted(isDarkMode))}>{hint}</div>}
      <span
        className={cn(
          'absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100',
          t.bar,
        )}
      />
    </div>
  )
}

export function StatusPill({
  children,
  tone = 'slate',
  dot = false,
}: {
  children: React.ReactNode
  tone?: AdminTone
  dot?: boolean
}) {
  const t = toneStyles[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider',
        t.bg,
        t.border,
        t.text,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  isDarkMode,
  tone = 'amber',
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  isDarkMode: boolean
  tone?: AdminTone
}) {
  const t = toneStyles[tone]
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-xl border p-1',
        isDarkMode ? 'border-white/[0.07] bg-white/[0.03]' : 'border-slate-200 bg-slate-100/70',
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition',
              active
                ? cn(t.bg, t.text, 'shadow-sm')
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon,
  isDarkMode,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  isDarkMode: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-2xl border',
          isDarkMode ? 'border-white/10 bg-white/[0.03] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-400',
        )}
      >
        {icon}
      </div>
      <div className={cn('mt-3 text-sm font-bold', adminText(isDarkMode))}>{title}</div>
      {description && (
        <div className={cn('mt-1 max-w-sm text-[11px]', adminMuted(isDarkMode))}>{description}</div>
      )}
    </div>
  )
}

export function Avatar({
  label,
  tone = 'amber',
  size = 'md',
}: {
  label: string
  tone?: AdminTone
  size?: 'sm' | 'md' | 'lg'
}) {
  const t = toneStyles[tone]
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl border font-bold',
        t.bg,
        t.border,
        t.text,
        size === 'sm' && 'h-8 w-8 text-[11px]',
        size === 'md' && 'h-10 w-10 text-xs',
        size === 'lg' && 'h-12 w-12 text-sm',
      )}
    >
      {label}
    </div>
  )
}

export function KeyValue({
  label,
  value,
  isDarkMode,
  mono = true,
}: {
  label: string
  value: React.ReactNode
  isDarkMode: boolean
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className={cn('text-[11px]', adminMuted(isDarkMode))}>{label}</span>
      <span className={cn('text-right text-[11px] font-semibold', adminText(isDarkMode), mono && 'font-mono')}>
        {value}
      </span>
    </div>
  )
}
