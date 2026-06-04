import { AlertCircle, Loader2, SearchX } from 'lucide-react'

export function LoadingView({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80">
      <div className="flex items-center gap-3 text-slate-700">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  )
}

export function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/80 px-6">
      <div className="flex max-w-xl items-start gap-3 text-rose-700">
        <AlertCircle className="mt-0.5 shrink-0" size={20} />
        <p className="text-sm leading-6">{message}</p>
      </div>
    </div>
  )
}

export function EmptyView({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 px-6">
      <div className="flex items-center gap-3 text-slate-500">
        <SearchX size={20} />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )
}
