import { useEffect, useMemo, useState } from 'react'
import {
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  ClipboardCheck,
  ReceiptText,
  School,
  Users2,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Table } from '../components/ui/Table'
import { LoadingView, ErrorView } from '../components/ui/StateViews'
import { StatCard } from '../components/ui/StatCard'
import { api } from '../api/coffeeApi'
import type { Attendance, Branch, Employee, Payroll, Recruitment, Schedule, Shift, Training } from '../types/models'
import { formatCurrency, formatDate, formatPayrollStatus } from '../utils/format'

type DashboardState = {
  branches: Branch[]
  employees: Employee[]
  shifts: Shift[]
  schedules: Schedule[]
  attendance: Attendance[]
  payrolls: Payroll[]
  recruitments: Recruitment[]
  trainings: Training[]
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [branches, employees, shifts, schedules, attendance, payrolls, recruitments, trainings] = await Promise.all([
        api.branches.list(),
        api.employees.list(),
        api.shifts.list(),
        api.schedules.list(),
        api.attendance.list(),
        api.payroll.list(),
        api.recruitments.list(),
        api.trainings.list(),
      ])
      setData({ branches, employees, shifts, schedules, attendance, payrolls, recruitments, trainings })
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const recentEmployees = useMemo(
    () =>
      [...(data?.employees ?? [])]
        .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
        .slice(0, 5),
    [data?.employees],
  )

  const recentSchedules = useMemo(
    () =>
      [...(data?.schedules ?? [])]
        .sort((a, b) => new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime())
        .slice(0, 5),
    [data?.schedules],
  )

  const recentPayrolls = useMemo(
    () =>
      [...(data?.payrolls ?? [])]
        .sort((a, b) => b.payrollYear * 12 + b.payrollMonth - (a.payrollYear * 12 + a.payrollMonth))
        .slice(0, 5),
    [data?.payrolls],
  )

  if (loading) return <LoadingView label="Đang tải dashboard CoffeeHRM..." />
  if (error) return <ErrorView message={error} />

  const counts = [
    { title: 'Chi nhánh', value: String(data?.branches.length ?? 0), icon: <Building2 size={18} /> },
    { title: 'Nhân viên', value: String(data?.employees.length ?? 0), icon: <Users2 size={18} /> },
    { title: 'Ca làm', value: String(data?.shifts.length ?? 0), icon: <CalendarRange size={18} /> },
    { title: 'Lịch làm', value: String(data?.schedules.length ?? 0), icon: <ClipboardCheck size={18} /> },
    { title: 'Chấm công', value: String(data?.attendance.length ?? 0), icon: <ClipboardCheck size={18} /> },
    { title: 'Payroll', value: String(data?.payrolls.length ?? 0), icon: <ReceiptText size={18} /> },
    { title: 'Tuyển dụng', value: String(data?.recruitments.length ?? 0), icon: <BriefcaseBusiness size={18} /> },
    { title: 'Đào tạo', value: String(data?.trainings.length ?? 0), icon: <School size={18} /> },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {counts.map((item) => (
          <StatCard key={item.title} hint="Dữ liệu từ API thực tế" icon={item.icon} title={item.title} value={item.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-coffee-900">Nhân viên mới</h3>
            <p className="text-sm text-stone-500">Dựa theo ngày vào làm</p>
          </div>
          <div className="space-y-3">
            {recentEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between rounded-xl border border-white/50 bg-white/60 p-4 transition-colors duration-200 hover:bg-white/90 shadow-sm shadow-coffee-900/5">
                <div>
                  <div className="font-bold text-slate-900">{employee.fullName}</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">
                    {employee.employeeCode} • {employee.branch?.branchName ?? '—'}
                  </div>
                </div>
                <Badge tone={employee.isActive ? 'success' : 'danger'}>{employee.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-coffee-900">Lịch làm gần nhất</h3>
            <p className="text-sm text-stone-500">Sắp xếp theo ngày lịch</p>
          </div>
          <div className="space-y-3">
            {recentSchedules.map((schedule) => (
              <div key={schedule.id} className="rounded-xl border border-white/50 bg-white/60 p-4 transition-colors duration-200 hover:bg-white/90 shadow-sm shadow-coffee-900/5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900">{schedule.employee?.fullName ?? `NV #${schedule.employeeId}`}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">
                      {schedule.shift?.shiftName ?? 'Ca làm'} • {formatDate(schedule.scheduleDate)}
                    </div>
                  </div>
                  <Badge>{schedule.attendance ? 'Đã chấm công' : 'Chưa chấm công'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-coffee-900">Payroll gần nhất</h3>
            <p className="text-sm text-stone-500">Theo tháng/năm phát sinh</p>
          </div>
          <div className="space-y-3">
            {recentPayrolls.map((payroll) => (
              <div key={payroll.id} className="rounded-xl border border-white/50 bg-white/60 p-4 transition-colors duration-200 hover:bg-white/90 shadow-sm shadow-coffee-900/5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900">{payroll.employee?.fullName ?? `NV #${payroll.employeeId}`}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">
                      Tháng {payroll.payrollMonth}/{payroll.payrollYear} • {formatCurrency(payroll.totalSalary)}
                    </div>
                  </div>
                  <Badge>{formatPayrollStatus(payroll.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-coffee-900">Tổng quan nhanh</h3>
          <p className="text-sm text-stone-500">Hiển thị bằng dữ liệu hiện có từ backend</p>
        </div>
        <Table
          columns={[
            { key: 'label', label: 'Hạng mục' },
            { key: 'value', label: 'Số lượng' },
          ]}
          rowKey={(row) => row.label}
          rows={[
            { label: 'Chi nhánh', value: data?.branches.length ?? 0 },
            { label: 'Nhân viên', value: data?.employees.length ?? 0 },
            { label: 'Ca làm', value: data?.shifts.length ?? 0 },
            { label: 'Lịch làm', value: data?.schedules.length ?? 0 },
            { label: 'Chấm công', value: data?.attendance.length ?? 0 },
            { label: 'Payroll', value: data?.payrolls.length ?? 0 },
            { label: 'Đợt tuyển dụng', value: data?.recruitments.length ?? 0 },
            { label: 'Khóa đào tạo', value: data?.trainings.length ?? 0 },
          ]}
        />
      </Card>
    </div>
  )
}
