import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, CalendarRange, CheckCircle2, ChevronLeft, ChevronRight, Search, Store } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { OptionItem, Schedule, Employee } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { FormField, type FieldConfig, type FormValue } from '../components/ui/FormFields'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { buildPayloadFromFields, getInitialFormValues, validateRequiredFields } from '../utils/form'

type FormState = Record<string, FormValue>

const fields: FieldConfig[] = [
  {
    name: 'employeeId',
    label: 'Nhân viên',
    type: 'select',
    required: true,
    options: (lookups) => lookups.employees ?? [],
  },
  {
    name: 'shiftId',
    label: 'Ca làm',
    type: 'select',
    required: true,
    options: (lookups) => lookups.shifts ?? [],
  },
  { name: 'scheduleDate', label: 'Ngày làm', type: 'date', required: true },
  { name: 'note', label: 'Ghi chú', type: 'textarea', nullable: true, rows: 3 },
]

const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function dateKey(value: string) {
  return value.slice(0, 10)
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date)
}

function dayIsToday(key: string) {
  return key === toDateKey(new Date())
}

function chipTone(seed: number) {
  const tones = ['success', 'warning', 'info', 'neutral', 'danger'] as const
  return tones[seed % tones.length]
}

function formatBranchName(branchId?: number | null, branchLookup?: Map<number, { id: number; branchName: string }>) {
  if (!branchId || !branchLookup) return 'Chưa rõ chi nhánh'
  return branchLookup.get(branchId)?.branchName ?? `Chi nhánh #${branchId}`
}

export function SchedulesPage() {
  const [items, setItems] = useState<Schedule[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterShift, setFilterShift] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [search, setSearch] = useState('')
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()))
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [formState, setFormState] = useState<FormState>(getInitialFormValues(fields))
  const [formError, setFormError] = useState<string | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [schedules, employeeRows, shiftOptions] = await Promise.all([
        api.schedules.list(),
        api.employees.list(),
        api.options.shiftOptions(),
      ])
      setItems(schedules)
      setEmployees(employeeRows)
      setShifts(shiftOptions)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải lịch làm.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const employeeLookup = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees])
  const branchLookup = useMemo(
    () =>
      new Map(
        employees
          .filter((employee) => employee.branch)
          .map((employee) => [employee.branch!.id, { id: employee.branch!.id, branchName: employee.branch!.branchName }]),
      ),
    [employees],
  )
  const branchOptions = useMemo(() => {
    const seen = new Map<number, { value: string; label: string }>()
    for (const employee of employees) {
      if (employee.branch) {
        seen.set(employee.branch.id, { value: String(employee.branch.id), label: employee.branch.branchName })
      }
    }
    return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label, 'vi'))
  }, [employees])

  const lookupMap = useMemo(() => ({ employees: employees.map((employee) => ({ value: String(employee.id), label: `${employee.employeeCode} - ${employee.fullName}` })), shifts }), [employees, shifts])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const employee = employeeLookup.get(item.employeeId)
      const matchesEmployee = !filterEmployee || String(item.employeeId) === filterEmployee
      const matchesShift = !filterShift || String(item.shiftId) === filterShift
      const matchesBranch = !filterBranch || String(employee?.branchId ?? '') === filterBranch
      const matchesSearch =
        !search.trim() ||
        [employee?.fullName ?? '', employee?.employeeCode ?? '', item.shift?.shiftName ?? '', item.note ?? '']
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      return matchesEmployee && matchesShift && matchesBranch && matchesSearch
    })
  }, [items, employeeLookup, filterEmployee, filterShift, filterBranch, search])

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>()
    for (const item of filtered) {
      const key = dateKey(item.scheduleDate)
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.shift?.startTime ?? '').localeCompare(b.shift?.startTime ?? ''))
    }
    return map
  }, [filtered])

  const calendarDays = useMemo(() => {
    const first = startOfMonth(currentMonth)
    const last = endOfMonth(currentMonth)
    const startWeekday = (first.getDay() + 6) % 7
    const totalDays = last.getDate()
    const cells: Array<{ key: string; date: Date; inMonth: boolean }> = []

    const previousMonth = addMonths(currentMonth, -1)
    const previousLastDay = endOfMonth(previousMonth).getDate()

    for (let i = startWeekday - 1; i >= 0; i -= 1) {
      const day = previousLastDay - i
      cells.push({
        key: `prev-${day}`,
        date: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), day),
        inMonth: false,
      })
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({
        key: `current-${day}`,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
        inMonth: true,
      })
    }

    const remainder = cells.length % 7
    const nextMonth = addMonths(currentMonth, 1)
    if (remainder !== 0) {
      for (let day = 1; day <= 7 - remainder; day += 1) {
        cells.push({
          key: `next-${day}`,
          date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day),
          inMonth: false,
        })
      }
    }

    return cells
  }, [currentMonth])

  const selectedSchedules = useMemo(() => schedulesByDate.get(selectedDate) ?? [], [schedulesByDate, selectedDate])

  const monthStats = useMemo(() => {
    const monthPrefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
    const monthItems = filtered.filter((item) => dateKey(item.scheduleDate).startsWith(monthPrefix))
    const activeDays = new Set(monthItems.map((item) => dateKey(item.scheduleDate))).size
    const branches = new Set(monthItems.map((item) => employeeLookup.get(item.employeeId)?.branchId).filter(Boolean) as number[])
    return {
      total: monthItems.length,
      activeDays,
      branchCount: branches.size,
    }
  }, [currentMonth, filtered, employeeLookup])

  const branchScheduleSummary = useMemo(() => {
    const summary = new Map<number, { branchId: number; branchName: string; total: number; employees: Set<number> }>()
    for (const schedule of filtered) {
      const employee = employeeLookup.get(schedule.employeeId)
      if (!employee?.branch) continue
      const current = summary.get(employee.branch.id) ?? {
        branchId: employee.branch.id,
        branchName: employee.branch.branchName,
        total: 0,
        employees: new Set<number>(),
      }
      current.total += 1
      current.employees.add(employee.id)
      summary.set(employee.branch.id, current)
    }
    return [...summary.values()].sort((a, b) => b.total - a.total)
  }, [filtered, employeeLookup])

  useEffect(() => {
    const monthPrefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
    const selectedInMonth = selectedDate.startsWith(monthPrefix)
    if (!selectedInMonth && calendarDays.length > 0) {
      const firstCurrent = calendarDays.find((cell) => cell.inMonth)
      if (firstCurrent) {
        setSelectedDate(toDateKey(firstCurrent.date))
      }
    }
  }, [calendarDays, currentMonth, selectedDate])

  function openCreate(prefillDate?: string) {
    setEditing(null)
    const nextForm = getInitialFormValues(fields)
    if (prefillDate) {
      nextForm.scheduleDate = prefillDate
    }
    setFormState(nextForm)
    setValidationMessage(null)
    setFormError(null)
    setOpen(true)
  }

  function openEdit(item: Schedule) {
    setEditing(item)
    setFormState(getInitialFormValues(fields, item as unknown as Record<string, unknown>))
    setValidationMessage(null)
    setFormError(null)
    setOpen(true)
  }

  function onChange(name: string, value: FormValue) {
    setFormState((current) => ({ ...current, [name]: value }))
  }

  async function validateSchedule() {
    const validationError = validateRequiredFields(fields, formState)
    if (validationError) {
      setFormError(validationError)
      return
    }
    const payload = buildPayloadFromFields(fields, formState) as {
      employeeId: number
      shiftId: number
      scheduleDate: string
      note?: string | null
    }
    const result = await api.schedules.validate(payload)
    setValidationMessage(result.message)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateRequiredFields(fields, formState)
    if (validationError) {
      setFormError(validationError)
      return
    }
    const payload = buildPayloadFromFields(fields, formState)
    setSaving(true)
    setFormError(null)
    try {
      const schedulePayload = payload as { employeeId: number; shiftId: number; scheduleDate: string; note?: string | null }
      const check = await api.schedules.validate(schedulePayload)
      if (!check.isValid) {
        setValidationMessage(check.message)
        setSaving(false)
        return
      }
      if (editing) {
        await api.schedules.update(editing.id, payload)
      } else {
        await api.schedules.create(payload)
      }
      setOpen(false)
      await load()
    } catch (error_) {
      setFormError(error_ instanceof Error ? error_.message : 'Không thể lưu lịch làm.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(item: Schedule) {
    if (!window.confirm('Xóa lịch làm này?')) return
    try {
      await api.schedules.remove(item.id)
      await load()
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể xóa lịch làm.')
    }
  }

  if (loading) return <LoadingView label="Đang tải lịch làm..." />
  if (error) return <ErrorView message={error} />

  const selectedKey = selectedDate
  const selectedLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${selectedKey}T00:00:00`))

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Lịch làm</h2>
            <p className="text-sm text-stone-600">Xem theo lịch tháng, đồng thời có thể lọc theo chi nhánh để xem ca của từng cửa hàng.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                className="w-full min-w-[260px] rounded-2xl border border-coffee-200 bg-white/90 py-2.5 pl-10 pr-4 text-sm outline-none"
                placeholder="Tìm theo nhân viên, ca, ghi chú..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button onClick={() => openCreate(selectedKey)}>
              <CalendarRange size={16} />
              Thêm lịch
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div className="rounded-3xl bg-coffee-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">Tháng hiện tại</p>
            <div className="mt-1 text-xl font-black text-coffee-900">{monthLabel(currentMonth)}</div>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" type="button" onClick={() => setCurrentMonth((current) => addMonths(current, -1))}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="secondary" type="button" onClick={() => setCurrentMonth(startOfMonth(new Date()))}>
                Hôm nay
              </Button>
              <Button variant="secondary" type="button" onClick={() => setCurrentMonth((current) => addMonths(current, 1))}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          <div className="rounded-3xl bg-white px-4 py-4 ring-1 ring-coffee-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Lịch trong tháng</p>
            <div className="mt-1 text-3xl font-black text-coffee-900">{monthStats.total}</div>
            <p className="mt-1 text-sm text-stone-500">Tổng số ca đã phân lịch</p>
          </div>
          <div className="rounded-3xl bg-white px-4 py-4 ring-1 ring-coffee-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Ngày có ca</p>
            <div className="mt-1 text-3xl font-black text-coffee-900">{monthStats.activeDays}</div>
            <p className="mt-1 text-sm text-stone-500">Số ngày thực sự có lịch</p>
          </div>
          <div className="rounded-3xl bg-white px-4 py-4 ring-1 ring-coffee-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Chi nhánh có lịch</p>
            <div className="mt-1 text-3xl font-black text-coffee-900">{monthStats.branchCount}</div>
            <p className="mt-1 text-sm text-stone-500">Tính theo lịch trong tháng</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="">Tất cả chi nhánh</option>
            {branchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm"
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
          >
            <option value="">Tất cả nhân viên</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employeeCode} - {employee.fullName}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm"
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
          >
            <option value="">Tất cả ca</option>
            {shifts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => {
              setFilterBranch('')
              setFilterEmployee('')
              setFilterShift('')
              setSearch('')
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
            {dayLabels.map((label) => (
              <div key={label} className="px-1 py-2">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell) => {
              const key = toDateKey(cell.date)
              const schedules = schedulesByDate.get(key) ?? []
              const isSelected = key === selectedDate
              const isToday = dayIsToday(key)

              return (
                <button
                  key={cell.key}
                  className={[
                    'min-h-[150px] rounded-3xl border p-3 text-left transition',
                    cell.inMonth ? 'bg-white hover:border-coffee-300 hover:shadow-md' : 'bg-stone-50 text-stone-400',
                    isSelected ? 'border-coffee-600 ring-2 ring-coffee-200' : 'border-coffee-100',
                  ].join(' ')}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={['text-xl font-black', isToday ? 'text-coffee-700' : cell.inMonth ? 'text-coffee-900' : 'text-stone-400'].join(' ')}>
                      {cell.date.getDate()}
                    </div>
                    <div className="flex items-center gap-2">
                      {isToday ? <Badge tone="info">Hôm nay</Badge> : null}
                      {schedules.length > 0 ? <span className="rounded-full bg-coffee-100 px-2 py-0.5 text-xs font-bold text-coffee-700">{schedules.length}</span> : null}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {schedules.slice(0, 3).map((schedule) => {
                      const employee = employeeLookup.get(schedule.employeeId)
                      return (
                        <div
                          key={schedule.id}
                          className="rounded-2xl border border-coffee-100 bg-coffee-50 px-2.5 py-2 text-xs shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-coffee-900">
                              {schedule.shift?.shiftCode ?? `Ca #${schedule.shiftId}`}
                            </span>
                            <Badge tone={chipTone(schedule.shiftId)}>Ca</Badge>
                          </div>
                          <div className="mt-1 line-clamp-1 text-[11px] text-stone-600">
                            {employee?.fullName ?? `NV #${schedule.employeeId}`}
                          </div>
                          <div className="mt-1 line-clamp-1 text-[11px] font-semibold text-coffee-600">
                            {formatBranchName(employee?.branchId ?? null, branchLookup)}
                          </div>
                        </div>
                      )
                    })}
                    {schedules.length > 3 ? <div className="text-xs font-semibold text-coffee-600">+ {schedules.length - 3} ca nữa</div> : null}
                    {schedules.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-coffee-100 px-2.5 py-5 text-center text-xs text-stone-400">
                        Trống
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Ngày đang chọn</p>
                <h3 className="mt-1 text-lg font-black text-coffee-900">{selectedLabel}</h3>
              </div>
              <Button variant="secondary" onClick={() => openCreate(selectedKey)}>
                Thêm ca
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedSchedules.length > 0 ? (
                selectedSchedules.map((schedule, index) => {
                  const employee = employeeLookup.get(schedule.employeeId)
                  return (
                    <div key={schedule.id} className="rounded-3xl border border-coffee-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-coffee-900">
                            {schedule.shift?.shiftName ?? `Ca #${schedule.shiftId}`}
                          </div>
                          <div className="mt-1 text-sm text-stone-600">
                            {employee?.fullName ?? `NV #${schedule.employeeId}`}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-coffee-600">
                            {formatBranchName(employee?.branchId ?? null, branchLookup)}
                          </div>
                        </div>
                        <Badge tone={chipTone(index + schedule.shiftId)}>{schedule.shift?.shiftCode ?? 'Ca làm'}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-coffee-50 px-3 py-2">
                          <div className="text-xs text-stone-500">Khung giờ</div>
                          <div className="font-semibold text-coffee-900">
                            {schedule.shift?.startTime?.slice(0, 5) ?? '00:00'} - {schedule.shift?.endTime?.slice(0, 5) ?? '00:00'}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-coffee-50 px-3 py-2">
                          <div className="text-xs text-stone-500">Ghi chú</div>
                          <div className="truncate font-semibold text-coffee-900">{schedule.note ?? '—'}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="secondary" onClick={() => openEdit(schedule)}>
                          Sửa
                        </Button>
                        <Button variant="danger" onClick={() => remove(schedule)}>
                          Xóa
                        </Button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <EmptyView message="Ngày này chưa có ca làm nào." />
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Store size={18} className="text-coffee-700" />
              <h3 className="text-lg font-bold text-coffee-900">Lịch theo chi nhánh</h3>
            </div>
            <div className="mt-3 space-y-3">
              {branchScheduleSummary.length > 0 ? (
                branchScheduleSummary.map((branch) => (
                  <button
                    key={branch.branchId}
                    type="button"
                    className="flex w-full items-center justify-between rounded-3xl border border-coffee-100 bg-coffee-50 px-4 py-3 text-left transition hover:border-coffee-300"
                    onClick={() => setFilterBranch(String(branch.branchId))}
                  >
                    <div>
                      <div className="font-bold text-coffee-900">{branch.branchName}</div>
                      <div className="text-xs text-stone-500">{branch.employees.size} nhân viên có ca trong tháng</div>
                    </div>
                    <Badge tone="info">{branch.total} ca</Badge>
                  </button>
                ))
              ) : (
                <EmptyView message="Chưa có dữ liệu lịch theo chi nhánh." />
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-coffee-700" />
              <h3 className="text-lg font-bold text-coffee-900">Mẹo xem lịch</h3>
            </div>
            <div className="mt-3 space-y-2 text-sm text-stone-600">
              <p>• Mỗi ô là một ngày, trong ô sẽ hiện các ca đã phân lịch.</p>
              <p>• Click vào một ngày để xem chi tiết theo ngày ở cột bên phải.</p>
              <p>• Dùng bộ lọc chi nhánh để xem riêng lịch của từng cửa hàng.</p>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={open} title={editing ? 'Cập nhật lịch làm' : 'Thêm lịch làm'} onClose={() => setOpen(false)}>
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <FormField key={field.name} field={field} lookups={lookupMap} value={formState[field.name] ?? ''} onChange={onChange} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={validateSchedule}>
                <CheckCircle2 size={16} />
                Kiểm tra lịch
              </Button>
              {validationMessage ? <span className="text-sm text-coffee-700">{validationMessage}</span> : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button disabled={saving} type="submit">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
          {formError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p> : null}
        </form>
      </Modal>
    </div>
  )
}
