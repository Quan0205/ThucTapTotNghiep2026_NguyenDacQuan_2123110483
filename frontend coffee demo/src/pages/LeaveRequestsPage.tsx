import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CalendarOff } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { LeaveRequest, OptionItem } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { FormField, type FieldConfig, type FormValue } from '../components/ui/FormFields'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { buildPayloadFromFields, getInitialFormValues, validateRequiredFields } from '../utils/form'
import { formatDate, formatLeaveRequestStatus } from '../utils/format'

type FormState = Record<string, FormValue>

const fields: FieldConfig[] = [
  { name: 'employeeId', label: 'Nhân viên', type: 'select', required: true, options: (lookups) => lookups.employees ?? [] },
  { name: 'startDate', label: 'Ngày bắt đầu', type: 'date', required: true },
  { name: 'endDate', label: 'Ngày kết thúc', type: 'date', required: true },
  { name: 'leaveType', label: 'Loại nghỉ', type: 'text', required: true },
  { name: 'reason', label: 'Lý do', type: 'textarea', nullable: true, rows: 3 },
]

export function LeaveRequestsPage() {
  const [items, setItems] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [formState, setFormState] = useState<FormState>(getInitialFormValues(fields))
  const [formError, setFormError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [rows, employeeOptions] = await Promise.all([api.leaveRequests.list(), api.options.employeeOptions()])
      setItems(rows)
      setEmployees(employeeOptions)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải đơn nghỉ phép.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])
  const lookups = useMemo(() => ({ employees }), [employees])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const validationError = validateRequiredFields(fields, formState)
    if (validationError) return setFormError(validationError)
    try {
      await api.leaveRequests.create(buildPayloadFromFields(fields, formState) as any)
      setOpen(false)
      setFormState(getInitialFormValues(fields))
      await load()
    } catch (error_) {
      setFormError(error_ instanceof Error ? error_.message : 'Không thể tạo đơn nghỉ phép.')
    }
  }

  if (loading) return <LoadingView label="Đang tải đơn nghỉ phép..." />
  if (error) return <ErrorView message={error} />

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Nghỉ phép</h2>
            <p className="text-sm text-stone-600">Tạo và duyệt đơn nghỉ phép.</p>
          </div>
          <Button onClick={() => setOpen(true)}><CalendarOff size={16} />Tạo đơn</Button>
        </div>
      </Card>
      {items.length > 0 ? (
        <Table
          columns={[
            { key: 'employee', label: 'Nhân viên', render: (row) => row.employee?.fullName ?? `NV #${row.employeeId}` },
            { key: 'date', label: 'Thời gian', render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}` },
            { key: 'leaveType', label: 'Loại nghỉ' },
            { key: 'totalDays', label: 'Số ngày' },
            { key: 'status', label: 'Trạng thái', render: (row) => formatLeaveRequestStatus(row.status) },
            {
              key: 'actions',
              label: 'Thao tác',
              render: (row) => (
                <div className="flex gap-2">
                  {row.status === 1 ? <Button onClick={() => void api.leaveRequests.approve(row.id).then(load)}>Duyệt</Button> : null}
                  {row.status === 1 ? <Button variant="secondary" onClick={() => void api.leaveRequests.reject(row.id).then(load)}>Từ chối</Button> : null}
                  {row.status === 1 ? <Button variant="danger" onClick={() => void api.leaveRequests.cancel(row.id).then(load)}>Hủy</Button> : null}
                </div>
              ),
            },
          ]}
          rowKey={(row) => row.id}
          rows={items}
        />
      ) : <EmptyView message="Chưa có đơn nghỉ phép nào." />}

      <Modal open={open} title="Tạo đơn nghỉ phép" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <FormField key={field.name} field={field} lookups={lookups} value={formState[field.name] ?? ''} onChange={(name, value) => setFormState((current) => ({ ...current, [name]: value }))} />
            ))}
          </div>
          {formError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
