import axios from 'axios'
import type {
  Attendance,
  AttendanceAdjustment,
  AuditLog,
  AuthProfile,
  AuthResponse,
  AuthUser,
  Branch,
  Candidate,
  Employee,
  EmployeeContract,
  EmployeeTraining,
  KPI,
  LeaveRequest,
  OptionItem,
  Payroll,
  PayrollClosePeriod,
  PayrollDetail,
  Permission,
  Recruitment,
  ReportSummary,
  Role,
  Schedule,
  ScheduleValidationResult,
  Shift,
  ShiftSwapRequest,
  SelfAttendanceResult,
  SelfPayrollSummary,
  SelfShiftBoard,
  ShiftOpenSlotBulkCreateResult,
  SelfShiftSelectResult,
  SelfPortalOverview,
  SystemRole,
  Training,
  ShiftOpenSlot,
  UserAccount,
} from '../types/models'
import {
  clearStoredSession,
  getAuthRealm,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredSession,
} from '../auth/session'

const http = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const authHttp = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

function resolveApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Đã có lỗi xảy ra.'
  }

  const payload = error.response?.data
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (typeof record.message === 'string' && record.message.trim()) return record.message
    if (typeof record.title === 'string' && record.title.trim()) return record.title
    if (record.errors && typeof record.errors === 'object') {
      const firstError = Object.values(record.errors as Record<string, unknown>)
        .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
        .find((entry) => typeof entry === 'string' && entry.trim())
      if (typeof firstError === 'string') return firstError
    }
  }

  return error.message || 'Đã có lỗi xảy ra.'
}

http.interceptors.request.use((config) => {
  const token = getStoredAccessToken(getAuthRealm(window.location.pathname))
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  return config
})

authHttp.interceptors.response.use(
  (response) => response,
  async (error) => Promise.reject(new Error(resolveApiErrorMessage(error))),
)

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const shouldRetryAfterRefresh =
      (error.response?.status === 401 || (error.response?.status === 403 && originalRequest?.url?.startsWith('/self/'))) &&
      originalRequest &&
      !originalRequest._retry

    if (shouldRetryAfterRefresh) {
      originalRequest._retry = true
      const realm = getAuthRealm(window.location.pathname)
      const refreshToken = getStoredRefreshToken(realm)
      if (refreshToken) {
        try {
          const response = await authHttp.post<AuthResponse>('/auth/refresh', { refreshToken })
          setStoredSession(response.data, realm)
          originalRequest.headers = originalRequest.headers ?? {}
          ;(originalRequest.headers as Record<string, string>).Authorization = `Bearer ${response.data.accessToken}`
          return http(originalRequest)
        } catch {
          clearStoredSession(realm)
        }
      }
    }

    return Promise.reject(new Error(resolveApiErrorMessage(error)))
  },
)

export type QueryParams = Record<string, string | number | boolean | null | undefined>
export type CrudApi<TList, TForm = TList> = {
  list: (params?: QueryParams) => Promise<TList[]>
  get: (id: number) => Promise<TList>
  create: (payload: TForm) => Promise<TList>
  update: (id: number, payload: TForm) => Promise<void>
  remove: (id: number) => Promise<void>
}

async function unwrap<T>(request: Promise<{ data: T }>) {
  const response = await request
  return response.data
}

function createCrudApi<TList, TForm = TList>(path: string) {
  const api: CrudApi<TList, TForm> = {
    list: (params?: QueryParams) => unwrap(http.get<TList[]>(path, { params })),
    get: (id: number) => unwrap(http.get<TList>(`${path}/${id}`)),
    create: (payload: TForm) => unwrap(http.post<TList>(path, payload)),
    update: (id: number, payload: TForm) => unwrap(http.put<void>(`${path}/${id}`, payload)),
    remove: (id: number) => unwrap(http.delete<void>(`${path}/${id}`)),
  }
  return api
}

export const authApi = {
  login: (payload: { username: string; password: string }) => authHttp.post<AuthResponse>('/auth/login', payload).then((response) => response.data),
  refresh: (refreshToken: string) => authHttp.post<AuthResponse>('/auth/refresh', { refreshToken }).then((response) => response.data),
  logout: (refreshToken: string) => authHttp.post<void>('/auth/logout', { refreshToken }).then((response) => response.data),
  logoutAll: () => http.post<void>('/auth/logout-all').then((response) => response.data),
  me: () => http.get<AuthUser>('/auth/me').then((response) => response.data),
  profile: () => http.get<AuthProfile>('/auth/profile').then((response) => response.data),
  changePassword: (payload: { currentPassword: string; newPassword: string }) => http.post<void>('/auth/change-password', payload).then((response) => response.data),
  resetPassword: (userAccountId: number, payload: { newPassword: string; requireLogoutAll: boolean }) =>
    http.post<void>(`/auth/reset-password/${userAccountId}`, payload).then((response) => response.data),
}

export const branchApi = createCrudApi<Branch>('/branches')
export const roleApi = createCrudApi<Role>('/roles')
export const systemRoleApi = createCrudApi<SystemRole>('/systemRoles')
export const permissionApi = { list: () => unwrap(http.get<Permission[]>('/permissions')) }
export const shiftApi = createCrudApi<Shift>('/shifts')
export const employeeApi = createCrudApi<Employee>('/employees')
export const employeeContractApi = createCrudApi<EmployeeContract>('/employeeContracts')
export const userAccountApi = createCrudApi<UserAccount>('/userAccounts')
export const scheduleApi = Object.assign(createCrudApi<Schedule>('/schedules'), {
  validate: (payload: { employeeId: number; shiftId: number; scheduleDate: string; note?: string | null }) =>
    unwrap(http.post<ScheduleValidationResult>('/schedules/validate', payload)),
}) as CrudApi<Schedule> & {
  validate: (payload: { employeeId: number; shiftId: number; scheduleDate: string; note?: string | null }) => Promise<ScheduleValidationResult>
}
export const recruitmentApi = createCrudApi<Recruitment>('/recruitments')
export const candidateApi = createCrudApi<Candidate>('/candidates')
export const trainingApi = createCrudApi<Training>('/trainings')
export const employeeTrainingApi = createCrudApi<EmployeeTraining>('/employeeTrainings')
export const kpiApi = createCrudApi<KPI>('/KPIs')
export const leaveRequestApi = {
  ...createCrudApi<LeaveRequest, { employeeId: number; startDate: string; endDate: string; leaveType: string; reason?: string | null }>('/leaveRequests'),
  approve: (id: number, note?: string) => unwrap(http.post<void>(`/leaveRequests/${id}/approve`, { note })),
  reject: (id: number, note?: string) => unwrap(http.post<void>(`/leaveRequests/${id}/reject`, { note })),
  cancel: (id: number) => unwrap(http.post<void>(`/leaveRequests/${id}/cancel`, {})),
}
export const shiftSwapApi = {
  list: () => unwrap(http.get<ShiftSwapRequest[]>('/shiftSwapRequests')),
  create: (payload: { requestEmployeeId: number; targetEmployeeId: number; requestScheduleId: number; targetScheduleId: number; reason?: string | null }) =>
    unwrap(http.post<ShiftSwapRequest>('/shiftSwapRequests', payload)),
  approve: (id: number, note?: string) => unwrap(http.post<void>(`/shiftSwapRequests/${id}/approve`, { note })),
  reject: (id: number, note?: string) => unwrap(http.post<void>(`/shiftSwapRequests/${id}/reject`, { note })),
  cancel: (id: number) => unwrap(http.post<void>(`/shiftSwapRequests/${id}/cancel`, {})),
}
export const attendanceAdjustmentApi = {
  list: () => unwrap(http.get<AttendanceAdjustment[]>('/attendanceAdjustments')),
  create: (payload: {
    attendanceId: number
    employeeId: number
    requestedCheckInAt?: string | null
    requestedCheckOutAt?: string | null
    requestedStatus?: number | null
    reason?: string | null
  }) => unwrap(http.post<AttendanceAdjustment>('/attendanceAdjustments', payload)),
  approve: (id: number, note?: string) => unwrap(http.post<void>(`/attendanceAdjustments/${id}/approve`, { note })),
  reject: (id: number, note?: string) => unwrap(http.post<void>(`/attendanceAdjustments/${id}/reject`, { note })),
  cancel: (id: number) => unwrap(http.post<void>(`/attendanceAdjustments/${id}/cancel`, {})),
}
export const auditLogApi = {
  list: (params?: QueryParams) => unwrap(http.get<AuditLog[]>('/auditLogs', { params })),
  get: (id: number) => unwrap(http.get<AuditLog>(`/auditLogs/${id}`)),
}

export const attendanceApi = {
  list: (params?: QueryParams) => unwrap(http.get<Attendance[]>('/attendance', { params })),
  byEmployee: (employeeId: number) => unwrap(http.get<Attendance[]>(`/attendance/employee/${employeeId}`)),
  summary: (month: number, year: number, employeeId?: number) =>
    unwrap(http.get<{ presentCount: number; lateCount: number; earlyLeaveCount: number; overtimeCount: number; absentCount: number; workingMinutes: number; records: Attendance[] }>('/attendance/summary', { params: { month, year, employeeId } })),
  markAbsent: (payload: { attendanceDate: string; note?: string | null }) => unwrap(http.post<{ created: number; date: string }>('/attendance/mark-absent', payload)),
  checkIn: (payload: { employeeId: number; attendanceDate?: string | null; note?: string | null }) =>
    unwrap(http.post<Attendance>('/attendance/check-in', payload)),
  checkOut: (payload: { employeeId: number; attendanceDate?: string | null }) =>
    unwrap(http.post<Attendance>('/attendance/check-out', payload)),
}

export const payrollApi = {
  list: () => unwrap(http.get<Payroll[]>('/payroll')),
  get: (id: number) => unwrap(http.get<Payroll>(`/payroll/${id}`)),
  create: (payload: {
    employeeId: number
    employeeContractId: number
    payrollMonth: number
    payrollYear: number
    hourlyRate?: number | null
    allowanceAmount: number
    bonusAmount: number
    penaltyAmount: number
    insuranceAmount: number
    taxAmount: number
    note?: string | null
  }) => unwrap(http.post<Payroll>('/payroll', payload)),
  update: (id: number, payload: {
    employeeId: number
    employeeContractId: number
    payrollMonth: number
    payrollYear: number
    hourlyRate?: number | null
    allowanceAmount: number
    bonusAmount: number
    penaltyAmount: number
    insuranceAmount: number
    taxAmount: number
    note?: string | null
  }) => unwrap(http.put<void>(`/payroll/${id}`, payload)),
  remove: (id: number) => unwrap(http.delete<void>(`/payroll/${id}`)),
  approve: (id: number, note?: string) => unwrap(http.post<void>(`/payroll/${id}/approve`, { note })),
  pay: (id: number, note?: string) => unwrap(http.post<void>(`/payroll/${id}/pay`, { note })),
  cancel: (id: number, note?: string) => unwrap(http.post<void>(`/payroll/${id}/cancel`, { note })),
  closePeriods: () => unwrap(http.get<PayrollClosePeriod[]>('/payroll/close-periods')),
  closePeriod: (payload: { payrollMonth: number; payrollYear: number; note?: string | null }) => unwrap(http.post<void>('/payroll/close-period', payload)),
  reopenPeriod: (payload: { payrollMonth: number; payrollYear: number; note?: string | null }) => unwrap(http.post<void>('/payroll/reopen-period', payload)),
  details: (payrollId: number) => unwrap(http.get<PayrollDetail[]>(`/payroll/${payrollId}/details`)),
  addDetail: (
    payrollId: number,
    payload: {
      detailType: number
      amount: number
      description: string
      attendanceId?: number | null
      scheduleId?: number | null
      sourceReferenceId?: number | null
      note?: string | null
    },
  ) => unwrap(http.post<PayrollDetail>(`/payroll/${payrollId}/details`, payload)),
  generate: (payload: {
    employeeId: number
    payrollMonth: number
    payrollYear: number
    allowanceAmount: number
    bonusAmount: number
    penaltyAmount: number
    insuranceAmount: number
    taxAmount: number
    note?: string | null
  }) => unwrap(http.post<Payroll>('/payroll/generate', payload)),
  exportCsv: () => http.get('/payroll/export/csv', { responseType: 'blob' }).then((response) => response.data as Blob),
}

export const selfPortalApi = {
  overview: () => unwrap(http.get<SelfPortalOverview>('/self/overview')),
  payrolls: () => unwrap(http.get<SelfPayrollSummary[]>('/self/payrolls')),
  shiftBoard: (weekStart?: string) => unwrap(http.get<SelfShiftBoard>('/self/shift-board', { params: { weekStart } })),
  checkIn: (payload: { attendanceDate?: string | null; note?: string | null }) =>
    unwrap(http.post<SelfAttendanceResult>('/self/attendance/check-in', payload)),
  checkOut: (payload: { attendanceDate?: string | null; note?: string | null }) =>
    unwrap(http.post<SelfAttendanceResult>('/self/attendance/check-out', payload)),
  selectShift: (payload: { openShiftSlotId: number }) => unwrap(http.post<SelfShiftSelectResult>('/self/shift-board/select', payload)),
  cancelShift: (scheduleId: number) => unwrap(http.post<void>(`/self/shift-board/cancel/${scheduleId}`, {})),
}

export const shiftOpenSlotApi = {
  list: (params?: QueryParams) => unwrap(http.get<ShiftOpenSlot[]>('/shift-open-slots', { params })),
  get: (id: number) => unwrap(http.get<ShiftOpenSlot>(`/shift-open-slots/${id}`)),
  create: (payload: { branchId: number; shiftId: number; slotDate: string; capacity: number; note?: string | null }) =>
    unwrap(http.post<ShiftOpenSlot>('/shift-open-slots', payload)),
  bulkCreate: (payload: { branchIds: number[]; shiftIds: number[]; slotDates: string[]; capacity: number; note?: string | null }) =>
    unwrap(http.post<ShiftOpenSlotBulkCreateResult>('/shift-open-slots/bulk', payload)),
  update: (id: number, payload: { branchId: number; shiftId: number; slotDate: string; capacity: number; note?: string | null }) =>
    unwrap(http.put<void>(`/shift-open-slots/${id}`, payload)),
  deactivate: (id: number) => unwrap(http.post<void>(`/shift-open-slots/${id}/deactivate`, {})),
  remove: (id: number) => unwrap(http.delete<void>(`/shift-open-slots/${id}`)),
}

export const publicRecruitmentApi = {
  open: () => unwrap(http.get<Recruitment[]>('/public/recruitments/open')),
  apply: (recruitmentId: number, payload: { fullName: string; phone?: string | null; email?: string | null; note?: string | null }) =>
    unwrap(http.post(`/public/recruitments/${recruitmentId}/apply`, payload)),
}

export const reportsApi = {
  summary: (month?: number, year?: number, branchId?: number) =>
    unwrap(http.get<ReportSummary>('/reports/summary', { params: { month, year, branchId } })),
  exportEmployeesCsv: () => http.get('/reports/employees/csv', { responseType: 'blob' }).then((response) => response.data as Blob),
  exportAttendanceCsv: (month?: number, year?: number) =>
    http.get('/reports/attendance/csv', { params: { month, year }, responseType: 'blob' }).then((response) => response.data as Blob),
}

function activeOptions<T extends { id: number; isActive?: boolean }>(rows: T[], toLabel: (row: T) => string): OptionItem[] {
  return rows
    .filter((row) => row.isActive !== false)
    .map((row) => ({ value: String(row.id), label: toLabel(row) }))
}

export const optionApi = {
  branchOptions: async (): Promise<OptionItem[]> => branchApi.list().then((rows) => activeOptions(rows, (row) => `${row.branchCode} - ${row.branchName}`)),
  roleOptions: async (): Promise<OptionItem[]> => roleApi.list().then((rows) => activeOptions(rows, (row) => row.roleName)),
  systemRoleOptions: async (): Promise<OptionItem[]> => systemRoleApi.list().then((rows) => activeOptions(rows, (row) => `${row.code} - ${row.name}`)),
  permissionOptions: async (): Promise<OptionItem[]> =>
    permissionApi.list().then((rows) => rows.map((row) => ({ value: String(row.id), label: `${row.name} (${row.code})` }))),
  shiftOptions: async (): Promise<OptionItem[]> => shiftApi.list().then((rows) => activeOptions(rows, (row) => `${row.shiftCode} - ${row.shiftName}`)),
  employeeOptions: async (): Promise<OptionItem[]> => employeeApi.list().then((rows) => activeOptions(rows, (row) => `${row.employeeCode} - ${row.fullName}`)),
  activeContractOptions: async (): Promise<OptionItem[]> =>
    employeeContractApi.list().then((rows) => activeOptions(rows, (row) => `${row.contractNo} - ${row.employee?.fullName ?? `NV #${row.employeeId}`}`)),
  recruitmentOptions: async (): Promise<OptionItem[]> =>
    recruitmentApi.list().then((rows) => rows.map((row) => ({ value: String(row.id), label: `${row.positionTitle} - ${row.status}` }))),
  trainingOptions: async (): Promise<OptionItem[]> => trainingApi.list().then((rows) => activeOptions(rows, (row) => `${row.trainingCode} - ${row.trainingName}`)),
  payrollOptions: async (): Promise<OptionItem[]> =>
    payrollApi.list().then((rows) => rows.map((row) => ({ value: String(row.id), label: `${row.payrollMonth}/${row.payrollYear} - ${row.employee?.fullName ?? `NV #${row.employeeId}`}` }))),
  scheduleOptions: async (): Promise<OptionItem[]> =>
    scheduleApi.list().then((rows) => rows.map((row) => ({ value: String(row.id), label: `${row.employee?.fullName ?? `NV #${row.employeeId}`} - ${row.scheduleDate}` }))),
  userAccountOptions: async (): Promise<OptionItem[]> =>
    userAccountApi.list().then((rows) => activeOptions(rows, (row) => `${row.username} - ${row.employee?.fullName ?? `NV #${row.employeeId}`}`)),
}

export const api = {
  auth: authApi,
  branches: branchApi,
  roles: roleApi,
  systemRoles: systemRoleApi,
  permissions: permissionApi,
  shifts: shiftApi,
  employees: employeeApi,
  employeeContracts: employeeContractApi,
  userAccounts: userAccountApi,
  schedules: scheduleApi,
  attendance: attendanceApi,
  payroll: payrollApi,
  selfPortal: selfPortalApi,
  shiftOpenSlots: shiftOpenSlotApi,
  publicRecruitments: publicRecruitmentApi,
  recruitments: recruitmentApi,
  candidates: candidateApi,
  trainings: trainingApi,
  employeeTrainings: employeeTrainingApi,
  kpis: kpiApi,
  leaveRequests: leaveRequestApi,
  shiftSwaps: shiftSwapApi,
  attendanceAdjustments: attendanceAdjustmentApi,
  auditLogs: auditLogApi,
  reports: reportsApi,
  options: optionApi,
}

export type Api = typeof api
