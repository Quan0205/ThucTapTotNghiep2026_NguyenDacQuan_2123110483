import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Loader2, LogOut, ReceiptText, Sparkles, TimerReset, User2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/coffeeApi'
import { useAuth } from '../auth/AuthProvider'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingView } from '../components/ui/StateViews'
import { StatCard } from '../components/ui/StatCard'
import { Table } from '../components/ui/Table'
import { EmployeeScheduleOverview } from '../components/employee/EmployeeScheduleOverview'
import { paths } from '../config/paths'
import type { SelfPayrollSummary, SelfPortalOverview, SelfShiftBoard, SelfShiftBoardSchedule, ShiftOpenSlot } from '../types/models'
import { formatCurrency, formatDate, formatDateTime, formatPayrollStatus, formatTimeInput, toDateOnlyPayload } from '../utils/format'

const fallbackOverview: SelfPortalOverview = {
  profile: {
    employeeId: 1,
    employeeCode: 'EMP-0001',
    fullName: 'Nhân viên CoffeeHRM',
    username: 'employee',
    branchName: 'Head Office',
    roleName: 'Barista',
    systemRoleName: 'Employee',
    lastLoginAt: new Date().toISOString(),
  },
  schedules: [],
  summary: {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    scheduleCount: 0,
    presentCount: 0,
    lateCount: 0,
    earlyLeaveCount: 0,
    overtimeCount: 0,
    absentCount: 0,
    workingMinutes: 0,
  },
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfWeek(date: Date) {
  const clone = new Date(date)
  const day = clone.getDay() === 0 ? 7 : clone.getDay()
  clone.setDate(clone.getDate() - (day - 1))
  clone.setHours(0, 0, 0, 0)
  return clone
}

function addDays(date: Date, days: number) {
  const clone = new Date(date)
  clone.setDate(clone.getDate() + days)
  return clone
}

function weekDays(start: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

function weekLabel(start: Date) {
  const end = addDays(start, 6)
  return `${formatDate(toDateKey(start))} - ${formatDate(toDateKey(end))}`
}

export function EmployeeShiftWeekPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState<SelfPortalOverview>(fallbackOverview)
  const [board, setBoard] = useState<SelfShiftBoard | null>(null)
  const [payrolls, setPayrolls] = useState<SelfPayrollSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => toDateKey(startOfWeek(new Date())))
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10))
  const [attendanceNote, setAttendanceNote] = useState('')
  const [attendanceLoading, setAttendanceLoading] = useState(false)

  const permissions = auth.user?.permissions ?? []
  const canAttendance = permissions.includes('self.attendance')
  const canPayroll = permissions.includes('self.payroll.view')
  const canShiftView = permissions.includes('self.shift.view')
  const canShiftSelect = permissions.includes('self.shift.select')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [overviewResult, boardResult, payrollResult] = await Promise.all([
        api.selfPortal.overview(),
        canShiftView ? api.selfPortal.shiftBoard(weekStart) : Promise.resolve(null),
        canPayroll ? api.selfPortal.payrolls() : Promise.resolve([] as SelfPayrollSummary[]),
      ])
      setOverview(overviewResult)
      setBoard(boardResult)
      setPayrolls(payrollResult)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải dữ liệu ca làm.')
      setOverview(fallbackOverview)
      setBoard(null)
      setPayrolls([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [weekStart])

  async function handleSelect(slot: ShiftOpenSlot) {
    if (!canShiftSelect || slot.isFull || slot.myScheduleId) return
    setMessage(null)
    try {
      const result = await api.selfPortal.selectShift({ openShiftSlotId: slot.id })
      setMessage(`${result.message} - ${formatDate(result.slotDate)}`)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể chọn ca.')
    }
  }

  async function handleCancel(scheduleId: number) {
    setMessage(null)
    try {
      await api.selfPortal.cancelShift(scheduleId)
      setMessage('Đã hủy ca đã chọn.')
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể hủy ca.')
    }
  }

  async function handleCheckIn() {
    if (!canAttendance) {
      setMessage('Tài khoản hiện tại chưa có quyền tự chấm công.')
      return
    }
    setAttendanceLoading(true)
    setMessage(null)
    try {
      const result = await api.selfPortal.checkIn({
        attendanceDate: toDateOnlyPayload(attendanceDate),
        note: attendanceNote || null,
      })
      setMessage(`${result.message} - ${formatDate(result.attendanceDate)}`)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể check-in.')
    } finally {
      setAttendanceLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!canAttendance) {
      setMessage('Tài khoản hiện tại chưa có quyền tự chấm công.')
      return
    }
    setAttendanceLoading(true)
    setMessage(null)
    try {
      const result = await api.selfPortal.checkOut({
        attendanceDate: toDateOnlyPayload(attendanceDate),
        note: attendanceNote || null,
      })
      setMessage(`${result.message} - ${formatDate(result.attendanceDate)}`)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể check-out.')
    } finally {
      setAttendanceLoading(false)
    }
  }

  async function handleLogout() {
    await auth.signOut()
    navigate(paths.userLogin, { replace: true })
  }

  const shiftBoard = board?.slots ?? []
  const bookedShifts = board?.mySchedules ?? []
  const weekStartDate = new Date(`${weekStart}T00:00:00`)
  const days = useMemo(() => weekDays(weekStartDate), [weekStartDate])
  const selectedDay = attendanceDate
  const daySlots = useMemo(() => shiftBoard.filter((slot) => slot.slotDate.slice(0, 10) === selectedDay), [selectedDay, shiftBoard])
  const selectedDaySchedules = useMemo(
    () => bookedShifts.filter((schedule: SelfShiftBoardSchedule) => schedule.scheduleDate.slice(0, 10) === selectedDay),
    [bookedShifts, selectedDay],
  )
  const myBookedCount = bookedShifts.length
  const latestPayroll = payrolls[0] ?? null
  const summary = overview.summary

  function focusBookedSchedule(schedule: SelfShiftBoardSchedule) {
    setAttendanceDate(schedule.scheduleDate.slice(0, 10))
  }

  if (loading) return <LoadingView label="Đang tải tuần ca làm..." />

  const stats = [
    { title: 'Ca mở trong tuần', value: String(shiftBoard.length), hint: weekLabel(weekStartDate), icon: <CalendarDays size={18} /> },
    { title: 'Ca tôi đã chọn', value: String(myBookedCount), hint: 'Bookings của tôi', icon: <CheckCircle2 size={18} /> },
    { title: 'Đi muộn', value: String(summary.lateCount), hint: 'Trong tháng này', icon: <Clock3 size={18} /> },
    { title: 'Tăng ca', value: String(summary.overtimeCount), hint: 'Trong tháng này', icon: <TimerReset size={18} /> },
    { title: 'Lương gần nhất', value: latestPayroll ? formatCurrency(latestPayroll.totalSalary) : '—', hint: latestPayroll ? `${latestPayroll.payrollMonth}/${latestPayroll.payrollYear}` : 'Chưa có dữ liệu', icon: <ReceiptText size={18} /> },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(79,121,240,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.12),_transparent_24%),linear-gradient(135deg,#ffffff_0%,#f8fbff_45%,#eef4ff_100%)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-coffee-700 ring-1 ring-coffee-200">
                <Sparkles size={14} />
                Employee Week Board
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" type="button" onClick={() => void load()}>
                  <Loader2 size={16} />
                  Làm mới
                </Button>
                <Button variant="secondary" type="button" onClick={() => void handleLogout()}>
                  <LogOut size={16} />
                  Đăng xuất
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                Chọn ca theo tuần, thấy ngay ca nào còn trống và ca nào đã đầy.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                Nhân viên không còn bị gán ca sẵn. Bạn duyệt theo tuần, bấm vào ca còn trống để đăng ký, và hệ thống sẽ tự khóa khi
                đủ số lượng.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{overview.profile.employeeCode}</Badge>
              <Badge tone="success">{overview.profile.branchName ?? 'Chưa có chi nhánh'}</Badge>
              <Badge tone="neutral">{overview.profile.roleName ?? 'Chưa có chức vụ'}</Badge>
              <Badge tone="warning">{overview.profile.systemRoleName ?? 'Employee'}</Badge>
              <Badge tone="info">{permissions.length} quyền</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Nhân viên</div>
                <div className="mt-2 flex items-center gap-2 text-lg font-black text-slate-900">
                  <User2 size={18} className="text-coffee-700" />
                  {overview.profile.fullName}
                </div>
              </div>
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tài khoản</div>
                <div className="mt-2 text-lg font-black text-slate-900">{overview.profile.username}</div>
                <div className="mt-1 text-xs text-slate-500">Đăng nhập gần nhất: {formatDateTime(overview.profile.lastLoginAt)}</div>
              </div>
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tuần đang xem</div>
                <div className="mt-2 text-lg font-black text-slate-900">{weekLabel(weekStartDate)}</div>
                <div className="mt-1 text-xs text-slate-500">Bấm nút trái/phải để đổi tuần.</div>
              </div>
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quyền mở rộng</div>
                <div className="mt-2 text-lg font-black text-slate-900">{permissions.length} quyền</div>
                <div className="mt-1 text-xs text-slate-500">Ca mở, chấm công và payroll được tách riêng.</div>
              </div>
            </div>
          </div>
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coffee-700 text-white">
                  <Clock3 size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ngày đang xem</div>
                  <div className="text-lg font-black text-slate-900">{formatDate(selectedDay)}</div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" type="button" onClick={() => setWeekStart(toDateKey(addDays(weekStartDate, -7)))}>
                  <ChevronLeft size={16} />
                  Tuần trước
                </Button>
                <Button variant="secondary" type="button" onClick={() => setWeekStart(toDateKey(addDays(weekStartDate, 7)))}>
                  Tuần sau
                  <ChevronRight size={16} />
                </Button>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Tuần</div>
                <div className="mt-1 text-2xl font-black text-slate-900">{weekLabel(weekStartDate)}</div>
                <div className="mt-2 text-sm text-slate-600">
                  {canShiftView ? `${shiftBoard.length} ca mở` : 'Chưa có quyền xem ca mở'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {error ? <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div> : null}
      {message ? <div className="rounded-3xl border border-coffee-200 bg-coffee-50 px-4 py-3 text-sm text-coffee-800">{message}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <StatCard key={item.title} hint={item.hint} icon={item.icon} title={item.title} value={item.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ca mở theo tuần</div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Chọn ca còn trống</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Các ô màu đậm là ca đang có thể chọn. Khi đạt đủ số lượng, ca sẽ tự khóa.
              </p>
            </div>
            <Badge tone="info">{daySlots.length} ca ngày này</Badge>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
            {days.map((day) => (
              <button
                key={toDateKey(day)}
                type="button"
                className={[
                  'rounded-2xl px-2 py-2 transition',
                  selectedDay === toDateKey(day) ? 'bg-coffee-700 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-coffee-50',
                ].join(' ')}
                onClick={() => setAttendanceDate(toDateKey(day))}
              >
                {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                <div className="mt-1 text-base font-black">{day.getDate()}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {daySlots.length > 0 ? (
              daySlots.map((slot) => {
                const selected = slot.myScheduleId != null
                return (
                  <div key={slot.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-black text-slate-900">{slot.shiftName}</div>
                          <Badge tone={slot.isFull ? 'danger' : selected ? 'success' : 'warning'}>{slot.isFull ? 'Đã đầy' : selected ? 'Đã chọn' : 'Còn chỗ'}</Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          {formatDate(slot.slotDate)} · {formatTimeInput(slot.startTime)} - {formatTimeInput(slot.endTime)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {slot.branchName} · {slot.note ?? 'Không có ghi chú'}
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Đã chọn</div>
                          <div className="mt-1 font-semibold text-slate-900">{slot.selectedCount}/{slot.capacity}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Chi nhánh</div>
                          <div className="mt-1 font-semibold text-slate-900">{slot.branchName}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected && slot.myScheduleId ? (
                        <Button variant="secondary" type="button" onClick={() => void handleCancel(slot.myScheduleId!)}>
                          Hủy ca đã chọn
                        </Button>
                      ) : (
                        <Button disabled={!canShiftSelect || slot.isFull} type="button" onClick={() => void handleSelect(slot)}>
                          Chọn ca
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                Ngày này chưa có ca mở.
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ca của tôi</div>
                <h3 className="text-xl font-black text-slate-900">Đã chọn trong tuần</h3>
              </div>
              <Badge tone="info">{bookedShifts.length} ca</Badge>
            </div>
            <div className="mb-3 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
              Ngày đang xem có <span className="font-bold text-slate-900">{selectedDaySchedules.length}</span> ca đã chọn.
            </div>
            <div className="space-y-3">
              {bookedShifts.length > 0 ? (
                bookedShifts.map((item) => (
                  <button
                    key={item.scheduleId}
                    type="button"
                    className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-coffee-300 hover:bg-coffee-50"
                    onClick={() => setAttendanceDate(item.scheduleDate.slice(0, 10))}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black text-slate-900">{item.shiftName}</div>
                        <div className="text-sm text-slate-600">
                          {formatDate(item.scheduleDate)} · {formatTimeInput(item.startTime)} - {formatTimeInput(item.endTime)}
                        </div>
                        <div className="text-xs text-slate-500">{item.note ?? 'Không có ghi chú'}</div>
                      </div>
                      <Badge tone={item.attendanceStatus ? 'success' : 'warning'}>{item.attendanceStatus ? 'Đã có công' : 'Chờ chấm công'}</Badge>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Chưa chọn ca nào trong tuần này.
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-coffee-700" />
              <h3 className="text-lg font-bold text-coffee-900">Chấm công nhanh</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Ngày làm</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                  type="date"
                  value={attendanceDate}
                  onChange={(event) => setAttendanceDate(event.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Ghi chú</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                  value={attendanceNote}
                  onChange={(event) => setAttendanceNote(event.target.value)}
                  placeholder="Ví dụ: vào ca sớm 5 phút"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button disabled={!canAttendance || attendanceLoading} onClick={() => void handleCheckIn()}>
                {attendanceLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                Check-in
              </Button>
              <Button disabled={!canAttendance || attendanceLoading} variant="secondary" onClick={() => void handleCheckOut()}>
                <TimerReset size={16} />
                Check-out
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <EmployeeScheduleOverview
        schedules={bookedShifts}
        weekStart={weekStartDate}
        selectedDate={selectedDay}
        onSelectSchedule={(schedule) => focusBookedSchedule(schedule)}
      />

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Payroll</div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Lương gần nhất</h2>
          </div>
          <Badge tone="info">{payrolls.length} kỳ</Badge>
        </div>

        {canPayroll ? (
          payrolls.length > 0 ? (
            <Table
              columns={[
                { key: 'period', label: 'Kỳ', render: (row) => `${row.payrollMonth}/${row.payrollYear}` },
                { key: 'amount', label: 'Tổng lương', render: (row) => formatCurrency(row.totalSalary) },
                { key: 'status', label: 'Trạng thái', render: (row) => <Badge>{formatPayrollStatus(row.status)}</Badge> },
                { key: 'closed', label: 'Khóa kỳ', render: (row) => (row.isClosed ? 'Có' : 'Không') },
                { key: 'approvedAt', label: 'Duyệt', render: (row) => formatDateTime(row.approvedAt) },
                { key: 'paidDate', label: 'Chi trả', render: (row) => formatDateTime(row.paidDate) },
              ]}
              rowKey={(row) => row.id}
              rows={payrolls}
              emptyText="Chưa có dữ liệu lương."
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              Chưa có payroll cá nhân để hiển thị.
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Tài khoản hiện tại chưa có quyền xem payroll cá nhân.
          </div>
        )}
      </Card>
    </div>
  )
}
