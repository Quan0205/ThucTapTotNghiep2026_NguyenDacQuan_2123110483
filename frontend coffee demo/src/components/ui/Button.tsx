import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  }
>

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-gradient-to-b from-coffee-500 to-coffee-600 text-white shadow-md shadow-coffee-900/20 hover:from-coffee-600 hover:to-coffee-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm ring-1 ring-inset ring-white/20',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-200/80 shadow-sm hover:bg-cream-50 hover:text-coffee-900 hover:ring-coffee-300/50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
  ghost: 'bg-transparent text-slate-600 hover:bg-coffee-50/80 hover:text-coffee-800 active:scale-95',
  danger: 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-md shadow-rose-900/20 hover:from-rose-600 hover:to-rose-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm ring-1 ring-inset ring-white/20',
}

export function Button({ variant = 'primary', className = '', children, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
