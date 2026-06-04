import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Loader2, Search } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { Attendance, OptionItem } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table } from '../components/ui/Table'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { formatAttendanceStatus, formatDate, formatDateTime, toDateOnlyPayload } from '../utils/format'

export function AttendancePage() {
  const [items, setItems] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [attendanceDate, setAttendanceDate] = useState('')
  const [note, setNote] = useState('')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [employeeOptions, attendances] = await Promise.all([
        api.options.employeeOptions(),
        employeeFilter ? api.attendance.byEmployee(Number(employeeFilter)) : api.attendance.list(),
      ])
      setEmployees(employeeOptions)
      setItems(attendances)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải chấm công.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [employeeFilter])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesDate = !dateFilter || item.attendanceDate.startsWith(dateFilter)
      const matchesSearch =
        !search.trim() ||
        [item.employee?.fullName ?? '', item.employee?.employeeCode ?? '', item.note ?? '', formatAttendanceStatus(item.status)]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      return matchesDate && matchesSearch
    })
  }, [items, dateFilter, search])

  async function checkIn() {
    if (!employeeId) return setActionMessage('Vui lòng chọn nhân viên.')
    setActionLoading(true)
    setActionMessage(null)
    try {
      await api.attendance.checkIn({
        employeeId: Number(employeeId),
        attendanceDate: attendanceDate ? toDateOnlyPayload(attendanceDate) : null,
        note: note || null,
      })
      setActionMessage('Đã chấm công vào.')
      await load()
    } catch (error_) {
      setActionMessage(error_ instanceof Error ? error_.message : 'Không thể chấm công vào.')
    } finally {
      setActionLoading(false)
    }
  }

  async function checkOut() {
    if (!employeeId) return setActionMessage('Vui lòng chọn nhân viên.')
    setActionLoading(true)
    setActionMessage(null)
    try {
      await api.attendance.checkOut({
        employeeId: Number(employeeId),
        attendanceDate: attendanceDate ? toDateOnlyPayload(attendanceDate) : null,
      })
      setActionMessage('Đã chấm công ra.')
      await load()
    } catch (error_) {
      setActionMessage(error_ instanceof Error ? error_.message : 'Không thể chấm công ra.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <LoadingView label="Đang tải dữ liệu chấm công..." />
  if (error) return <ErrorView message={error} />

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Chấm công</h2>
            <p className="text-sm text-stone-600">Theo dõi check-in, check-out, đi muộn, về sớm và tăng ca.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                className="w-full rounded-2xl border border-coffee-200 bg-white/90 py-2.5 pl-10 pr-4 text-sm outline-none"
                value={search}
                placeholder="Tìm kiếm..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="">Tất cả nhân viên</option>
              {employees.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            <Button variant="secondary" onClick={() => { setEmployeeFilter(''); setDateFilter(''); setSearch(''); }}>
              Đặt lại
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-coffee-900">
          <ClipboardCheck size={18} />
          <h3 className="text-lg font-bold">Thao tác chấm công</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <select className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Chọn nhân viên</option>
            {employees.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
          <input className="md:col-span-2 rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" placeholder="Ghi chú khi check-in" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button disabled={actionLoading} onClick={checkIn}>
            {actionLoading ? <Loader2 className="animate-spin" size={16} /> : null}
            Check-in
          </Button>
          <Button disabled={actionLoading} variant="secondary" onClick={checkOut}>
            Check-out
          </Button>
          {actionMessage ? <span className="self-center text-sm text-coffee-700">{actionMessage}</span> : null}
        </div>
      </Card>

      {filtered.length > 0 ? (
        <Table
          columns={[
            { key: 'employee', label: 'Nhân viên', render: (row) => row.employee?.fullName ?? `NV #${row.employeeId}` },
            { key: 'date', label: 'Ngày', render: (row) => formatDate(row.attendanceDate) },
            { key: 'checkInAt', label: 'Check-in', render: (row) => formatDateTime(row.checkInAt) },
            { key: 'checkOutAt', label: 'Check-out', render: (row) => formatDateTime(row.checkOutAt) },
            { key: 'late', label: 'Đi muộn', render: (row) => `${row.lateMinutes} phút` },
            { key: 'early', label: 'Về sớm', render: (row) => `${row.earlyLeaveMinutes} phút` },
            { key: 'ot', label: 'Tăng ca', render: (row) => `${row.overtimeMinutes} phút` },
            { key: 'status', label: 'Trạng thái', render: (row) => <Badge>{formatAttendanceStatus(row.status)}</Badge> },
          ]}
          rowKey={(row) => row.id}
          rows={filtered}
        />
      ) : (
        <EmptyView message="Chưa có bản ghi chấm công phù hợp." />
      )}
    </div>
  )
}
