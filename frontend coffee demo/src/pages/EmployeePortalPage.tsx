import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CalendarOff,
  CheckCircle2,
  Clock3,
  Loader2,
  LogOut,
  MapPin,
  Medal,
  PlayCircle,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TimerReset,
  User2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/coffeeApi'
import { useAuth } from '../auth/AuthProvider'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { LoadingView } from '../components/ui/StateViews'
import { StatCard } from '../components/ui/StatCard'
import { Table } from '../components/ui/Table'
import { paths } from '../config/paths'
import type { AttendanceAdjustment, LeaveRequest, OptionItem, SelfPayrollSummary, SelfPortalOverview, SelfPortalSchedule, ShiftSwapRequest } from '../types/models'
import { formatAttendanceAdjustmentStatus, formatAttendanceStatus, formatCurrency, formatDate, formatDateTime, formatLeaveRequestStatus, formatPayrollStatus, formatShiftSwapStatus, formatTimeInput, toDateOnlyPayload } from '../utils/format'

const fallbackOverview: SelfPortalOverview = {
  profile: { employeeId: 1, employeeCode: 'EMP-0001', fullName: 'Nhân viên CoffeeHRM', username: 'employee', branchName: 'Head Office', roleName: 'Barista', systemRoleName: 'Employee', lastLoginAt: new Date().toISOString() },
  schedules: [
    { id: 1, scheduleDate: new Date().toISOString(), shiftId: 1, shiftCode: 'MORNING', shiftName: 'Ca sáng', startTime: '08:00:00', endTime: '16:00:00', graceMinutes: 10, note: 'Ưu tiên phục vụ quầy bar', attendanceId: null, attendanceStatus: null, checkInAt: null, checkOutAt: null },
    { id: 2, scheduleDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), shiftId: 2, shiftCode: 'AFTERNOON', shiftName: 'Ca chiều', startTime: '13:00:00', endTime: '21:00:00', graceMinutes: 10, note: 'Hỗ trợ quầy thu ngân', attendanceId: null, attendanceStatus: null, checkInAt: null, checkOutAt: null },
  ],
  summary: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), scheduleCount: 2, presentCount: 0, lateCount: 0, earlyLeaveCount: 0, overtimeCount: 0, absentCount: 0, workingMinutes: 0 },
  leaveBalance: { year: new Date().getFullYear(), annualAllowance: 12, usedDays: 0, pendingDays: 0, remainingDays: 12 },
}

const filters = [
  { key: 'upcoming', label: 'Sắp tới' },
  { key: 'all', label: 'Tất cả' },
  { key: 'past', label: 'Đã qua' },
] as const

type ScheduleFilter = (typeof filters)[number]['key']

function shiftLabel(schedule: SelfPortalSchedule) {
  return `${formatTimeInput(schedule.startTime)} - ${formatTimeInput(schedule.endTime)}`
}

function workingLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`
}

function toDateTimePayloadLocal(value: string) {
  if (!value) return null
  return value.length === 16 ? `${value}:00` : value
}

export function EmployeePortalPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState<SelfPortalOverview>(fallbackOverview)
  const [payrolls, setPayrolls] = useState<SelfPayrollSummary[]>([])
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [swaps, setSwaps] = useState<ShiftSwapRequest[]>([])
  const [adjustments, setAdjustments] = useState<AttendanceAdjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null)
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>('upcoming')
  const [scheduleDateFilter, setScheduleDateFilter] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10))
  const [attendanceNote, setAttendanceNote] = useState('')
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [workflowModal, setWorkflowModal] = useState<'leave' | 'swap' | 'adjust' | null>(null)
  const [formBusy, setFormBusy] = useState(false)
  const [employeeOptions, setEmployeeOptions] = useState<OptionItem[]>([])
  const [scheduleOptions, setScheduleOptions] = useState<OptionItem[]>([])
  const [leaveStartDate, setLeaveStartDate] = useState('')
  const [leaveEndDate, setLeaveEndDate] = useState('')
  const [leaveType, setLeaveType] = useState('Nghỉ phép')
  const [leaveReason, setLeaveReason] = useState('')
  const [swapRequestScheduleId, setSwapRequestScheduleId] = useState('')
  const [swapTargetEmployeeId, setSwapTargetEmployeeId] = useState('')
  const [swapTargetScheduleId, setSwapTargetScheduleId] = useState('')
  const [swapReason, setSwapReason] = useState('')
  const [adjustAttendanceId, setAdjustAttendanceId] = useState('')
  const [adjustRequestedCheckInAt, setAdjustRequestedCheckInAt] = useState('')
  const [adjustRequestedCheckOutAt, setAdjustRequestedCheckOutAt] = useState('')
  const [adjustRequestedStatus, setAdjustRequestedStatus] = useState('')
  const [adjustReason, setAdjustReason] = useState('')

  const permissions = auth.user?.permissions ?? []
  const canAttendance = permissions.includes('self.attendance')
  const canPayroll = permissions.includes('self.payroll.view')
  const canLeave = permissions.includes('leave.manage')
  const canSwap = permissions.includes('shift.swap.manage')
  const canAdjust = permissions.includes('attendance.adjust.manage')

  async function load() {
    setLoading(true)
    setLoadError(null)
    let fallbackError: string | null = null

    const overviewPromise = api.selfPortal.overview().catch((error_) => {
      fallbackError = fallbackError ?? (error_ instanceof Error ? error_.message : 'Không thể tải không gian nhân viên.')
      return fallbackOverview
    })
    const payrollPromise = canPayroll
      ? api.selfPortal.payrolls().catch((error_) => {
          fallbackError = fallbackError ?? (error_ instanceof Error ? error_.message : 'Không thể tải dữ liệu lương.')
          return [] as SelfPayrollSummary[]
        })
      : Promise.resolve([] as SelfPayrollSummary[])
    const leavePromise = canLeave ? api.leaveRequests.list().catch(() => [] as LeaveRequest[]) : Promise.resolve([] as LeaveRequest[])
    const swapPromise = canSwap ? api.shiftSwaps.list().catch(() => [] as ShiftSwapRequest[]) : Promise.resolve([] as ShiftSwapRequest[])
    const adjustPromise = canAdjust ? api.attendanceAdjustments.list().catch(() => [] as AttendanceAdjustment[]) : Promise.resolve([] as AttendanceAdjustment[])
    const employeeOptionsPromise = canSwap ? api.options.employeeOptions().catch(() => [] as OptionItem[]) : Promise.resolve([] as OptionItem[])
    const scheduleOptionsPromise = canSwap ? api.options.scheduleOptions().catch(() => [] as OptionItem[]) : Promise.resolve([] as OptionItem[])

    const [nextOverview, nextPayrolls, nextLeaves, nextSwaps, nextAdjustments, nextEmployees, nextSchedules] = await Promise.all([
      overviewPromise,
      payrollPromise,
      leavePromise,
      swapPromise,
      adjustPromise,
      employeeOptionsPromise,
      scheduleOptionsPromise,
    ])
    setOverview(nextOverview)
    setPayrolls(nextPayrolls)
    setLeaves(nextLeaves)
    setSwaps(nextSwaps)
    setAdjustments(nextAdjustments)
    setEmployeeOptions(nextEmployees)
    setScheduleOptions(nextSchedules)
    setSelectedScheduleId((current) => (current && nextOverview.schedules.some((item) => item.id === current) ? current : nextOverview.schedules[0]?.id ?? null))
    setScheduleDateFilter((current) => current || nextOverview.schedules[0]?.scheduleDate.slice(0, 10) || '')
    setAttendanceDate((current) => current || nextOverview.schedules[0]?.scheduleDate.slice(0, 10) || new Date().toISOString().slice(0, 10))
    setLoadError(fallbackError)
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const schedules = overview.schedules
  const summary = overview.summary
  const leaveBalance = overview.leaveBalance
  const latestPayroll = payrolls[0] ?? null
  const todayKey = new Date().toISOString().slice(0, 10)
  const upcomingSchedules = useMemo(() => schedules.filter((item) => item.scheduleDate.slice(0, 10) >= todayKey), [schedules, todayKey])
  const pastSchedules = useMemo(() => schedules.filter((item) => item.scheduleDate.slice(0, 10) < todayKey), [schedules, todayKey])
  const dateOptions = useMemo(() => Array.from(new Set(schedules.map((item) => item.scheduleDate.slice(0, 10)))).sort((a, b) => b.localeCompare(a)), [schedules])
  const visibleSchedules = useMemo(() => (scheduleFilter === 'all' ? schedules : scheduleFilter === 'past' ? pastSchedules : upcomingSchedules), [pastSchedules, scheduleFilter, schedules, upcomingSchedules])
  const dateFilteredSchedules = useMemo(
    () => (scheduleDateFilter ? visibleSchedules.filter((item) => item.scheduleDate.slice(0, 10) === scheduleDateFilter) : visibleSchedules),
    [scheduleDateFilter, visibleSchedules],
  )
  const selectedSchedule = useMemo(() => schedules.find((item) => item.id === selectedScheduleId) ?? schedules[0] ?? null, [schedules, selectedScheduleId])
  const selectedStatus = selectedSchedule ? (selectedSchedule.attendanceStatus ? formatAttendanceStatus(selectedSchedule.attendanceStatus as 1 | 2 | 3 | 4 | 5 | 6) : 'Chờ chấm công') : 'Chưa chọn ca'
  const ownLeaves = useMemo(() => leaves.filter((item) => item.employeeId === overview.profile.employeeId), [leaves, overview.profile.employeeId])
  const ownSwaps = useMemo(() => swaps.filter((item) => item.requestEmployeeId === overview.profile.employeeId), [overview.profile.employeeId, swaps])
  const ownAdjustments = useMemo(() => adjustments.filter((item) => item.employeeId === overview.profile.employeeId), [adjustments, overview.profile.employeeId])
  const swapRequestDate = schedules.find((item) => item.id === Number(swapRequestScheduleId))?.scheduleDate.slice(0, 10) ?? selectedSchedule?.scheduleDate.slice(0, 10) ?? ''
  const swapTargetOptions = useMemo(
    () => scheduleOptions.filter((option) => option.value !== swapRequestScheduleId && (!swapRequestDate || option.label.includes(swapRequestDate))),
    [scheduleOptions, swapRequestDate, swapRequestScheduleId],
  )

  async function handleCheckIn() {
    if (!canAttendance) return setMessage('Tài khoản hiện tại chưa có quyền tự chấm công.')
    setAttendanceLoading(true)
    setMessage(null)
    try {
      const result = await api.selfPortal.checkIn({ attendanceDate: toDateOnlyPayload(attendanceDate), note: attendanceNote || null })
      setMessage(`${result.message} - ${formatDate(result.attendanceDate)}`)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể check-in.')
    } finally {
      setAttendanceLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!canAttendance) return setMessage('Tài khoản hiện tại chưa có quyền tự chấm công.')
    setAttendanceLoading(true)
    setMessage(null)
    try {
      const result = await api.selfPortal.checkOut({ attendanceDate: toDateOnlyPayload(attendanceDate), note: attendanceNote || null })
      setMessage(`${result.message} - ${formatDate(result.attendanceDate)}`)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể check-out.')
    } finally {
      setAttendanceLoading(false)
    }
  }

  function openLeaveModal() {
    const baseDate = selectedSchedule?.scheduleDate.slice(0, 10) || attendanceDate
    setLeaveStartDate(baseDate)
    setLeaveEndDate(baseDate)
    setLeaveType('Nghỉ phép')
    setLeaveReason('')
    setWorkflowModal('leave')
  }

  function openSwapModal() {
    const requestSchedule = selectedSchedule?.id ? String(selectedSchedule.id) : schedules[0]?.id ? String(schedules[0].id) : ''
    const targetSchedule = scheduleOptions.find((option) => option.value !== requestSchedule)?.value ?? ''
    setSwapRequestScheduleId(requestSchedule)
    setSwapTargetEmployeeId('')
    setSwapTargetScheduleId(targetSchedule)
    setSwapReason('')
    setWorkflowModal('swap')
  }

  function openAdjustModal() {
    const attendanceId = selectedSchedule?.attendanceId ? String(selectedSchedule.attendanceId) : ownAdjustments[0]?.attendanceId ? String(ownAdjustments[0].attendanceId) : ''
    setAdjustAttendanceId(attendanceId)
    setAdjustRequestedCheckInAt(selectedSchedule?.checkInAt ? selectedSchedule.checkInAt.slice(0, 16) : '')
    setAdjustRequestedCheckOutAt(selectedSchedule?.checkOutAt ? selectedSchedule.checkOutAt.slice(0, 16) : '')
    setAdjustRequestedStatus(selectedSchedule?.attendanceStatus ? String(selectedSchedule.attendanceStatus) : '')
    setAdjustReason('')
    setWorkflowModal('adjust')
  }

  async function submitLeaveRequest() {
    setFormBusy(true)
    setMessage(null)
    try {
      await api.leaveRequests.create({
        employeeId: overview.profile.employeeId,
        startDate: toDateOnlyPayload(leaveStartDate) as string,
        endDate: toDateOnlyPayload(leaveEndDate) as string,
        leaveType: leaveType.trim(),
        reason: leaveReason.trim() || null,
      })
      setWorkflowModal(null)
      setMessage('Đã gửi đơn nghỉ phép.')
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể gửi đơn nghỉ phép.')
    } finally {
      setFormBusy(false)
    }
  }

  async function submitSwapRequest() {
    if (!swapRequestScheduleId || !swapTargetEmployeeId || !swapTargetScheduleId) {
      setMessage('Vui lòng chọn đầy đủ ca và người đổi.')
      return
    }
    setFormBusy(true)
    setMessage(null)
    try {
      await api.shiftSwaps.create({
        requestEmployeeId: overview.profile.employeeId,
        targetEmployeeId: Number(swapTargetEmployeeId),
        requestScheduleId: Number(swapRequestScheduleId),
        targetScheduleId: Number(swapTargetScheduleId),
        reason: swapReason.trim() || null,
      })
      setWorkflowModal(null)
      setMessage('Đã gửi yêu cầu đổi ca.')
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể gửi yêu cầu đổi ca.')
    } finally {
      setFormBusy(false)
    }
  }

  async function submitAdjustmentRequest() {
    if (!adjustAttendanceId) {
      setMessage('Vui lòng chọn bản ghi công cần điều chỉnh.')
      return
    }
    setFormBusy(true)
    setMessage(null)
    try {
      await api.attendanceAdjustments.create({
        attendanceId: Number(adjustAttendanceId),
        employeeId: overview.profile.employeeId,
        requestedCheckInAt: toDateTimePayloadLocal(adjustRequestedCheckInAt),
        requestedCheckOutAt: toDateTimePayloadLocal(adjustRequestedCheckOutAt),
        requestedStatus: adjustRequestedStatus ? Number(adjustRequestedStatus) : null,
        reason: adjustReason.trim() || null,
      })
      setWorkflowModal(null)
      setMessage('Đã gửi yêu cầu điều chỉnh công.')
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể gửi yêu cầu điều chỉnh công.')
    } finally {
      setFormBusy(false)
    }
  }

  async function cancelLeaveRequest(id: number) {
    setFormBusy(true)
    try {
      await api.leaveRequests.cancel(id)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể hủy đơn nghỉ phép.')
    } finally {
      setFormBusy(false)
    }
  }

  async function cancelSwapRequest(id: number) {
    setFormBusy(true)
    try {
      await api.shiftSwaps.cancel(id)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể hủy yêu cầu đổi ca.')
    } finally {
      setFormBusy(false)
    }
  }

  async function cancelAdjustmentRequest(id: number) {
    setFormBusy(true)
    try {
      await api.attendanceAdjustments.cancel(id)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể hủy yêu cầu điều chỉnh công.')
    } finally {
      setFormBusy(false)
    }
  }

  async function handleLogout() {
    await auth.signOut()
    navigate(paths.userLogin, { replace: true })
  }

  if (loading) return <LoadingView label="Đang tải không gian nhân viên..." />

  const stats = [
    { title: 'Lịch làm', value: String(summary.scheduleCount), hint: `Tháng ${summary.month}/${summary.year}`, icon: <CalendarDays size={18} /> },
    { title: 'Đúng giờ', value: String(summary.presentCount), hint: 'Bản ghi công tốt', icon: <CheckCircle2 size={18} /> },
    { title: 'Đi muộn', value: String(summary.lateCount), hint: 'Cần lưu ý', icon: <Clock3 size={18} /> },
    { title: 'Tăng ca', value: String(summary.overtimeCount), hint: 'Phát sinh trong kỳ', icon: <TimerReset size={18} /> },
    { title: 'Tổng công', value: workingLabel(summary.workingMinutes), hint: 'Tổng giờ làm', icon: <ReceiptText size={18} /> },
  ]
  stats.push({ title: 'Phep con lai', value: `${leaveBalance.remainingDays}/${leaveBalance.annualAllowance}`, hint: `Nam ${leaveBalance.year}`, icon: <CalendarOff size={18} /> })

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(166,124,82,0.15),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_30%),linear-gradient(135deg,#ffffff_0%,#fcfbf8_45%,#f2eae1_100%)] shadow-xl shadow-coffee-900/10">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-coffee-700 ring-1 ring-coffee-200"><Sparkles size={14} />Employee Space</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" type="button" onClick={() => void load()}><RefreshCcw size={16} />Làm mới</Button>
                <Button variant="secondary" type="button" onClick={() => void handleLogout()}><LogOut size={16} />Đăng xuất</Button>
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Một không gian làm việc riêng cho lịch làm, chấm công và lương cá nhân.</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">Màn hình này gom các nghiệp vụ nhân viên theo đúng backend hiện có: xem ca, chọn ca đang theo dõi, chấm công, tra cứu payroll và mở các workflow phụ nếu tài khoản được cấp quyền tương ứng.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{overview.profile.employeeCode}</Badge>
              <Badge tone="success">{overview.profile.branchName ?? 'Chưa có chi nhánh'}</Badge>
              <Badge tone="neutral">{overview.profile.roleName ?? 'Chưa có chức vụ'}</Badge>
              <Badge tone="warning">{overview.profile.systemRoleName ?? 'Employee'}</Badge>
              <Badge tone="info">{permissions.length} quyền</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Nhân viên</div><div className="mt-2 flex items-center gap-2 text-lg font-black text-slate-900"><User2 size={18} className="text-coffee-700" />{overview.profile.fullName}</div></div>
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tài khoản</div><div className="mt-2 text-lg font-black text-slate-900">{overview.profile.username}</div><div className="mt-1 text-xs text-slate-500">Đăng nhập gần nhất: {formatDateTime(overview.profile.lastLoginAt)}</div></div>
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ngày hiển thị</div><div className="mt-2 text-lg font-black text-slate-900">{attendanceDate}</div><div className="mt-1 text-xs text-slate-500">Đồng bộ với ca đang chọn.</div></div>
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quyền mở rộng</div><div className="mt-2 text-lg font-black text-slate-900">{permissions.length} quyền</div><div className="mt-1 text-xs text-slate-500">Nghiệp vụ phụ tự mở theo permission backend.</div></div>
            </div>
          </div>
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coffee-700 text-white"><Clock3 size={20} /></div><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ca đang xem</div><div className="text-lg font-black text-slate-900">{selectedSchedule ? selectedSchedule.shiftName : 'Chưa chọn ca'}</div></div></div>
              {selectedSchedule ? <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="flex items-center justify-between gap-3"><div><div className="text-sm font-bold text-slate-900">{formatDate(selectedSchedule.scheduleDate)}</div><div className="text-xs text-slate-500">{selectedSchedule.shiftCode}</div></div><Badge>{selectedStatus}</Badge></div><div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2"><div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Khung giờ</div><div className="mt-1 font-semibold text-slate-900">{shiftLabel(selectedSchedule)}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs uppercase tracking-[0.18em] text-slate-400">Grace</div><div className="mt-1 font-semibold text-slate-900">{selectedSchedule.graceMinutes} phút</div></div></div><div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-600">{selectedSchedule.note ?? 'Không có ghi chú cho ca này.'}</div><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><MapPin size={14} />{overview.profile.branchName ?? 'Head Office'}</div></div> : null}
              <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-coffee-50 p-4 ring-1 ring-coffee-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-600">Tháng hiện tại</div><div className="mt-1 text-2xl font-black text-slate-900">{summary.month}/{summary.year}</div></div><div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ca kế tiếp</div><div className="mt-1 text-2xl font-black text-slate-900">{upcomingSchedules[0] ? formatDate(upcomingSchedules[0].scheduleDate) : '—'}</div></div></div>
            </div>
          </Card>
        </div>
      </section>
      {loadError ? <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{loadError}</div> : null}
      {message ? <div className="rounded-3xl border border-coffee-200 bg-coffee-50 px-4 py-3 text-sm text-coffee-800">{message}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map((item) => <StatCard key={item.title} hint={item.hint} icon={item.icon} title={item.title} value={item.value} />)}</div>

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lịch làm</div><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Chọn ca của tôi</h2><p className="mt-2 text-sm leading-6 text-slate-500">Nhấn vào một ca để đổi nội dung đang theo dõi và đồng bộ sang khung chấm công.</p></div>
            <Badge tone="info">{dateFilteredSchedules.length} ca</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Ngày làm</span>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                type="date"
                value={scheduleDateFilter}
                onChange={(event) => setScheduleDateFilter(event.target.value)}
              />
            </label>
            <div className="flex items-end">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setScheduleDateFilter('')
                  setScheduleFilter('all')
                }}
              >
                Xem tất cả ngày
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {dateOptions.map((date) => (
              <button
                key={date}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  scheduleDateFilter === date ? 'bg-coffee-700 text-white shadow-sm shadow-coffee-900/10' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-coffee-50 hover:text-slate-900',
                ].join(' ')}
                type="button"
                onClick={() => setScheduleDateFilter(date)}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item.key} className={["rounded-full px-4 py-2 text-sm font-semibold transition", scheduleFilter === item.key ? 'bg-coffee-700 text-white shadow-sm shadow-coffee-900/10' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-coffee-50 hover:text-slate-900'].join(' ')} type="button" onClick={() => setScheduleFilter(item.key)}>{item.label}</button>)}</div>
          <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
            {selectedSchedule ? <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><div className="text-lg font-black text-slate-900">{selectedSchedule.shiftName}</div><Badge>{selectedStatus}</Badge></div><div className="text-sm text-slate-600">{formatDate(selectedSchedule.scheduleDate)} · {shiftLabel(selectedSchedule)}</div><div className="text-xs text-slate-500">{selectedSchedule.note ?? 'Không có ghi chú.'}</div></div><div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2"><div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Check-in</div><div className="mt-1 font-semibold text-slate-900">{formatDateTime(selectedSchedule.checkInAt)}</div></div><div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Check-out</div><div className="mt-1 font-semibold text-slate-900">{formatDateTime(selectedSchedule.checkOutAt)}</div></div></div></div> : <div className="text-sm text-slate-500">Hãy chọn một ca để xem chi tiết.</div>}
          </div>
          <div className="mt-5 space-y-3">
            {dateFilteredSchedules.length > 0 ? dateFilteredSchedules.map((schedule) => {
              const active = schedule.id === selectedSchedule?.id
              const statusLabel = schedule.attendanceStatus ? formatAttendanceStatus(schedule.attendanceStatus as 1 | 2 | 3 | 4 | 5 | 6) : 'Chờ chấm công'
              return <button key={schedule.id} className={["w-full rounded-3xl border p-4 text-left transition", active ? 'border-coffee-300 bg-coffee-50 shadow-sm shadow-coffee-900/5' : 'border-slate-200 bg-white hover:border-coffee-200 hover:bg-slate-50'].join(' ')} type="button" onClick={() => { setSelectedScheduleId(schedule.id); setAttendanceDate(schedule.scheduleDate.slice(0, 10)); setScheduleDateFilter(schedule.scheduleDate.slice(0, 10)) }}><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><div className="text-base font-black text-slate-900">{schedule.shiftName}</div><Badge>{statusLabel}</Badge></div><div className="text-sm text-slate-600">{formatDate(schedule.scheduleDate)} · {shiftLabel(schedule)}</div><div className="text-xs text-slate-500">{schedule.note ?? 'Không có ghi chú'}</div></div><div className="flex items-center gap-2 text-sm text-slate-500"><MapPin size={15} />{overview.profile.branchName ?? 'Head Office'}</div></div><div className="mt-3 flex items-center justify-between"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{schedule.attendanceStatus ? 'Đã ghi nhận' : 'Có thể check-in'}</div><ArrowRight size={16} className={active ? 'text-coffee-700' : 'text-slate-400'} /></div></button>
            }) : <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">Không có ca phù hợp với ngày và bộ lọc hiện tại.</div>}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center gap-2"><PlayCircle className="text-coffee-700" size={18} /><div><h2 className="text-lg font-black text-slate-900">Chấm công nhanh</h2><p className="text-sm text-slate-500">Ghi nhận check-in/check-out trên ca đang chọn.</p></div></div>
            <div className="grid gap-3 sm:grid-cols-2"><div><label className="text-sm font-semibold text-slate-700">Ngày làm</label><input className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100" type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} /></div><div><label className="text-sm font-semibold text-slate-700">Ghi chú</label><input className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100" placeholder="Ví dụ: vào ca sớm 5 phút" value={attendanceNote} onChange={(event) => setAttendanceNote(event.target.value)} /></div></div>
            <div className="mt-4 flex flex-wrap gap-2"><Button disabled={!canAttendance || attendanceLoading} onClick={() => void handleCheckIn()}>{attendanceLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}Check-in</Button><Button disabled={!canAttendance || attendanceLoading} variant="secondary" onClick={() => void handleCheckOut()}><TimerReset size={16} />Check-out</Button></div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{canAttendance ? 'Chọn đúng ngày làm việc rồi ghi chú nếu cần. Hệ thống sẽ gửi dữ liệu trực tiếp về backend self-service.' : 'Tài khoản hiện tại chưa có quyền tự chấm công. Khối này vẫn hiển thị để giữ đồng bộ với nghiệp vụ backend.'}</div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2"><ShieldCheck className="text-coffee-700" size={18} /><div><h2 className="text-lg font-black text-slate-900">Hồ sơ và quyền</h2><p className="text-sm text-slate-500">Thông tin tài khoản đang đăng nhập.</p></div></div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Họ tên</div><div className="mt-1 text-lg font-black text-slate-900">{overview.profile.fullName}</div><div className="mt-1 text-sm text-slate-600">{overview.profile.username} · {overview.profile.employeeCode}</div></div>
              <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Chi nhánh</div><div className="mt-1 font-semibold text-slate-900">{overview.profile.branchName ?? 'Head Office'}</div></div><div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Chức vụ</div><div className="mt-1 font-semibold text-slate-900">{overview.profile.roleName ?? 'Chưa có chức vụ'}</div></div></div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quyền hiện có</div><div className="mt-3 flex flex-wrap gap-2">{permissions.length > 0 ? permissions.map((permission) => <Badge key={permission} tone={permission.startsWith('self.') ? 'success' : 'info'}>{permission}</Badge>) : <span className="text-sm text-slate-500">Chưa có quyền nào.</span>}</div></div>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Payroll</div><h2 className="text-2xl font-black tracking-tight text-slate-900">Lương gần nhất</h2><p className="text-sm text-slate-500">Các kỳ lương cá nhân được trả về từ backend self-service.</p></div><Badge tone="info">{payrolls.length} kỳ</Badge></div>
        {canPayroll ? <div className="space-y-5"><div className="grid gap-3 md:grid-cols-3"><div className="rounded-3xl bg-coffee-50 p-4 ring-1 ring-coffee-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-600">Kỳ gần nhất</div><div className="mt-1 text-2xl font-black text-slate-900">{latestPayroll ? `${latestPayroll.payrollMonth}/${latestPayroll.payrollYear}` : '—'}</div></div><div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tổng lương</div><div className="mt-1 text-2xl font-black text-slate-900">{latestPayroll ? formatCurrency(latestPayroll.totalSalary) : '—'}</div></div><div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Trạng thái</div><div className="mt-2">{latestPayroll ? <Badge>{formatPayrollStatus(latestPayroll.status)}</Badge> : <span className="text-sm text-slate-500">Chưa có dữ liệu</span>}</div></div></div>
          {payrolls.length > 0 ? <Table columns={[{ key: 'period', label: 'Kỳ', render: (row) => `${row.payrollMonth}/${row.payrollYear}` }, { key: 'amount', label: 'Tổng lương', render: (row) => formatCurrency(row.totalSalary) }, { key: 'status', label: 'Trạng thái', render: (row) => <Badge>{formatPayrollStatus(row.status)}</Badge> }, { key: 'closed', label: 'Khóa kỳ', render: (row) => (row.isClosed ? 'Có' : 'Không') }, { key: 'approvedAt', label: 'Duyệt', render: (row) => formatDateTime(row.approvedAt) }, { key: 'paidDate', label: 'Chi trả', render: (row) => formatDateTime(row.paidDate) }]} emptyText="Chưa có dữ liệu lương." rowKey={(row) => row.id} rows={payrolls} /> : <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">Chưa có payroll cá nhân để hiển thị.</div>}
        </div> : <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">Tài khoản hiện tại chưa có quyền xem payroll cá nhân. Khối này sẽ tự mở khi backend cấp `self.payroll.view`.</div>}
      </Card>

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Thao tác nhanh</div>
            <h3 className="text-xl font-black tracking-tight text-slate-900">Tạo nghiệp vụ nhân viên</h3>
            <p className="text-sm text-slate-500">Mở các biểu mẫu tạo đơn ngay trên portal thay vì phải đi qua màn admin.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={!canLeave} onClick={openLeaveModal}>
              <CalendarOff size={16} />
              Tạo đơn nghỉ phép
            </Button>
            <Button disabled={!canSwap} variant="secondary" onClick={openSwapModal}>
              <RefreshCcw size={16} />
              Tạo đổi ca
            </Button>
            <Button disabled={!canAdjust} variant="secondary" onClick={openAdjustModal}>
              <Medal size={16} />
              Tạo điều chỉnh công
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workflow</div><h3 className="text-lg font-black text-slate-900">Nghỉ phép</h3><p className="mt-1 text-sm leading-6 text-slate-500">Luồng tạo, duyệt và theo dõi đơn nghỉ phép.</p></div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white"><CalendarOff size={18} /></div></div>
          <div className="mt-4 flex items-center gap-2"><Badge tone={canLeave ? 'success' : 'neutral'}>{canLeave ? 'Đã mở' : 'Khóa theo quyền'}</Badge><Badge tone="info">leave.manage</Badge></div>
          <div className="mt-4 space-y-3">{canLeave ? (ownLeaves.length > 0 ? ownLeaves.slice(0, 2).map((row) => <div key={row.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-slate-900">{row.employee?.fullName ?? `NV #${row.employeeId}`}</div><div className="text-xs text-slate-500">{formatDate(row.startDate)} - {formatDate(row.endDate)} · {row.leaveType}</div></div><Badge>{formatLeaveRequestStatus(row.status)}</Badge></div><div className="mt-2 text-sm text-slate-600">{row.reason ?? 'Không có lý do.'}</div><div className="mt-3 flex gap-2">{row.status === 1 ? <Button disabled={formBusy} variant="secondary" onClick={() => void cancelLeaveRequest(row.id)}>Hủy đơn</Button> : null}</div></div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">Chưa có đơn nghỉ phép phù hợp.</div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">Module nghỉ phép đã có trong backend. Tài khoản hiện tại chưa có quyền `leave.manage`, nên portal chỉ hiển thị khung nghiệp vụ.</div>}</div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workflow</div><h3 className="text-lg font-black text-slate-900">Đổi ca</h3><p className="mt-1 text-sm leading-6 text-slate-500">Luồng đề xuất đổi ca giữa hai nhân viên.</p></div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coffee-700 text-white"><RefreshCcw size={18} /></div></div>
          <div className="mt-4 flex items-center gap-2"><Badge tone={canSwap ? 'success' : 'neutral'}>{canSwap ? 'Đã mở' : 'Khóa theo quyền'}</Badge><Badge tone="info">shift.swap.manage</Badge></div>
          <div className="mt-4 space-y-3">{canSwap ? (ownSwaps.length > 0 ? ownSwaps.slice(0, 2).map((row) => <div key={row.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-slate-900">{row.requestEmployee?.fullName ?? `NV #${row.requestEmployeeId}`} ↔ {row.targetEmployee?.fullName ?? `NV #${row.targetEmployeeId}`}</div><div className="text-xs text-slate-500">{formatDate(row.requestSchedule?.scheduleDate)} · {row.requestSchedule?.shift?.shiftName ?? 'Ca yêu cầu'}</div></div><Badge>{formatShiftSwapStatus(row.status)}</Badge></div><div className="mt-2 text-sm text-slate-600">{row.reason ?? 'Không có lý do.'}</div><div className="mt-3 flex gap-2">{row.status === 1 ? <Button disabled={formBusy} variant="secondary" onClick={() => void cancelSwapRequest(row.id)}>Hủy yêu cầu</Button> : null}</div></div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">Chưa có yêu cầu đổi ca phù hợp.</div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">Module đổi ca đã sẵn sàng trong backend. Khi tài khoản có `shift.swap.manage`, khối này sẽ mở ngay trong portal.</div>}</div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workflow</div><h3 className="text-lg font-black text-slate-900">Điều chỉnh công</h3><p className="mt-1 text-sm leading-6 text-slate-500">Luồng đề xuất điều chỉnh check-in/check-out hoặc trạng thái công.</p></div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white"><Medal size={18} /></div></div>
          <div className="mt-4 flex items-center gap-2"><Badge tone={canAdjust ? 'success' : 'neutral'}>{canAdjust ? 'Đã mở' : 'Khóa theo quyền'}</Badge><Badge tone="info">attendance.adjust.manage</Badge></div>
          <div className="mt-4 space-y-3">{canAdjust ? (ownAdjustments.length > 0 ? ownAdjustments.slice(0, 2).map((row) => <div key={row.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-slate-900">{row.employee?.fullName ?? `NV #${row.employeeId}`}</div><div className="text-xs text-slate-500">Check-in: {formatDateTime(row.requestedCheckInAt)} · Check-out: {formatDateTime(row.requestedCheckOutAt)}</div></div><Badge>{formatAttendanceAdjustmentStatus(row.status)}</Badge></div><div className="mt-2 text-sm text-slate-600">{row.reason ?? 'Không có lý do.'}</div><div className="mt-3 flex gap-2">{row.status === 1 ? <Button disabled={formBusy} variant="secondary" onClick={() => void cancelAdjustmentRequest(row.id)}>Hủy yêu cầu</Button> : null}</div></div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">Chưa có yêu cầu điều chỉnh công phù hợp.</div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">Module điều chỉnh công đã có sẵn trong backend. Tài khoản hiện tại chưa có quyền `attendance.adjust.manage`, nên portal chỉ hiển thị khung nghiệp vụ.</div>}</div>
        </Card>
      </div>

      <Modal open={workflowModal === 'leave'} title="Tạo đơn nghỉ phép" onClose={() => setWorkflowModal(null)}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Ngày bắt đầu</span>
              <input className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" type="date" value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Ngày kết thúc</span>
              <input className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" type="date" value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-coffee-900">Loại nghỉ</span>
            <input className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-coffee-900">Lý do</span>
            <textarea className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" rows={4} value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setWorkflowModal(null)}>Hủy</Button>
            <Button disabled={formBusy} type="button" onClick={() => void submitLeaveRequest()}>{formBusy ? 'Đang gửi...' : 'Gửi đơn'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={workflowModal === 'swap'} title="Tạo yêu cầu đổi ca" onClose={() => setWorkflowModal(null)}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Ca của tôi</span>
              <select className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" value={swapRequestScheduleId} onChange={(e) => setSwapRequestScheduleId(e.target.value)}>
                <option value="">Chọn ca của tôi</option>
                {schedules.map((item) => <option key={item.id} value={item.id}>{item.shiftName} - {formatDate(item.scheduleDate)}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Nhân viên đổi cùng</span>
              <select className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" value={swapTargetEmployeeId} onChange={(e) => setSwapTargetEmployeeId(e.target.value)}>
                <option value="">Chọn nhân viên</option>
                {employeeOptions.filter((option) => option.value !== String(overview.profile.employeeId)).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Ca của người đổi</span>
              <select className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" value={swapTargetScheduleId} onChange={(e) => setSwapTargetScheduleId(e.target.value)}>
                <option value="">Chọn ca đích</option>
                {swapTargetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Lý do</span>
              <input className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" value={swapReason} onChange={(e) => setSwapReason(e.target.value)} />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setWorkflowModal(null)}>Hủy</Button>
            <Button disabled={formBusy} type="button" onClick={() => void submitSwapRequest()}>{formBusy ? 'Đang gửi...' : 'Gửi yêu cầu'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={workflowModal === 'adjust'} title="Tạo điều chỉnh công" onClose={() => setWorkflowModal(null)}>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-coffee-900">Bản ghi công</span>
            <select className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" value={adjustAttendanceId} onChange={(e) => setAdjustAttendanceId(e.target.value)}>
              <option value="">Chọn bản ghi công</option>
              {schedules
                .filter((item): item is SelfPortalSchedule & { attendanceId: number } => item.attendanceId != null)
                .map((item) => (
                  <option key={item.attendanceId} value={String(item.attendanceId)}>
                    {item.shiftName} - {formatDate(item.scheduleDate)}
                  </option>
                ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Check-in đề nghị</span>
              <input className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" type="datetime-local" value={adjustRequestedCheckInAt} onChange={(e) => setAdjustRequestedCheckInAt(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Check-out đề nghị</span>
              <input className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" type="datetime-local" value={adjustRequestedCheckOutAt} onChange={(e) => setAdjustRequestedCheckOutAt(e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-coffee-900">Trạng thái đề nghị</span>
            <select className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" value={adjustRequestedStatus} onChange={(e) => setAdjustRequestedStatus(e.target.value)}>
              <option value="">Giữ nguyên</option>
              <option value="2">Đúng giờ</option>
              <option value="3">Đi muộn</option>
              <option value="4">Về sớm</option>
              <option value="5">Tăng ca</option>
              <option value="6">Vắng mặt</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-coffee-900">Lý do</span>
            <textarea className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm" rows={4} value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setWorkflowModal(null)}>Hủy</Button>
            <Button disabled={formBusy} type="button" onClick={() => void submitAdjustmentRequest()}>{formBusy ? 'Đang gửi...' : 'Gửi yêu cầu'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
