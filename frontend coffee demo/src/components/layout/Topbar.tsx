import { LogOut, Menu, RefreshCw, Shield, User } from 'lucide-react'
import { Button } from '../ui/Button'

type Props = {
  title: string
  subtitle?: string
  username?: string
  roleName?: string
  onMenuClick?: () => void
  onRefresh?: () => void
  onLogout?: () => void
}

export function Topbar({ title, subtitle, username, roleName, onMenuClick, onRefresh, onLogout }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 px-4 py-4 backdrop-blur-2xl transition-all md:px-6 shadow-sm shadow-coffee-900/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" type="button" className="md:hidden" onClick={onMenuClick}>
            <Menu size={18} />
          </Button>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-coffee-600">CoffeeHRM Admin</div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">{title}</h1>
            {subtitle ? <p className="text-sm font-medium text-slate-500 mt-0.5">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden rounded-full bg-white/80 ring-1 ring-coffee-100 px-3 py-1 text-xs font-semibold text-coffee-700 md:block shadow-sm">
            API: https://localhost:7060
          </div>
          {username ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/90 px-3 py-1.5 text-sm text-slate-800 shadow-sm backdrop-blur-md">
              <User size={14} className="text-coffee-600" />
              <span className="font-bold">{username}</span>
              {roleName ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-coffee-50 px-2 py-0.5 text-xs font-bold text-coffee-700 ring-1 ring-coffee-200/50">
                  <Shield size={12} />
                  {roleName}
                </span>
              ) : null}
            </div>
          ) : null}
          {onRefresh ? (
            <Button variant="secondary" type="button" onClick={onRefresh}>
              <RefreshCw size={16} />
              Làm mới
            </Button>
          ) : null}
          {onLogout ? (
            <Button variant="secondary" type="button" onClick={onLogout}>
              <LogOut size={16} />
              Đăng xuất
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
