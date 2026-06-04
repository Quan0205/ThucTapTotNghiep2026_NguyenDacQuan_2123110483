import type { PropsWithChildren } from 'react'
import { statusToneForText } from '../../utils/format'

type Props = PropsWithChildren<{
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info'
}>

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  success: 'bg-emerald-50/80 text-emerald-700 ring-emerald-500/30 shadow-sm shadow-emerald-900/5',
  warning: 'bg-amber-50/80 text-amber-700 ring-amber-500/30 shadow-sm shadow-amber-900/5',
  danger: 'bg-rose-50/80 text-rose-700 ring-rose-500/30 shadow-sm shadow-rose-900/5',
  neutral: 'bg-slate-50/80 text-slate-700 ring-slate-400/30 shadow-sm shadow-slate-900/5',
  info: 'bg-sky-50/80 text-sky-700 ring-sky-500/30 shadow-sm shadow-sky-900/5',
}

export function Badge({ tone, children }: Props) {
  const resolvedTone = tone ?? statusToneForText(String(children))
  return (
    <span
      className={`inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
        toneClasses[resolvedTone as NonNullable<Props['tone']>] ?? toneClasses.neutral
      }`}
    >
      {children}
    </span>
  )
}
