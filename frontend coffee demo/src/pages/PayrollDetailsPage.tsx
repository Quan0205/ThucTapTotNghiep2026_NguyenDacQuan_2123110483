import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Search } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { OptionItem, Payroll, PayrollDetail } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { FormField, type FieldConfig, type FormValue } from '../components/ui/FormFields'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { buildPayloadFromFields, getInitialFormValues, validateRequiredFields } from '../utils/form'
import { formatCurrency, formatPayrollDetailType, formatPayrollStatus } from '../utils/format'

type FormState = Record<string, FormValue>

const detailFields: FieldConfig[] = [
  {
    name: 'detailType',
    label: 'Loại chi tiết',
    type: 'select',
    required: true,
    options: [
      { value: '1', label: 'Phụ cấp' },
      { value: '2', label: 'Thưởng' },
      { value: '3', label: 'Phạt' },
      { value: '4', label: 'Tăng ca' },
    ],
  },
  { name: 'amount', label: 'Số tiền', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'description', label: 'Diễn giải', type: 'text', required: true },
  { name: 'attendanceId', label: 'Attendance ID', type: 'number', nullable: true, min: 1 },
  { name: 'scheduleId', label: 'Schedule ID', type: 'number', nullable: true, min: 1 },
  { name: 'sourceReferenceId', label: 'Reference ID', type: 'number', nullable: true, min: 1 },
  { name: 'note', label: 'Ghi chú', type: 'textarea', nullable: true, rows: 3 },
]

export function PayrollDetailsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [payrolls, setPayrolls] = useState<OptionItem[]>([])
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [details, setDetails] = useState<PayrollDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [formState, setFormState] = useState<FormState>(getInitialFormValues(detailFields))
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load(selectedPayrollId?: number) {
    setLoading(true)
    setError(null)
    try {
      const [payrollOptions, payrollList] = await Promise.all([api.options.payrollOptions(), api.payroll.list()])
      setPayrolls(payrollOptions)
      const chosen = payrollList.find((item) => item.id === selectedPayrollId) ?? payrollList[0] ?? null
      setSelectedPayroll(chosen)
      if (chosen) {
        setDetails(await api.payroll.details(chosen.id))
      } else {
        setDetails([])
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải chi tiết payroll.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const payrollId = Number(searchParams.get('payrollId') ?? '')
    void load(Number.isNaN(payrollId) ? undefined : payrollId)
  }, [searchParams])

  const lookupMap = useMemo(() => ({ payrolls }), [payrolls])

  async function changeSelectedPayroll(payrollId: string) {
    const selected = payrollId ? Number(payrollId) : undefined
    if (selected) {
      setSearchParams({ payrollId })
    } else {
      setSearchParams({})
    }
    await load(selected)
  }

  async function refreshDetails() {
    if (!selectedPayroll) return
    setDetails(await api.payroll.details(selectedPayroll.id))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedPayroll) {
      setFormError('Vui lòng chọn payroll trước.')
      return
    }
    const validationError = validateRequiredFields(detailFields, formState)
    if (validationError) {
      setFormError(validationError)
      return
    }
    const payload = buildPayloadFromFields(detailFields, formState) as {
      detailType: number
      amount: number
      description: string
      attendanceId?: number | null
      scheduleId?: number | null
      sourceReferenceId?: number | null
      note?: string | null
    }
    setSaving(true)
    setFormError(null)
    try {
      await api.payroll.addDetail(selectedPayroll.id, payload)
      setOpen(false)
      setFormState(getInitialFormValues(detailFields))
      await refreshDetails()
      await load(selectedPayroll.id)
    } catch (error_) {
      setFormError(error_ instanceof Error ? error_.message : 'Không thể thêm chi tiết payroll.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingView label="Đang tải chi tiết payroll..." />
  if (error) return <ErrorView message={error} />

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Chi tiết payroll</h2>
            <p className="text-sm text-stone-600">Xem và thêm chi tiết lương cho payroll đã chọn.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <select className="min-w-[320px] rounded-2xl border border-coffee-200 bg-white py-2.5 pl-10 pr-4 text-sm" value={selectedPayroll?.id ?? ''} onChange={(e) => void changeSelectedPayroll(e.target.value)}>
                <option value="">Chọn payroll</option>
                {payrolls.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => setOpen(true)}>
              <FileText size={16} />
              Thêm chi tiết
            </Button>
          </div>
        </div>
      </Card>

      {selectedPayroll ? (
        <Card>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Nhân viên</p>
              <p className="mt-1 font-semibold text-coffee-900">{selectedPayroll.employee?.fullName ?? `NV #${selectedPayroll.employeeId}`}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Kỳ lương</p>
              <p className="mt-1 font-semibold text-coffee-900">{selectedPayroll.payrollMonth}/{selectedPayroll.payrollYear}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Tổng lương</p>
              <p className="mt-1 font-semibold text-coffee-900">{formatCurrency(selectedPayroll.totalSalary)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Trạng thái</p>
              <div className="mt-1"><Badge>{formatPayrollStatus(selectedPayroll.status)}</Badge></div>
            </div>
          </div>
        </Card>
      ) : null}

      {details.length > 0 ? (
        <Table
          columns={[
            { key: 'type', label: 'Loại', render: (row) => <Badge>{formatPayrollDetailType(row.detailType)}</Badge> },
            { key: 'desc', label: 'Diễn giải', render: (row) => row.description },
            { key: 'amount', label: 'Số tiền', render: (row) => formatCurrency(row.amount) },
            { key: 'note', label: 'Ghi chú', render: (row) => row.note ?? '—' },
          ]}
          rowKey={(row) => row.id}
          rows={details}
        />
      ) : (
        <EmptyView message="Payroll này chưa có chi tiết." />
      )}

      <Modal open={open} title="Thêm chi tiết payroll" onClose={() => setOpen(false)}>
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            {detailFields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                lookups={lookupMap}
                value={formState[field.name] ?? ''}
                onChange={(name, value) => setFormState((current) => ({ ...current, [name]: value }))}
              />
            ))}
          </div>
          {formError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Hủy</Button>
            <Button disabled={saving} type="submit">{saving ? 'Đang lưu...' : 'Lưu'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
