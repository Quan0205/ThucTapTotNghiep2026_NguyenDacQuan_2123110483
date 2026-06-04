import type {
  AttendanceAdjustmentStatus,
  AttendanceStatus,
  CandidateStatus,
  ContractType,
  EmployeeTrainingStatus,
  GenderType,
  LeaveRequestStatus,
  PayrollDetailType,
  PayrollStatus,
  RecruitmentStatus,
  ShiftSwapStatus,
} from '../types/models'

const vietnameseDateTime = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const vietnameseDate = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
})

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function extractDateParts(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  const parts = extractDateParts(value)
  if (parts) return vietnameseDate.format(new Date(parts.year, parts.month - 1, parts.day))
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : vietnameseDate.format(date)
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : vietnameseDateTime.format(date)
}

export function formatDateInput(value?: string | null) {
  if (!value) return ''
  const parts = extractDateParts(value)
  if (parts) {
    return `${parts.year.toString().padStart(4, '0')}-${parts.month.toString().padStart(2, '0')}-${parts.day.toString().padStart(2, '0')}`
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function formatDateTimeInput(value?: string | null) {
  if (!value) return ''
  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/)
  if (match) return match[1]
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatTimeInput(value?: string | null) {
  if (!value) return ''
  const match = value.match(/^(\d{2}:\d{2})/)
  return match?.[1] ?? value.slice(0, 5)
}

export function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return '—'
  return currency.format(value)
}

export function formatPercent(value?: number | null) {
  if (value === undefined || value === null) return '—'
  return `${value.toFixed(2)}`
}

export function formatGender(value?: GenderType | null) {
  switch (value) {
    case 1: return 'Nam'
    case 2: return 'Nữ'
    case 3: return 'Khác'
    default: return '—'
  }
}

export function formatAttendanceStatus(value?: AttendanceStatus | null) {
  switch (value) {
    case 1: return 'Đang chờ'
    case 2: return 'Đúng giờ'
    case 3: return 'Đi muộn'
    case 4: return 'Về sớm'
    case 5: return 'Tăng ca'
    case 6: return 'Vắng mặt'
    default: return '—'
  }
}

export function formatPayrollStatus(value?: PayrollStatus | null) {
  switch (value) {
    case 1: return 'Bản nháp'
    case 2: return 'Đã tạo'
    case 3: return 'Đã duyệt'
    case 4: return 'Đã trả'
    case 5: return 'Đã hủy'
    default: return '—'
  }
}

export function formatPayrollDetailType(value?: PayrollDetailType | null) {
  switch (value) {
    case 1: return 'Phụ cấp'
    case 2: return 'Thưởng'
    case 3: return 'Phạt'
    case 4: return 'Tăng ca'
    case 5: return 'Bảo hiểm'
    case 6: return 'Thuế'
    default: return '—'
  }
}

export function formatContractType(value?: ContractType | null) {
  switch (value) {
    case 1: return 'Toàn thời gian'
    case 2: return 'Bán thời gian'
    case 3: return 'Thử việc'
    case 4: return 'Thực tập'
    default: return '—'
  }
}

export function formatRecruitmentStatus(value?: RecruitmentStatus | null) {
  switch (value) {
    case 1: return 'Nháp'
    case 2: return 'Mở'
    case 3: return 'Đang tuyển'
    case 4: return 'Đã đóng'
    case 5: return 'Đã hủy'
    default: return '—'
  }
}

export function formatCandidateStatus(value?: CandidateStatus | null) {
  switch (value) {
    case 1: return 'Đã ứng tuyển'
    case 2: return 'Sơ loại'
    case 3: return 'Phỏng vấn'
    case 4: return 'Đề nghị'
    case 5: return 'Đã nhận'
    case 6: return 'Từ chối'
    case 7: return 'Rút lui'
    default: return '—'
  }
}

export function formatEmployeeTrainingStatus(value?: EmployeeTrainingStatus | null) {
  switch (value) {
    case 1: return 'Đã phân công'
    case 2: return 'Đang học'
    case 3: return 'Hoàn thành'
    case 4: return 'Không đạt'
    case 5: return 'Đã hủy'
    default: return '—'
  }
}

export function formatLeaveRequestStatus(value?: LeaveRequestStatus | null) {
  switch (value) {
    case 1: return 'Chờ duyệt'
    case 2: return 'Đã duyệt'
    case 3: return 'Từ chối'
    case 4: return 'Đã hủy'
    default: return '—'
  }
}

export function formatShiftSwapStatus(value?: ShiftSwapStatus | null) {
  switch (value) {
    case 1: return 'Chờ duyệt'
    case 2: return 'Đã duyệt'
    case 3: return 'Từ chối'
    case 4: return 'Đã hủy'
    default: return '—'
  }
}

export function formatAttendanceAdjustmentStatus(value?: AttendanceAdjustmentStatus | null) {
  switch (value) {
    case 1: return 'Chờ duyệt'
    case 2: return 'Đã duyệt'
    case 3: return 'Từ chối'
    case 4: return 'Đã hủy'
    default: return '—'
  }
}

export function formatYesNo(value?: boolean | null) {
  return value ? 'Có' : 'Không'
}

export function toTimeSpanInput(value?: string | null) {
  if (!value) return ''
  const match = value.match(/^(\d{2}:\d{2})/)
  return match?.[1] ?? value
}

export function toTimeSpanPayload(value: string) {
  if (!value) return '00:00:00'
  return value.length === 5 ? `${value}:00` : value
}

export function toDateOnlyPayload(value: string) {
  if (!value) return null
  return `${value}T00:00:00`
}

export function toDateTimePayload(value: string) {
  if (!value) return null
  return value.length === 16 ? `${value}:00` : value
}

export function statusToneForText(value: string) {
  const text = value.toLowerCase()
  if (text.includes('đã trả') || text.includes('hoàn thành') || text.includes('đúng giờ') || text.includes('mở') || text.includes('active') || text.includes('có')) {
    return 'success'
  }
  if (text.includes('muộn') || text.includes('phạt') || text.includes('hủy') || text.includes('đóng') || text.includes('từ chối') || text.includes('inactive') || text.includes('không')) {
    return 'danger'
  }
  if (text.includes('đang') || text.includes('nháp') || text.includes('chờ') || text.includes('sơ loại')) {
    return 'warning'
  }
  return 'neutral'
}
