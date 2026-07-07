import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BadgeDollarSign, Search, Settings2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/coffeeApi'
import type { OptionItem, Payroll, PayrollClosePeriod } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { FormField, type FieldConfig, type FormValue } from '../components/ui/FormFields'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { buildPayloadFromFields, getInitialFormValues, validateRequiredFields } from '../utils/form'
import { formatCurrency, formatPayrollStatus } from '../utils/format'

type FormState = Record<string, FormValue>

const fields: FieldConfig[] = [
  { name: 'employeeId', label: 'Nhân viên', type: 'select', required: true, options: (lookups) => lookups.employees ?? [] },
  { name: 'employeeContractId', label: 'Hợp đồng', type: 'select', required: true, options: (lookups) => lookups.employeeContracts ?? [] },
  { name: 'payrollMonth', label: 'Tháng', type: 'number', required: true, min: 1, max: 12 },
  { name: 'payrollYear', label: 'Năm', type: 'number', required: true, min: 2000, max: 2100 },
  { name: 'allowanceAmount', label: 'Phụ cấp', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'bonusAmount', label: 'Thưởng', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'penaltyAmount', label: 'Phạt khác', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'insuranceAmount', label: 'Bảo hiểm', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'taxAmount', label: 'Thuế', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'note', label: 'Ghi chú', type: 'textarea', nullable: true, rows: 3 },
]

const generateFields: FieldConfig[] = [
  { name: 'employeeId', label: 'Nhân viên', type: 'select', required: true, options: (lookups) => lookups.employees ?? [] },
  { name: 'payrollMonth', label: 'Tháng', type: 'number', required: true, min: 1, max: 12 },
  { name: 'payrollYear', label: 'Năm', type: 'number', required: true, min: 2000, max: 2100 },
  { name: 'allowanceAmount', label: 'Phụ cấp', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'bonusAmount', label: 'Thưởng', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'penaltyAmount', label: 'Phạt khác', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'insuranceAmount', label: 'Bảo hiểm', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'taxAmount', label: 'Thuế', type: 'number', required: true, min: 0, step: 1000 },
  { name: 'note', label: 'Ghi chú', type: 'textarea', nullable: true, rows: 3 },
]

export function PayrollPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Payroll[]>([])
  const [employees, setEmployees] = useState<OptionItem[]>([])
  const [employeeContracts, setEmployeeContracts] = useState<OptionItem[]>([])
  const [closePeriods, setClosePeriods] = useState<PayrollClosePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [open, setOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [editing, setEditing] = useState<Payroll | null>(null)
  const [formState, setFormState] = useState<FormState>(getInitialFormValues(fields))
  const [generateState, setGenerateState] = useState<FormState>(getInitialFormValues(generateFields))
  const [closeMonth, setCloseMonth] = useState(String(new Date().getMonth() + 1))
  const [closeYear, setCloseYear] = useState(String(new Date().getFullYear()))
  const [closeNote, setCloseNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [payrolls, employeeOptions, contractOptions, periods] = await Promise.all([
        api.payroll.list(),
        api.options.employeeOptions(),
        api.options.activeContractOptions(),
        api.payroll.closePeriods(),
      ])
      setItems(payrolls)
      setEmployees(employeeOptions)
      setEmployeeContracts(contractOptions)
      setClosePeriods(periods)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải payroll.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const lookupMap = useMemo(() => ({ employees, employeeContracts }), [employees, employeeContracts])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = !filterStatus || String(item.status) === filterStatus
      const matchesMonth = !filterMonth || String(item.payrollMonth) === filterMonth
      const matchesYear = !filterYear || String(item.payrollYear) === filterYear
      const matchesSearch =
        !search.trim() ||
        [item.employee?.fullName ?? '', item.employee?.employeeCode ?? '', item.employeeContract?.contractNo ?? '', item.note ?? '']
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())

      return matchesStatus && matchesMonth && matchesYear && matchesSearch
    })
  }, [items, filterStatus, filterMonth, filterYear, search])

  function openCreate() {
    setEditing(null)
    setFormState(getInitialFormValues(fields))
    setFormError(null)
    setOpen(true)
  }

  function openEdit(item: Payroll) {
    setEditing(item)
    setFormState({
      employeeId: String(item.employeeId),
      employeeContractId: String(item.employeeContractId),
      payrollMonth: String(item.payrollMonth),
      payrollYear: String(item.payrollYear),
      allowanceAmount: String(item.allowanceAmount),
      bonusAmount: String(item.bonusAmount),
      penaltyAmount: String(item.penaltyAmount),
      insuranceAmount: String(item.insuranceAmount),
      taxAmount: String(item.taxAmount),
      note: item.note ?? '',
    })
    setFormError(null)
    setOpen(true)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateRequiredFields(fields, formState)
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = buildPayloadFromFields(fields, formState) as {
      employeeId: number
      employeeContractId: number
      payrollMonth: number
      payrollYear: number
      allowanceAmount: number
      bonusAmount: number
      penaltyAmount: number
      insuranceAmount: number
      taxAmount: number
      note?: string | null
    }

    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        await api.payroll.update(editing.id, payload)
      } else {
        await api.payroll.create(payload)
      }
      setOpen(false)
      await load()
    } catch (error_) {
      setFormError(error_ instanceof Error ? error_.message : 'Không thể lưu payroll.')
    } finally {
      setSaving(false)
    }
  }

  async function generatePayroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateRequiredFields(generateFields, generateState)
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = buildPayloadFromFields(generateFields, generateState) as {
      employeeId: number
      payrollMonth: number
      payrollYear: number
      allowanceAmount: number
      bonusAmount: number
      penaltyAmount: number
      insuranceAmount: number
      taxAmount: number
      note?: string | null
    }

    setSaving(true)
    setFormError(null)
    try {
      const payroll = await api.payroll.generate(payload)
      setMessage(`Đã sinh payroll ${payroll.payrollMonth}/${payroll.payrollYear} cho ${payroll.employee?.fullName ?? `NV #${payroll.employeeId}`}.`)
      setGenerateOpen(false)
      await load()
    } catch (error_) {
      setFormError(error_ instanceof Error ? error_.message : 'Không thể sinh payroll.')
    } finally {
      setSaving(false)
    }
  }

  async function closeOrReopen(isClosing: boolean) {
    try {
      const payload = { payrollMonth: Number(closeMonth), payrollYear: Number(closeYear), note: closeNote || null }
      if (isClosing) {
        await api.payroll.closePeriod(payload)
        setMessage(`Đã đóng kỳ lương ${closeMonth}/${closeYear}.`)
      } else {
        await api.payroll.reopenPeriod(payload)
        setMessage(`Đã mở lại kỳ lương ${closeMonth}/${closeYear}.`)
      }
      await load()
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể thao tác kỳ lương.')
    }
  }

  async function approve(item: Payroll) {
    try {
      await api.payroll.approve(item.id, item.note ?? undefined)
      await load()
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể duyệt payroll.')
    }
  }

  async function pay(item: Payroll) {
    try {
      await api.payroll.pay(item.id, item.note ?? undefined)
      await load()
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể đánh dấu đã trả lương.')
    }
  }

  async function cancel(item: Payroll) {
    try {
      await api.payroll.cancel(item.id, item.note ?? undefined)
      await load()
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể hủy payroll.')
    }
  }

  async function remove(item: Payroll) {
    if (!window.confirm('Xóa payroll này?')) return
    try {
      await api.payroll.remove(item.id)
      await load()
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể xóa payroll.')
    }
  }

  async function exportCsv() {
    const blob = await api.payroll.exportCsv()
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'payroll.csv'
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingView label="Đang tải payroll..." />
  if (error) return <ErrorView message={error} />

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Payroll</h2>
            <p className="text-sm text-stone-600">Quản lý payroll theo trạng thái, đóng kỳ và các khoản bổ sung.</p>
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
            <Button variant="secondary" onClick={() => void exportCsv()}>Xuất CSV</Button>
            <Button variant="secondary" onClick={() => setGenerateOpen(true)}>
              <BadgeDollarSign size={16} />
              Sinh payroll
            </Button>
            <Button onClick={openCreate}>
              <Settings2 size={16} />
              Thêm payroll
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" placeholder="Tháng" type="number" min={1} max={12} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" placeholder="Năm" type="number" min={2000} max={2100} value={filterYear} onChange={(e) => setFilterYear(e.target.value)} />
          <select className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="1">Bản nháp</option>
            <option value="2">Đã tạo</option>
            <option value="3">Đã duyệt</option>
            <option value="4">Đã trả</option>
            <option value="5">Đã hủy</option>
          </select>
          <Button variant="secondary" onClick={() => { setFilterMonth(''); setFilterYear(''); setFilterStatus(''); setSearch('') }}>Đặt lại</Button>
        </div>
      </Card>

      <Card>
        <div className="grid gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto]">
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="number" min={1} max={12} value={closeMonth} onChange={(e) => setCloseMonth(e.target.value)} />
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="number" min={2000} max={2100} value={closeYear} onChange={(e) => setCloseYear(e.target.value)} />
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm lg:col-span-2" placeholder="Ghi chú kỳ lương" value={closeNote} onChange={(e) => setCloseNote(e.target.value)} />
          <Button variant="secondary" onClick={() => void closeOrReopen(false)}>Mở kỳ</Button>
          <Button onClick={() => void closeOrReopen(true)}>Đóng kỳ</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {closePeriods.slice(0, 6).map((period) => (
            <Badge key={period.id} tone={period.isClosed ? 'warning' : 'success'}>
              {period.payrollMonth}/{period.payrollYear} - {period.isClosed ? 'Đóng' : 'Mở'}
            </Badge>
          ))}
        </div>
      </Card>

      {message ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      {filtered.length > 0 ? (
        <Table
          columns={[
            { key: 'employee', label: 'Nhân viên', render: (row) => row.employee?.fullName ?? `NV #${row.employeeId}` },
            { key: 'period', label: 'Kỳ', render: (row) => `${row.payrollMonth}/${row.payrollYear}` },
            { key: 'salary', label: 'Tổng lương', render: (row) => formatCurrency(row.totalSalary) },
            { key: 'insurance', label: 'BH/Thuế', render: (row) => `${formatCurrency(row.insuranceAmount)} / ${formatCurrency(row.taxAmount)}` },
            { key: 'status', label: 'Trạng thái', render: (row) => <Badge tone={row.isClosed ? 'warning' : 'neutral'}>{formatPayrollStatus(row.status)}{row.isClosed ? ' • Khóa' : ''}</Badge> },
            {
              key: 'actions',
              label: 'Thao tác',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => navigate(`/admin/payroll-details?payrollId=${row.id}`)}>Chi tiết</Button>
                  {row.status === 1 && !row.isClosed ? <Button variant="secondary" onClick={() => openEdit(row)}>Sửa</Button> : null}
                  {row.status === 1 && !row.isClosed ? <Button variant="danger" onClick={() => void remove(row)}>Xóa</Button> : null}
                  {(row.status === 1 || row.status === 2) && !row.isClosed ? <Button onClick={() => void approve(row)}>Duyệt</Button> : null}
                  {row.status === 3 ? <Button onClick={() => void pay(row)}>Đã trả</Button> : null}
                  {row.status !== 4 && row.status !== 5 ? <Button variant="danger" onClick={() => void cancel(row)}>Hủy</Button> : null}
                </div>
              ),
            },
          ]}
          rowKey={(row) => row.id}
          rows={filtered}
        />
      ) : (
        <EmptyView message="Chưa có payroll phù hợp bộ lọc." />
      )}

      <Modal open={open} title={editing ? 'Cập nhật payroll' : 'Thêm payroll'} onClose={() => setOpen(false)}>
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <FormField key={field.name} field={field} lookups={lookupMap} value={formState[field.name] ?? ''} onChange={(name, value) => setFormState((current) => ({ ...current, [name]: value }))} />
            ))}
          </div>
          {formError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Hủy</Button>
            <Button disabled={saving} type="submit">{saving ? 'Đang lưu...' : 'Lưu'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={generateOpen} title="Sinh payroll tự động" onClose={() => setGenerateOpen(false)}>
        <form className="space-y-5" onSubmit={generatePayroll}>
          <div className="grid gap-4 md:grid-cols-2">
            {generateFields.map((field) => (
              <FormField key={field.name} field={field} lookups={lookupMap} value={generateState[field.name] ?? ''} onChange={(name, value) => setGenerateState((current) => ({ ...current, [name]: value }))} />
            ))}
          </div>
          {formError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setGenerateOpen(false)}>Hủy</Button>
            <Button disabled={saving} type="submit">{saving ? 'Đang sinh...' : 'Sinh payroll'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
