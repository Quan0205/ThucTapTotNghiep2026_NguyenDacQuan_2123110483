import type { PropsWithChildren } from 'react'

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <div className={`glass-panel rounded-[2rem] p-6 lg:p-8 ${className}`}>{children}</div>
}
