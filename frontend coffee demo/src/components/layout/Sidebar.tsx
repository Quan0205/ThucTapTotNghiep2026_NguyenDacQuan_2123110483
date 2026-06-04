import { NavLink } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  CalendarRange,
  ChevronRight,
  ClipboardCheck,
  FileBarChart2,
  Home,
  LineChart,
  Logs,
  type LucideIcon,
  PenSquare,
  RefreshCcw,
  School,
  Settings2,
  ShieldCheck,
  UserCircle2,
  Users2,
  UserRoundCog,
  BriefcaseBusiness,
  Clock3,
  ReceiptText,
  CalendarOff,
  CalendarDays,
} from 'lucide-react'

type NavItem = {
  path: string
  label: string
  icon: LucideIcon
  requiredPermissions?: string[]
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: Home, requiredPermissions: ['dashboard.view'] },
      { path: '/admin/reports', label: 'Báo cáo', icon: FileBarChart2, requiredPermissions: ['reports.view'] },
      { path: '/admin/profile', label: 'Hồ sơ tài khoản', icon: UserCircle2, requiredPermissions: ['profile.view'] },
    ],
  },
  {
    label: 'Danh mục',
    items: [
      { path: '/admin/branches', label: 'Chi nhánh', icon: Building2, requiredPermissions: ['master.branches.manage'] },
      { path: '/admin/roles', label: 'Chức vụ', icon: BadgeCheck, requiredPermissions: ['master.positions.manage'] },
      { path: '/admin/system-roles', label: 'Vai trò hệ thống', icon: ShieldCheck, requiredPermissions: ['security.accounts.manage'] },
      { path: '/admin/shifts', label: 'Ca làm', icon: Clock3, requiredPermissions: ['master.shifts.manage'] },
      { path: '/admin/employees', label: 'Nhân viên', icon: Users2, requiredPermissions: ['hr.employees.manage'] },
      { path: '/admin/employee-contracts', label: 'HĐ nhân viên', icon: BriefcaseBusiness, requiredPermissions: ['hr.contracts.manage'] },
      { path: '/admin/user-accounts', label: 'Tài khoản', icon: UserRoundCog, requiredPermissions: ['security.accounts.manage'] },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { path: '/admin/schedules', label: 'Lịch làm', icon: CalendarRange, requiredPermissions: ['ops.schedules.manage'] },
      { path: '/admin/shift-open-slots', label: 'Ca mở', icon: CalendarDays, requiredPermissions: ['ops.schedules.manage'] },
      { path: '/admin/attendance', label: 'Chấm công', icon: ClipboardCheck, requiredPermissions: ['ops.attendance.manage'] },
      { path: '/admin/attendance-adjustments', label: 'Điều chỉnh công', icon: PenSquare, requiredPermissions: ['attendance.adjust.manage'] },
      { path: '/admin/payroll', label: 'Payroll', icon: ReceiptText, requiredPermissions: ['payroll.manage'] },
      { path: '/admin/payroll-details', label: 'Chi tiết lương', icon: LineChart, requiredPermissions: ['payroll.manage'] },
    ],
  },
  {
    label: 'Nghiệp vụ HR',
    items: [
      { path: '/admin/leave-requests', label: 'Nghỉ phép', icon: CalendarOff, requiredPermissions: ['leave.manage'] },
      { path: '/admin/shift-swaps', label: 'Đổi ca', icon: RefreshCcw, requiredPermissions: ['shift.swap.manage'] },
      { path: '/admin/recruitments', label: 'Tuyển dụng', icon: Settings2, requiredPermissions: ['recruitment.manage'] },
      { path: '/admin/candidates', label: 'Ứng viên', icon: Users2, requiredPermissions: ['recruitment.manage'] },
      { path: '/admin/trainings', label: 'Đào tạo', icon: School, requiredPermissions: ['training.manage'] },
      { path: '/admin/employee-trainings', label: 'Đào tạo NV', icon: ShieldCheck, requiredPermissions: ['training.manage'] },
      { path: '/admin/kpis', label: 'KPIs', icon: LineChart, requiredPermissions: ['kpi.manage'] },
    ],
  },
  {
    label: 'Hệ thống',
    items: [{ path: '/admin/audit-logs', label: 'Audit logs', icon: Logs, requiredPermissions: ['audit.view'] }],
  },
]

function filterGroups(permissions: string[]) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.requiredPermissions?.length ? item.requiredPermissions.some((permission) => permissions.includes(permission)) : true,
      ),
    }))
    .filter((group) => group.items.length > 0)
}

export function Sidebar({ permissions, onNavigate }: { permissions: string[]; onNavigate?: () => void }) {
  const visibleGroups = filterGroups(permissions)

  return (
    <aside className="flex h-full flex-col overflow-hidden border-r border-white/50 bg-white/70 backdrop-blur-2xl shadow-[4px_0_24px_rgba(61,38,22,0.02)]">
      <div className="border-b border-slate-200/60 px-5 py-6">
        <div className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-700 text-white shadow-lg shadow-coffee-900/20 ring-1 ring-inset ring-white/20">
            <Users2 size={22} className="opacity-90" />
          </div>
          <div>
            <div className="text-[15px] font-black tracking-tight text-slate-900">CoffeeHRM</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Khu vực quản trị</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-5 scrollbar-thin">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">{group.label}</p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        'group flex items-center justify-between rounded-[14px] px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                        isActive 
                          ? 'bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-md shadow-coffee-900/15' 
                          : 'text-slate-600 hover:bg-coffee-50/80 hover:text-coffee-900',
                      ].join(' ')
                    }
                    onClick={onNavigate}
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex items-center gap-3">
                          <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-coffee-600'} transition-colors`} />
                          {item.label}
                        </span>
                        <ChevronRight size={14} className={`transition group-hover:translate-x-0.5 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        ))}

        {visibleGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/70 px-4 py-6 text-sm font-medium text-slate-500 text-center">
            Tài khoản hiện tại chưa có quyền truy cập.
          </div>
        ) : null}
      </div>
    </aside>
  )
}

export function navGroups(permissions: string[]) {
  return filterGroups(permissions)
}
