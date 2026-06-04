import { useEffect, useState, type FormEvent } from 'react'
import { Lock, Mail, Shield, Users2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Button } from '../components/ui/Button'
import { paths } from '../config/paths'

type LoginMode = 'admin' | 'user'

type Props = {
  mode: LoginMode
}

const loginCopy = {
  admin: {
    title: 'Đăng nhập quản trị',
    eyebrow: 'CoffeeHRM admin',
    description: 'Dành cho admin, HR và quản lý vận hành để vào khu vực /admin.',
    sampleTitle: 'Tài khoản demo',
    sampleUsername: 'admin',
    samplePassword: 'admin123',
    primaryCta: 'Đăng nhập admin',
    destination: paths.adminDashboard,
    fallbackDestination: paths.adminDashboard,
    switchLink: paths.userLogin,
    switchLabel: 'Đăng nhập nhân viên',
    accent: 'bg-slate-900',
    icon: Shield,
  },
  user: {
    title: 'Đăng nhập nhân viên',
    eyebrow: 'CoffeeHRM user space',
    description: 'Dành cho nhân viên và người dùng nội bộ để vào khu vực người dùng tại localhost.',
    sampleTitle: 'Lưu ý',
    sampleUsername: 'Tài khoản nhân viên',
    samplePassword: 'Do quản trị tạo',
    primaryCta: 'Đăng nhập nhân viên',
    destination: paths.employeePortal,
    fallbackDestination: paths.employeePortal,
    switchLink: paths.adminLogin,
    switchLabel: 'Đăng nhập admin',
    accent: 'bg-coffee-700',
    icon: Users2,
  },
} as const

function hasAdminAccess(permissions: string[]) {
  return permissions.includes('dashboard.view') || permissions.some((permission) => !permission.startsWith('self.'))
}

export function LoginPage({ mode }: Props) {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const copy = loginCopy[mode]
  const [username, setUsername] = useState(mode === 'admin' ? 'admin' : '')
  const [password, setPassword] = useState(mode === 'admin' ? 'admin123' : '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const loginDestination = mode === 'admin' ? paths.adminDashboard : paths.employeePortal

  useEffect(() => {
    if (auth.isLoading || !auth.isAuthenticated) {
      return
    }

    navigate(loginDestination, { replace: true })
  }, [auth.isAuthenticated, auth.isLoading, loginDestination, navigate])

  const returnTo = (() => {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
    if (!from) {
      return loginDestination
    }

    if (mode === 'admin' && from.startsWith('/admin')) {
      return from
    }

    if (mode === 'user' && from.startsWith('/nhan-vien')) {
      return from
    }

    return loginDestination
  })()

  if (auth.isLoading) {
    return <div className="min-h-screen bg-slate-50" />
  }

  if (auth.isAuthenticated) {
    return <div className="min-h-screen bg-slate-50" />
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const session = await auth.signIn(username, password)
      const permissions = session.user.permissions ?? []

      if (mode === 'admin' && !hasAdminAccess(permissions)) {
        await auth.signOut()
        setError('Tài khoản này chưa có quyền vào khu vực quản trị.')
        return
      }

      navigate(returnTo, { replace: true })
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể đăng nhập.')
    } finally {
      setLoading(false)
    }
  }

  const Icon = copy.icon

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,78,27,0.16),_transparent_32%),linear-gradient(180deg,#fffaf4_0%,#f5efe7_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-2xl shadow-coffee-900/10 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className={`relative flex flex-col justify-between overflow-hidden px-8 py-10 text-white ${copy.accent}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_35%)]" />
          <div className="relative space-y-5">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-coffee-100">
              {copy.eyebrow}
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight md:text-5xl">{copy.title}</h1>
            <p className="max-w-lg text-sm leading-7 text-white/85 md:text-base">{copy.description}</p>
          </div>

          <div className="relative grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{copy.sampleTitle}</div>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-bold">{copy.sampleUsername}</div>
                <div className="text-xs text-white/70">{copy.samplePassword}</div>
              </div>
              <Icon size={18} className="text-white/70" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 md:px-10">
          <form className="w-full max-w-md space-y-6" onSubmit={submit}>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-coffee-500">{copy.eyebrow}</p>
              <h2 className="text-3xl font-black tracking-tight text-coffee-900">{copy.title}</h2>
              <p className="text-sm text-stone-600">
                {mode === 'admin'
                  ? 'Đi vào khu vực quản trị để quản lý chi nhánh, nhân sự, lương và báo cáo.'
                  : 'Đi vào khu vực người dùng để xem lịch làm, chấm công và dữ liệu cá nhân.'}
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-coffee-800">Tên đăng nhập</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  className="w-full rounded-2xl border border-coffee-200 bg-white px-10 py-3 text-sm outline-none transition focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={mode === 'admin' ? 'admin' : 'username'}
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-coffee-800">Mật khẩu</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  className="w-full rounded-2xl border border-coffee-200 bg-white px-10 py-3 text-sm outline-none transition focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="********"
                  autoComplete="current-password"
                />
              </div>
            </label>

            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            <Button className="w-full justify-center" disabled={loading} type="submit">
              {loading ? 'Đang đăng nhập...' : copy.primaryCta}
            </Button>

            <p className="text-xs leading-6 text-stone-500">
              {mode === 'admin'
                ? 'Khu vực này dành riêng cho admin. Nếu bạn là nhân viên, hãy đăng nhập ở trang người dùng.'
                : 'Khu vực này dành cho nhân viên và người dùng nội bộ. Nếu bạn cần quyền quản trị, chuyển sang trang admin.'}
            </p>

            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              <Link
                to={paths.publicHome}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-coffee-300 hover:bg-coffee-50"
              >
                Trang chủ
              </Link>
              <Link
                to={copy.switchLink}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-coffee-300 hover:bg-coffee-50"
              >
                {copy.switchLabel}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
