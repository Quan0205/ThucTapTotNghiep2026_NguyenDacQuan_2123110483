import type { ReactNode } from 'react'
import { Card } from './Card'

type Props = {
  title: string
  value: string
  hint?: string
  icon: ReactNode
}

export function StatCard({ title, value, hint, icon }: Props) {
  return (
    <Card className="!p-5 hover:-translate-y-1.5 transition-transform duration-300 relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] lg:text-[12px] font-bold tracking-wide text-slate-500 uppercase break-words leading-tight">{title}</p>
          <div className="mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 truncate" title={value}>{value}</div>
          {hint ? <p className="mt-1.5 text-xs font-semibold text-slate-400 truncate" title={hint}>{hint}</p> : null}
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br from-coffee-400 to-coffee-600 text-white shadow-lg shadow-coffee-900/15 ring-1 ring-inset ring-white/20">
          {icon}
        </div>
      </div>
    </Card>
  )
}
