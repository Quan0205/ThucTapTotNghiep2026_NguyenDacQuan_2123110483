import type { PropsWithChildren } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

type Props = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
}>

export function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-[2px]">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-white/50">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <Button variant="ghost" type="button" onClick={onClose} className="px-3">
            <X size={18} />
          </Button>
        </div>
        <div className="max-h-[80vh] overflow-auto p-6 scrollbar-thin">{children}</div>
      </div>
    </div>
  )
}
