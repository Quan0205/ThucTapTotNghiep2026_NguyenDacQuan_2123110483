import { useEffect, useState } from 'react'
import { Download, FileBarChart2 } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { Branch, ReportSummary } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingView, ErrorView } from '../components/ui/StateViews'
import { StatCard } from '../components/ui/StatCard'
import { formatCurrency } from '../utils/format'

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}

export function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [branchId, setBranchId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [reportSummary, branchRows] = await Promise.all([
        api.reports.summary(Number(month), Number(year), branchId ? Number(branchId) : undefined),
        api.branches.list(),
      ])
      setSummary(reportSummary)
      setBranches(branchRows)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải báo cáo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function exportEmployees() {
    downloadBlob(await api.reports.exportEmployeesCsv(), 'employees-report.csv')
  }

  async function exportAttendance() {
    downloadBlob(await api.reports.exportAttendanceCsv(Number(month), Number(year)), 'attendance-report.csv')
  }

  if (loading) return <LoadingView label="Đang tải báo cáo..." />
  if (error) return <ErrorView message={error} />
  if (!summary) return null

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Báo cáo</h2>
            <p className="text-sm text-stone-600">Tổng hợp theo tháng, chi nhánh và xuất dữ liệu CSV.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="number" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)} />
            <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="number" min={2000} max={2100} value={year} onChange={(e) => setYear(e.target.value)} />
            <select className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              <option value="">Tất cả chi nhánh</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.branchName}</option>)}
            </select>
            <Button onClick={() => void load()}>Lọc</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard title="Nhân viên active" value={String(summary.activeEmployees)} icon={<FileBarChart2 size={18} />} />
        <StatCard title="Bản ghi công" value={String(summary.attendanceCount)} icon={<FileBarChart2 size={18} />} />
        <StatCard title="Vắng mặt" value={String(summary.absentCount)} icon={<FileBarChart2 size={18} />} />
        <StatCard title="Tổng lương" value={formatCurrency(summary.payrollTotal)} icon={<FileBarChart2 size={18} />} />
      </div>

      <Card>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <div className="rounded-3xl bg-coffee-50 px-4 py-4 text-sm text-coffee-900">Đi muộn: <strong>{summary.lateCount}</strong></div>
          <div className="rounded-3xl bg-coffee-50 px-4 py-4 text-sm text-coffee-900">Tăng ca (phút): <strong>{summary.overtimeMinutes}</strong></div>
          <div className="rounded-3xl bg-coffee-50 px-4 py-4 text-sm text-coffee-900">Payroll đã duyệt: <strong>{summary.approvedPayrollCount}</strong></div>
          <div className="rounded-3xl bg-coffee-50 px-4 py-4 text-sm text-coffee-900">Payroll đã trả: <strong>{summary.paidPayrollCount}</strong></div>
          <div className="rounded-3xl bg-coffee-50 px-4 py-4 text-sm text-coffee-900">Tuyển dụng mở: <strong>{summary.openRecruitments}</strong></div>
          <div className="rounded-3xl bg-coffee-50 px-4 py-4 text-sm text-coffee-900">Đơn nghỉ chờ duyệt: <strong>{summary.pendingLeaveRequests}</strong></div>
          <div className="rounded-3xl bg-coffee-50 px-4 py-4 text-sm text-coffee-900">Đổi ca chờ duyệt: <strong>{summary.pendingShiftSwaps}</strong></div>
          <div className="rounded-3xl bg-coffee-50 px-4 py-4 text-sm text-coffee-900">Điều chỉnh công chờ duyệt: <strong>{summary.pendingAdjustments}</strong></div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void exportEmployees()}><Download size={16} />Xuất nhân viên</Button>
          <Button variant="secondary" onClick={() => void exportAttendance()}><Download size={16} />Xuất chấm công</Button>
        </div>
      </Card>
    </div>
  )
}
