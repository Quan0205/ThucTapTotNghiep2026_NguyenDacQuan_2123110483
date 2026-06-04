import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { PenSquare } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { AttendanceAdjustment, OptionItem } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { FormField, type FieldConfig, type FormValue } from '../components/ui/FormFields'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { buildPayloadFromFields, getInitialFormValues, validateRequiredFields } from '../utils/form'
import { formatAttendanceAdjustmentStatus, formatDateTime } from '../utils/format'

type FormState = Record<string, FormValue>

const fields: FieldConfig[] = [
  { name: 'attendanceId', label: 'Bản ghi công', type: 'select', required: true, options: (lookups) => lookups.attendance ?? [] },
  { name: 'employeeId', label: 'Nhân viên', type: 'select', required: true, options: (lookups) => lookups.employees ?? [] },
  { name: 'requestedCheckInAt', label: 'Check-in đề nghị', type: 'datetime-local', nullable: true },
  { name: 'requestedCheckOutAt', label: 'Check-out đề nghị', type: 'datetime-local', nullable: true },
  { name: 'requestedStatus', label: 'Trạng thái đề nghị', type: 'select', nullable: true, options: [{ value: '', label: 'Giữ nguyên' }, { value: '2', label: 'Đúng giờ' }, { value: '3', label: 'Đi muộn' }, { value: '4', label: 'Về sớm' }, { value: '5', label: 'Tăng ca' }, { value: '6', label: 'Vắng mặt' }] },
  { name: 'reason', label: 'Lý do', type: 'textarea', nullable: true, rows: 3 },
]

export function AttendanceAdjustmentsPage() {
  const [items, setItems] = useState<AttendanceAdjustment[]>([])
  const [employees, setEmployees] = useState<OptionItem[]>([])
  const [attendance, setAttendance] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [formState, setFormState] = useState<FormState>(getInitialFormValues(fields))
  const [formError, setFormError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [rows, employeeOptions, attendanceRows] = await Promise.all([api.attendanceAdjustments.list(), api.options.employeeOptions(), api.attendance.list()])
      setItems(rows)
      setEmployees(employeeOptions)
      setAttendance(attendanceRows.map((row) => ({ value: String(row.id), label: `${row.employee?.fullName ?? `NV #${row.employeeId}`} - ${row.attendanceDate}` })))
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải điều chỉnh công.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])
  const lookups = useMemo(() => ({ employees, attendance }), [employees, attendance])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const validationError = validateRequiredFields(fields, formState)
    if (validationError) return setFormError(validationError)
    try {
      await api.attendanceAdjustments.create(buildPayloadFromFields(fields, formState) as any)
      setOpen(false)
      setFormState(getInitialFormValues(fields))
      await load()
    } catch (error_) {
      setFormError(error_ instanceof Error ? error_.message : 'Không thể tạo điều chỉnh công.')
    }
  }

  if (loading) return <LoadingView label="Đang tải điều chỉnh chấm công..." />
  if (error) return <ErrorView message={error} />

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Điều chỉnh công</h2>
            <p className="text-sm text-stone-600">Yêu cầu và duyệt điều chỉnh check-in/check-out hoặc trạng thái công.</p>
          </div>
          <Button onClick={() => setOpen(true)}><PenSquare size={16} />Tạo yêu cầu</Button>
        </div>
      </Card>
      {items.length > 0 ? (
        <Table
          columns={[
            { key: 'employee', label: 'Nhân viên', render: (row) => row.employee?.fullName ?? `NV #${row.employeeId}` },
            { key: 'requestedCheckInAt', label: 'Check-in đề nghị', render: (row) => formatDateTime(row.requestedCheckInAt) },
            { key: 'requestedCheckOutAt', label: 'Check-out đề nghị', render: (row) => formatDateTime(row.requestedCheckOutAt) },
            { key: 'status', label: 'Trạng thái', render: (row) => formatAttendanceAdjustmentStatus(row.status) },
            {
              key: 'actions',
              label: 'Thao tác',
              render: (row) => (
                <div className="flex gap-2">
                  {row.status === 1 ? <Button onClick={() => void api.attendanceAdjustments.approve(row.id).then(load)}>Duyệt</Button> : null}
                  {row.status === 1 ? <Button variant="secondary" onClick={() => void api.attendanceAdjustments.reject(row.id).then(load)}>Từ chối</Button> : null}
                  {row.status === 1 ? <Button variant="danger" onClick={() => void api.attendanceAdjustments.cancel(row.id).then(load)}>Hủy</Button> : null}
                </div>
              ),
            },
          ]}
          rowKey={(row) => row.id}
          rows={items}
        />
      ) : <EmptyView message="Chưa có yêu cầu điều chỉnh công nào." />}

      <Modal open={open} title="Tạo yêu cầu điều chỉnh công" onClose={() => setOpen(false)}>
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
