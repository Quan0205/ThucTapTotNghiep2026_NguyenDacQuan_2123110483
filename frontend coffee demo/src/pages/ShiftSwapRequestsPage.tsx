import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { RefreshCcw } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { OptionItem, ShiftSwapRequest } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { FormField, type FieldConfig, type FormValue } from '../components/ui/FormFields'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { buildPayloadFromFields, getInitialFormValues, validateRequiredFields } from '../utils/form'
import { formatDate, formatShiftSwapStatus } from '../utils/format'

type FormState = Record<string, FormValue>

const fields: FieldConfig[] = [
  { name: 'requestEmployeeId', label: 'Nhân viên yêu cầu', type: 'select', required: true, options: (lookups) => lookups.employees ?? [] },
  { name: 'targetEmployeeId', label: 'Nhân viên đổi cùng', type: 'select', required: true, options: (lookups) => lookups.employees ?? [] },
  { name: 'requestScheduleId', label: 'Ca hiện tại', type: 'select', required: true, options: (lookups) => lookups.schedules ?? [] },
  { name: 'targetScheduleId', label: 'Ca đổi', type: 'select', required: true, options: (lookups) => lookups.schedules ?? [] },
  { name: 'reason', label: 'Lý do', type: 'textarea', nullable: true, rows: 3 },
]

export function ShiftSwapRequestsPage() {
  const [items, setItems] = useState<ShiftSwapRequest[]>([])
  const [employees, setEmployees] = useState<OptionItem[]>([])
  const [schedules, setSchedules] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [formState, setFormState] = useState<FormState>(getInitialFormValues(fields))
  const [formError, setFormError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [rows, employeeOptions, scheduleOptions] = await Promise.all([api.shiftSwaps.list(), api.options.employeeOptions(), api.options.scheduleOptions()])
      setItems(rows)
      setEmployees(employeeOptions)
      setSchedules(scheduleOptions)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải yêu cầu đổi ca.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])
  const lookups = useMemo(() => ({ employees, schedules }), [employees, schedules])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const validationError = validateRequiredFields(fields, formState)
    if (validationError) return setFormError(validationError)
    try {
      await api.shiftSwaps.create(buildPayloadFromFields(fields, formState) as any)
      setOpen(false)
      setFormState(getInitialFormValues(fields))
      await load()
    } catch (error_) {
      setFormError(error_ instanceof Error ? error_.message : 'Không thể tạo yêu cầu đổi ca.')
    }
  }

  if (loading) return <LoadingView label="Đang tải yêu cầu đổi ca..." />
  if (error) return <ErrorView message={error} />

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Đổi ca</h2>
            <p className="text-sm text-stone-600">Tạo và duyệt yêu cầu đổi ca giữa hai nhân viên.</p>
          </div>
          <Button onClick={() => setOpen(true)}><RefreshCcw size={16} />Tạo yêu cầu</Button>
        </div>
      </Card>
      {items.length > 0 ? (
        <Table
          columns={[
            { key: 'requestEmployee', label: 'Từ', render: (row) => row.requestEmployee?.fullName ?? `NV #${row.requestEmployeeId}` },
            { key: 'targetEmployee', label: 'Đến', render: (row) => row.targetEmployee?.fullName ?? `NV #${row.targetEmployeeId}` },
            { key: 'date', label: 'Ngày', render: (row) => formatDate(row.requestSchedule?.scheduleDate) },
            { key: 'status', label: 'Trạng thái', render: (row) => formatShiftSwapStatus(row.status) },
            {
              key: 'actions',
              label: 'Thao tác',
              render: (row) => (
                <div className="flex gap-2">
                  {row.status === 1 ? <Button onClick={() => void api.shiftSwaps.approve(row.id).then(load)}>Duyệt</Button> : null}
                  {row.status === 1 ? <Button variant="secondary" onClick={() => void api.shiftSwaps.reject(row.id).then(load)}>Từ chối</Button> : null}
                  {row.status === 1 ? <Button variant="danger" onClick={() => void api.shiftSwaps.cancel(row.id).then(load)}>Hủy</Button> : null}
                </div>
              ),
            },
          ]}
          rowKey={(row) => row.id}
          rows={items}
        />
      ) : <EmptyView message="Chưa có yêu cầu đổi ca nào." />}

      <Modal open={open} title="Tạo yêu cầu đổi ca" onClose={() => setOpen(false)}>
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
