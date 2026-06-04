import { useMemo } from 'react'
import { CalendarDays, Sparkles } from 'lucide-react'
import type { SelfShiftBoardSchedule } from '../../types/models'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { formatAttendanceStatus, formatDate, formatTimeInput } from '../../utils/format'

type Props = {
  schedules: SelfShiftBoardSchedule[]
  weekStart: Date
  selectedDate?: string
  onSelectSchedule?: (schedule: SelfShiftBoardSchedule) => void
}

type PeriodKey = 'morning' | 'afternoon' | 'evening'

type PeriodConfig = {
  key: PeriodKey
  label: string
  hint: string
}

const periods: PeriodConfig[] = [
  { key: 'morning', label: 'Sáng', hint: 'Ca đầu ngày' },
  { key: 'afternoon', label: 'Chiều', hint: 'Ca giữa ngày' },
  { key: 'evening', label: 'Tối', hint: 'Ca cuối ngày' },
]

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addDays(date: Date, days: number) {
  const clone = new Date(date)
  clone.setDate(clone.getDate() + days)
  clone.setHours(0, 0, 0, 0)
  return clone
}

function weekDays(start: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

function weekdayLabel(date: Date) {
  switch (date.getDay()) {
    case 1:
      return 'Thứ 2'
    case 2:
      return 'Thứ 3'
    case 3:
      return 'Thứ 4'
    case 4:
      return 'Thứ 5'
    case 5:
      return 'Thứ 6'
    case 6:
      return 'Thứ 7'
    default:
      return 'Chủ nhật'
  }
}

function getPeriodKey(schedule: SelfShiftBoardSchedule): PeriodKey {
  const start = formatTimeInput(schedule.startTime)
  const hour = Number(start.slice(0, 2))

  if (Number.isNaN(hour)) return 'morning'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function getStatusTone(status?: number | null) {
  switch (status) {
    case 2:
      return 'success'
    case 3:
    case 4:
      return 'warning'
    case 5:
      return 'info'
    case 6:
      return 'danger'
    default:
      return 'neutral'
  }
}

function getStatusLabel(schedule: SelfShiftBoardSchedule) {
  return schedule.attendanceStatus ? formatAttendanceStatus(schedule.attendanceStatus as 1 | 2 | 3 | 4 | 5 | 6) : 'Chưa chấm công'
}

function countMinutes(schedules: SelfShiftBoardSchedule[]) {
  return schedules.reduce((total, schedule) => {
    const start = formatTimeInput(schedule.startTime)
    const end = formatTimeInput(schedule.endTime)
    if (!start || !end) return total

    const [startHour, startMinute] = start.split(':').map(Number)
    const [endHour, endMinute] = end.split(':').map(Number)
    const startValue = startHour * 60 + startMinute
    const endValue = endHour * 60 + endMinute
    const minutes = endValue >= startValue ? endValue - startValue : endValue + 24 * 60 - startValue
    return total + minutes
  }, 0)
}

function groupSchedulesByDayAndPeriod(schedules: SelfShiftBoardSchedule[]) {
  const grouped = new Map<string, Record<PeriodKey, SelfShiftBoardSchedule[]>>()

  for (const schedule of [...schedules].sort((left, right) => {
    const leftKey = `${left.scheduleDate.slice(0, 10)}T${formatTimeInput(left.startTime)}`
    const rightKey = `${right.scheduleDate.slice(0, 10)}T${formatTimeInput(right.startTime)}`
    return leftKey.localeCompare(rightKey)
  })) {
    const dayKey = schedule.scheduleDate.slice(0, 10)
    const periodKey = getPeriodKey(schedule)
    const bucket = grouped.get(dayKey) ?? { morning: [], afternoon: [], evening: [] }
    bucket[periodKey].push(schedule)
    grouped.set(dayKey, bucket)
  }

  return grouped
}

function ScheduleChip({ schedule, onClick }: { schedule: SelfShiftBoardSchedule; onClick?: (schedule: SelfShiftBoardSchedule) => void }) {
  return (
    <button
      type="button"
      className="group w-full rounded-2xl border border-lime-500/20 bg-lime-400/95 p-3 text-left shadow-[0_8px_20px_rgba(132,204,22,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(132,204,22,0.24)]"
      onClick={() => onClick?.(schedule)}
    >
      <div className="space-y-1.5">
        <div className="text-sm font-black leading-5 text-slate-950">{schedule.shiftName}</div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-800/80">{schedule.shiftCode}</div>
        <div className="text-sm text-slate-950">
          Giờ: <span className="font-semibold text-emerald-950">{formatTimeInput(schedule.startTime)} - {formatTimeInput(schedule.endTime)}</span>
        </div>
        <div className="text-xs leading-5 text-slate-950/90">{schedule.note ?? 'Ca đã đăng ký.'}</div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge tone={getStatusTone(schedule.attendanceStatus)}>{getStatusLabel(schedule)}</Badge>
          {schedule.attendanceId ? <Badge tone="success">Có công</Badge> : <Badge tone="warning">Chờ công</Badge>}
        </div>
      </div>
    </button>
  )
}

export function EmployeeScheduleOverview({ schedules, weekStart, selectedDate, onSelectSchedule }: Props) {
  const days = useMemo(() => weekDays(weekStart), [weekStart])
  const grouped = useMemo(() => groupSchedulesByDayAndPeriod(schedules), [schedules])
  const completedCount = useMemo(() => schedules.filter((schedule) => schedule.attendanceStatus != null).length, [schedules])
  const totalMinutes = useMemo(() => countMinutes(schedules), [schedules])

  return (
    <section id="lich-lam-cua-toi" className="scroll-mt-6">
      <Card className="overflow-hidden border border-coffee-100/70 bg-[linear-gradient(135deg,#fffdf8_0%,#faf6ef_45%,#f2eadf_100%)] shadow-xl shadow-coffee-900/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-coffee-700 ring-1 ring-coffee-200">
              <Sparkles size={14} />
              Lịch làm của tôi
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Dạng thời khóa biểu</div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                Xem lịch làm theo tuần giống mẫu bảng thời khóa biểu
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Mỗi cột là một ngày trong tuần, mỗi hàng là một ca. Ô nào có lịch sẽ hiện thẻ xanh để bạn nhìn nhanh như bảng mẫu bạn gửi.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tổng ca</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{schedules.length}</div>
            </div>
            <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Đã có công</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{completedCount}</div>
            </div>
            <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tổng giờ</div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[1080px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[100px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50">
              <div className="border-r border-slate-200 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-sky-600">
                Ca học
              </div>
              {days.map((day) => {
                const key = toDateKey(day)
                const isSelected = selectedDate === key
                return (
                  <div
                    key={key}
                    className={[
                      'border-r border-slate-200 px-3 py-3 text-center',
                      isSelected ? 'bg-sky-50' : 'bg-slate-50',
                    ].join(' ')}
                  >
                    <div className="text-lg font-black text-sky-600">{weekdayLabel(day)}</div>
                    <div className="mt-1 text-lg font-black tracking-wide text-sky-600">{formatDate(key)}</div>
                  </div>
                )
              })}
            </div>

            {periods.map((period) => (
              <div key={period.key} className="grid min-h-[160px] grid-cols-[100px_repeat(7,minmax(0,1fr))] border-b border-slate-200 last:border-b-0">
                <div className="flex flex-col items-center justify-center border-r border-slate-200 bg-amber-50 px-3 py-4 text-center">
                  <div className="text-lg font-black text-slate-600">{period.label}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{period.hint}</div>
                </div>

                {days.map((day) => {
                  const dayKey = toDateKey(day)
                  const daySchedules = grouped.get(dayKey)?.[period.key] ?? []
                  const isSelected = selectedDate === dayKey

                  return (
                    <div
                      key={`${dayKey}-${period.key}`}
                      className={[
                        'border-r border-slate-200 p-2 last:border-r-0',
                        isSelected ? 'bg-sky-50/40' : 'bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(250,250,249,1)_100%)]',
                      ].join(' ')}
                    >
                      <div className="flex h-full flex-col gap-2">
                        {daySchedules.length > 0 ? (
                          daySchedules.map((schedule) => <ScheduleChip key={schedule.scheduleId} schedule={schedule} onClick={onSelectSchedule} />)
                        ) : (
                          <div className="flex min-h-[136px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                            Trống
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <CalendarDays size={14} className="text-sky-500" />
          Ô xanh là ca đã đăng ký. Bấm vào ô để nhảy sang ngày tương ứng và dùng cho check-in / check-out.
        </div>
      </Card>
    </section>
  )
}
