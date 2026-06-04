import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Clock3,
  FileText,
  HeartHandshake,
  Loader2,
  Sparkles,
  Users2,
} from 'lucide-react'
import { api } from '../api/coffeeApi'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ErrorView, LoadingView } from '../components/ui/StateViews'
import type { Recruitment } from '../types/models'
import { formatDate, formatRecruitmentStatus } from '../utils/format'

const fallbackRecruitments: Recruitment[] = [
  {
    id: 101,
    branchId: 1,
    positionTitle: 'Barista ca sáng',
    openDate: new Date().toISOString(),
    closeDate: null,
    status: 2,
    description: 'Phục vụ quầy bar, pha chế đồ uống và hỗ trợ vận hành cửa hàng.',
    branch: {
      id: 1,
      branchCode: 'BR-01',
      branchName: 'Head Office',
      address: 'Quận 1, TP.HCM',
      phone: null,
      isActive: true,
    },
    candidates: [],
  },
  {
    id: 102,
    branchId: 2,
    positionTitle: 'Thu ngân cửa hàng',
    openDate: new Date().toISOString(),
    closeDate: null,
    status: 3,
    description: 'Tiếp nhận order, thanh toán và hỗ trợ khách hàng tại quầy.',
    branch: {
      id: 2,
      branchCode: 'BR-02',
      branchName: 'Coffee Central',
      address: 'Quận 3, TP.HCM',
      phone: null,
      isActive: true,
    },
    candidates: [],
  },
  {
    id: 103,
    branchId: 3,
    positionTitle: 'Quản lý ca',
    openDate: new Date().toISOString(),
    closeDate: null,
    status: 2,
    description: 'Phân ca, kiểm soát công việc vận hành và hỗ trợ đào tạo đội ngũ.',
    branch: {
      id: 3,
      branchCode: 'BR-03',
      branchName: 'West Lake',
      address: 'Hà Nội',
      phone: null,
      isActive: true,
    },
    candidates: [],
  },
]

const steps = [
  { label: '1', title: 'Chọn vị trí', description: 'Xem danh sách mở tuyển và chọn công việc phù hợp.' },
  { label: '2', title: 'Nộp hồ sơ', description: 'Điền thông tin ứng viên và gửi hồ sơ trực tuyến.' },
  { label: '3', title: 'Sàng lọc', description: 'HR xem hồ sơ, chấm điểm và lên lịch phỏng vấn.' },
  { label: '4', title: 'Nhận việc', description: 'Ứng viên trúng tuyển được chuyển sang hồ sơ nhân sự.' },
]

export function CareersPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState<number | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.publicRecruitments.open()
      const openRecruitments = data.length > 0 ? data : fallbackRecruitments
      setRecruitments(openRecruitments)
      setSelectedRecruitmentId((current) => current ?? openRecruitments[0]?.id ?? null)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải danh sách tuyển dụng.')
      setRecruitments(fallbackRecruitments)
      setSelectedRecruitmentId(fallbackRecruitments[0]?.id ?? null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const selectedRecruitment = useMemo(
    () => recruitments.find((item) => item.id === selectedRecruitmentId) ?? recruitments[0] ?? null,
    [recruitments, selectedRecruitmentId],
  )

  const openRecruitmentCount = recruitments.length
  const branchCount = new Set(recruitments.map((item) => item.branchId ?? item.branch?.id ?? item.id)).size

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedRecruitment) {
      setMessage('Hãy chọn một vị trí trước khi nộp hồ sơ.')
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      await api.publicRecruitments.apply(selectedRecruitment.id, {
        fullName,
        phone: phone || null,
        email: email || null,
        note: note || null,
      })
      setMessage(`Hồ sơ của ${fullName} đã được gửi cho vị trí ${selectedRecruitment.positionTitle}.`)
      setFullName('')
      setPhone('')
      setEmail('')
      setNote('')
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể gửi hồ sơ.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingView label="Đang tải trang tuyển dụng..." />
  if (error && recruitments.length === 0) return <ErrorView message={error} />

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(79,121,240,0.2),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.13),_transparent_24%),linear-gradient(135deg,#ffffff_0%,#f8fbff_40%,#eef4ff_100%)] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-coffee-700 ring-1 ring-coffee-200">
              <Sparkles size={14} />
              CoffeeHRM Careers
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                Ứng tuyển vào chuỗi quán cà phê có quy trình HR rõ ràng, ca làm ổn định và lộ trình phát triển minh bạch.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Trang tuyển dụng này mô phỏng đúng dữ liệu backend Recruitment/Candidate: vị trí mở, chi nhánh, thời gian đăng tuyển và form ứng tuyển trực tiếp.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Vị trí mở</div>
                <div className="mt-2 text-3xl font-black text-slate-900">{openRecruitmentCount}</div>
              </div>
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Chi nhánh</div>
                <div className="mt-2 text-3xl font-black text-slate-900">{branchCount}</div>
              </div>
              <div className="rounded-3xl bg-white/85 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phản hồi</div>
                <div className="mt-2 text-3xl font-black text-slate-900">24h</div>
              </div>
            </div>
          </div>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coffee-700 text-white">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Mở tuyển</div>
                  <div className="text-lg font-black text-slate-900">
                    {selectedRecruitment?.positionTitle ?? 'Chọn vị trí'}
                  </div>
                </div>
              </div>
              {selectedRecruitment ? (
                <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{selectedRecruitment.branch?.branchName ?? 'Head Office'}</div>
                      <div className="text-xs text-slate-500">{selectedRecruitment.branch?.branchCode ?? 'BR-00'}</div>
                    </div>
                    <Badge tone="info">{formatRecruitmentStatus(selectedRecruitment.status)}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Ngày mở</div>
                      <div className="mt-1 font-semibold text-slate-900">{formatDate(selectedRecruitment.openDate)}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Ngày đóng</div>
                      <div className="mt-1 font-semibold text-slate-900">{formatDate(selectedRecruitment.closeDate)}</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600">
                    {selectedRecruitment.description ?? 'Không có mô tả chi tiết.'}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => (
          <Card key={step.label}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coffee-50 text-coffee-700 ring-1 ring-coffee-200">
              <BadgeCheck size={18} />
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bước {step.label}</div>
            <div className="mt-2 text-lg font-black text-slate-900">{step.title}</div>
            <div className="mt-1 text-sm leading-6 text-slate-600">{step.description}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Vị trí đang mở</h2>
              <p className="text-sm text-slate-500">Nhấn vào một vị trí để điền form ứng tuyển đúng công việc đó.</p>
            </div>
            <Badge tone="success">{recruitments.length} vị trí</Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {recruitments.map((recruitment) => {
              const active = recruitment.id === selectedRecruitment?.id
              return (
                <button
                  key={recruitment.id}
                  className={[
                    'rounded-3xl border p-4 text-left transition',
                    active
                      ? 'border-coffee-300 bg-coffee-50 shadow-sm shadow-coffee-900/5'
                      : 'border-slate-200 bg-white hover:border-coffee-200 hover:bg-slate-50',
                  ].join(' ')}
                  type="button"
                  onClick={() => setSelectedRecruitmentId(recruitment.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-slate-900">{recruitment.positionTitle}</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Building2 size={14} />
                        {recruitment.branch?.branchName ?? 'Head Office'}
                      </div>
                    </div>
                    <Badge tone={recruitment.status === 3 ? 'info' : 'success'}>{formatRecruitmentStatus(recruitment.status)}</Badge>
                  </div>
                  <div className="mt-4 text-sm leading-6 text-slate-600">
                    {recruitment.description ?? 'Mô tả công việc đang được cập nhật.'}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} />
                      Mở {formatDate(recruitment.openDate)}
                    </span>
                    <ArrowRight size={14} className={active ? 'text-coffee-700' : 'text-slate-400'} />
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="text-coffee-700" size={18} />
              <h2 className="text-lg font-black text-slate-900">Nộp hồ sơ</h2>
            </div>
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <div>
                <label className="text-sm font-semibold text-slate-700">Vị trí ứng tuyển</label>
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                  value={selectedRecruitment?.id ?? ''}
                  onChange={(event) => setSelectedRecruitmentId(Number(event.target.value))}
                >
                  {recruitments.map((recruitment) => (
                    <option key={recruitment.id} value={recruitment.id}>
                      {recruitment.positionTitle} - {recruitment.branch?.branchName ?? 'Head Office'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Họ và tên</label>
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                    placeholder="09xx xxx xxx"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Lời nhắn</label>
                <textarea
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                  placeholder="Giới thiệu ngắn về kinh nghiệm và ca làm mong muốn"
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>

              <Button className="w-full justify-center" disabled={submitting} type="submit">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <HeartHandshake size={16} />}
                {submitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ ứng tuyển'}
              </Button>
            </form>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Users2 className="text-coffee-700" size={18} />
              <h2 className="text-lg font-black text-slate-900">Lợi ích khi làm việc</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                'Ca làm rõ ràng, lịch minh bạch',
                'Đào tạo nội bộ từ ngày đầu',
                'Môi trường trẻ, quy trình gọn',
                'Lộ trình lên ca trưởng/quản lý',
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {message ? (
        <div className="rounded-3xl border border-coffee-200 bg-coffee-50 px-4 py-3 text-sm text-coffee-800">
          {message}
        </div>
      ) : null}
    </div>
  )
}

