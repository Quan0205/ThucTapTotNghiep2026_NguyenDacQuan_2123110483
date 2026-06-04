import { ArrowRight, BriefcaseBusiness, LogIn, Shield, Sparkles, Users2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { paths } from '../config/paths'

const entryCards = [
  {
    title: 'Khu vực nhân viên',
    description: 'Đăng nhập để xem lịch làm, chấm công và payroll cá nhân.',
    href: paths.userLogin,
    icon: Users2,
    tone: 'bg-coffee-700 text-white',
  },
  {
    title: 'Khu vực quản trị',
    description: 'Dành cho admin/manager quản lý danh mục, nhân sự và vận hành.',
    href: paths.adminLogin,
    icon: Shield,
    tone: 'bg-slate-900 text-white',
  },
  {
    title: 'Tuyển dụng',
    description: 'Xem vị trí đang mở và nộp hồ sơ trực tiếp qua trang công khai.',
    href: paths.recruitment,
    icon: BriefcaseBusiness,
    tone: 'bg-emerald-600 text-white',
  },
]

export function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,78,27,0.16),_transparent_30%),linear-gradient(180deg,#fffaf4_0%,#f4efe8_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 shadow-2xl shadow-coffee-900/10 backdrop-blur-xl">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-coffee-50 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-coffee-700">
                <Sparkles size={14} />
                CoffeeHRM
              </div>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                  Cổng người dùng cho chuỗi quán cà phê, tách riêng admin và nhân viên ngay từ trang đầu.
                </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  localhost mặc định là khu vực người dùng. Admin đi qua /admin, còn trang tuyển dụng công khai dùng /tuyen-dung.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={paths.userLogin}
                  className="inline-flex items-center gap-2 rounded-xl bg-coffee-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-coffee-900/10 transition hover:bg-coffee-800"
                >
                  <LogIn size={16} />
                  Đăng nhập nhân viên
                </Link>
                <Link
                  to={paths.recruitment}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-coffee-200 transition hover:bg-coffee-50"
                >
                  <ArrowRight size={16} />
                  Xem tuyển dụng
                </Link>
              </div>
            </div>

            <Card>
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Điều hướng nhanh</div>
                <div className="space-y-3">
                  {entryCards.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.title}
                        to={item.href}
                        className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-4 transition hover:border-coffee-300 hover:bg-coffee-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.title}</div>
                            <div className="text-sm text-slate-500">{item.description}</div>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-slate-400" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Nhân viên', 'Lịch làm, chấm công, lương cá nhân', paths.userLogin],
            ['Admin', 'Quản lý hệ thống, nghiệp vụ và báo cáo', paths.adminLogin],
            ['Tuyển dụng', 'Trang công khai dành cho ứng viên', paths.recruitment],
          ].map(([label, description, href]) => (
            <Link key={label} to={href} className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-lg shadow-coffee-900/5 transition hover:-translate-y-0.5 hover:border-coffee-300 hover:shadow-coffee-900/10">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</div>
              <div className="mt-2 text-lg font-black text-slate-900">{description}</div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-coffee-700">
                Đi tới <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
