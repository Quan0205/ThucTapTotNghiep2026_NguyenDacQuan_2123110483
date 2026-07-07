export type GenderType = 1 | 2 | 3
export type AttendanceStatus = 1 | 2 | 3 | 4 | 5 | 6
export type PayrollStatus = 1 | 2 | 3 | 4 | 5
export type PayrollDetailType = 1 | 2 | 3 | 4 | 5 | 6
export type ContractType = 1 | 2 | 3 | 4
export type RecruitmentStatus = 1 | 2 | 3 | 4 | 5
export type CandidateStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type EmployeeTrainingStatus = 1 | 2 | 3 | 4 | 5
export type LeaveRequestStatus = 1 | 2 | 3 | 4
export type ShiftSwapStatus = 1 | 2 | 3 | 4
export type AttendanceAdjustmentStatus = 1 | 2 | 3 | 4

export interface Branch {
  id: number
  branchCode: string
  branchName: string
  address: string
  phone?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Role {
  id: number
  roleName: string
  description?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Permission {
  id: number
  code: string
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface SystemRolePermission {
  systemRoleId: number
  permissionId: number
  permission?: Permission | null
}

export interface SystemRole {
  id: number
  code: string
  name: string
  description?: string | null
  isActive: boolean
  permissionIds?: number[]
  systemRolePermissions?: SystemRolePermission[]
  createdAt?: string
  updatedAt?: string
}

export interface Shift {
  id: number
  shiftCode: string
  shiftName: string
  startTime: string
  endTime: string
  graceMinutes: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ShiftOpenSlot {
  id: number
  branchId: number
  branchName: string
  shiftId: number
  shiftCode: string
  shiftName: string
  startTime: string
  endTime: string
  slotDate: string
  capacity: number
  selectedCount: number
  isFull: boolean
  isActive: boolean
  note?: string | null
  myScheduleId?: number | null
}

export interface Employee {
  id: number
  employeeCode: string
  fullName: string
  gender: GenderType
  dateOfBirth?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  branchId: number
  roleId: number
  hireDate: string
  isActive: boolean
  branch?: Branch | null
  role?: Role | null
  employeeContracts?: EmployeeContract[]
  userAccount?: UserAccount | null
  createdAt?: string
  updatedAt?: string
}

export interface EmployeeContract {
  id: number
  contractNo: string
  contractType: ContractType
  employeeId: number
  startDate: string
  endDate?: string | null
  baseSalary: number
  hourlyRate: number
  overtimeRateMultiplier: number
  latePenaltyPerMinute: number
  earlyLeavePenaltyPerMinute: number
  standardDailyHours: number
  isActive: boolean
  employee?: Employee | null
  createdAt?: string
  updatedAt?: string
}

export interface UserAccount {
  id: number
  employeeId: number
  roleId: number
  systemRoleId?: number | null
  username: string
  passwordHash: string
  isActive: boolean
  lastLoginAt?: string | null
  employee?: Employee | null
  role?: Role | null
  systemRole?: SystemRole | null
  createdAt?: string
  updatedAt?: string
}

export interface Schedule {
  id: number
  employeeId: number
  shiftId: number
  openShiftSlotId?: number | null
  scheduleDate: string
  note?: string | null
  employee?: Employee | null
  shift?: Shift | null
  openShiftSlot?: ShiftOpenSlot | null
  attendance?: Attendance | null
  createdAt?: string
  updatedAt?: string
}

export interface Attendance {
  id: number
  employeeId: number
  shiftId?: number | null
  scheduleId?: number | null
  attendanceDate: string
  checkInAt?: string | null
  checkOutAt?: string | null
  lateMinutes: number
  workingMinutes: number
  overtimeMinutes: number
  earlyLeaveMinutes: number
  status: AttendanceStatus
  note?: string | null
  employee?: Employee | null
  shift?: Shift | null
  schedule?: Schedule | null
  createdAt?: string
  updatedAt?: string
}

export interface Payroll {
  id: number
  employeeId: number
  employeeContractId: number
  payrollMonth: number
  payrollYear: number
  baseAmount: number
  workingHours: number
  hourlyRate: number
  overtimeAmount: number
  allowanceAmount: number
  bonusAmount: number
  penaltyAmount: number
  insuranceAmount: number
  taxAmount: number
  totalSalary: number
  status: PayrollStatus
  paidDate?: string | null
  approvedAt?: string | null
  approvedByUserAccountId?: number | null
  isClosed: boolean
  closedAt?: string | null
  closedByUserAccountId?: number | null
  note?: string | null
  employee?: Employee | null
  employeeContract?: EmployeeContract | null
  payrollDetails?: PayrollDetail[]
  createdAt?: string
  updatedAt?: string
}

export interface PayrollClosePeriod {
  id: number
  payrollMonth: number
  payrollYear: number
  isClosed: boolean
  closedAt?: string | null
  closedByUserAccountId?: number | null
  note?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PayrollDetail {
  id: number
  payrollId: number
  detailType: PayrollDetailType
  attendanceId?: number | null
  scheduleId?: number | null
  sourceReferenceId?: number | null
  description: string
  amount: number
  note?: string | null
  payroll?: Payroll | null
  attendance?: Attendance | null
  schedule?: Schedule | null
  createdAt?: string
  updatedAt?: string
}

export interface Recruitment {
  id: number
  branchId?: number | null
  positionTitle: string
  openDate: string
  closeDate?: string | null
  status: RecruitmentStatus
  description?: string | null
  branch?: Branch | null
  candidates?: Candidate[]
  createdAt?: string
  updatedAt?: string
}

export interface Candidate {
  id: number
  recruitmentId: number
  fullName: string
  phone?: string | null
  email?: string | null
  appliedDate: string
  status: CandidateStatus
  interviewScore?: number | null
  note?: string | null
  recruitment?: Recruitment | null
  createdAt?: string
  updatedAt?: string
}

export interface Training {
  id: number
  trainingCode: string
  trainingName: string
  description?: string | null
  startDate: string
  endDate?: string | null
  instructor?: string | null
  isRequired: boolean
  isActive: boolean
  employeeTrainings?: EmployeeTraining[]
  createdAt?: string
  updatedAt?: string
}

export interface EmployeeTraining {
  id: number
  employeeId: number
  trainingId: number
  assignedDate: string
  completedDate?: string | null
  status: EmployeeTrainingStatus
  score?: number | null
  employee?: Employee | null
  training?: Training | null
  createdAt?: string
  updatedAt?: string
}

export interface KPI {
  id: number
  employeeId: number
  kpiYear: number
  kpiMonth: number
  score: number
  target: number
  result: string
  note?: string | null
  employee?: Employee | null
  createdAt?: string
  updatedAt?: string
}

export interface LeaveRequest {
  id: number
  employeeId: number
  startDate: string
  endDate: string
  leaveType: string
  reason?: string | null
  totalDays: number
  status: LeaveRequestStatus
  reviewedByUserAccountId?: number | null
  reviewedAt?: string | null
  decisionNote?: string | null
  employee?: Employee | null
  reviewedByUserAccount?: UserAccount | null
  createdAt?: string
  updatedAt?: string
}

export interface ShiftSwapRequest {
  id: number
  requestEmployeeId: number
  targetEmployeeId: number
  requestScheduleId: number
  targetScheduleId: number
  reason?: string | null
  status: ShiftSwapStatus
  reviewedByUserAccountId?: number | null
  reviewedAt?: string | null
  decisionNote?: string | null
  requestEmployee?: Employee | null
  targetEmployee?: Employee | null
  requestSchedule?: Schedule | null
  targetSchedule?: Schedule | null
  createdAt?: string
  updatedAt?: string
}

export interface AttendanceAdjustment {
  id: number
  attendanceId: number
  employeeId: number
  requestedCheckInAt?: string | null
  requestedCheckOutAt?: string | null
  requestedStatus?: AttendanceStatus | null
  reason?: string | null
  status: AttendanceAdjustmentStatus
  reviewedByUserAccountId?: number | null
  reviewedAt?: string | null
  decisionNote?: string | null
  attendance?: Attendance | null
  employee?: Employee | null
  reviewedByUserAccount?: UserAccount | null
  createdAt?: string
  updatedAt?: string
}

export interface AuditLog {
  id: number
  userAccountId?: number | null
  action: string
  tableName: string
  recordId: string
  oldValues?: string | null
  newValues?: string | null
  ipAddress?: string | null
  userAccount?: UserAccount | null
  createdAt?: string
  updatedAt?: string
}

export interface ScheduleValidationResult {
  isValid: boolean
  message: string
}

export interface OptionItem {
  value: string
  label: string
}

export interface FilterState {
  [key: string]: string
}

export interface AuthUser {
  id: number
  username: string
  fullName: string
  employeeId: number
  employeeCode: string
  jobRoleName?: string | null
  systemRoleCode?: string | null
  systemRoleName?: string | null
  permissions: string[]
}

export interface AuthProfile {
  id: number
  username: string
  fullName: string
  employeeId: number
  employeeCode: string
  phone?: string | null
  email?: string | null
  branchName?: string | null
  jobRoleName?: string | null
  systemRoleCode?: string | null
  systemRoleName?: string | null
  lastLoginAt?: string | null
  permissions: string[]
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: AuthUser
}

export interface LoginRequest {
  username: string
  password: string
}

export interface ReportSummary {
  month: number
  year: number
  branchId?: number | null
  activeEmployees: number
  attendanceCount: number
  lateCount: number
  absentCount: number
  overtimeMinutes: number
  payrollCount: number
  payrollTotal: number
  approvedPayrollCount: number
  paidPayrollCount: number
  openRecruitments: number
  pendingLeaveRequests: number
  pendingShiftSwaps: number
  pendingAdjustments: number
}

export interface SelfPortalProfile {
  employeeId: number
  employeeCode: string
  fullName: string
  username: string
  branchName?: string | null
  roleName?: string | null
  systemRoleName?: string | null
  lastLoginAt?: string | null
}

export interface SelfPortalSchedule {
  id: number
  scheduleDate: string
  shiftId: number
  shiftCode: string
  shiftName: string
  startTime: string
  endTime: string
  graceMinutes: number
  note?: string | null
  attendanceId?: number | null
  attendanceStatus?: number | null
  checkInAt?: string | null
  checkOutAt?: string | null
}

export interface SelfShiftBoardSchedule {
  scheduleId: number
  openShiftSlotId: number
  scheduleDate: string
  shiftId: number
  shiftCode: string
  shiftName: string
  startTime: string
  endTime: string
  note?: string | null
  attendanceId?: number | null
  attendanceStatus?: number | null
  checkInAt?: string | null
  checkOutAt?: string | null
}

export interface SelfShiftBoard {
  weekStart: string
  weekEnd: string
  slots: ShiftOpenSlot[]
  mySchedules: SelfShiftBoardSchedule[]
}

export interface SelfShiftSelectResult {
  message: string
  scheduleId: number
  openShiftSlotId: number
  slotDate: string
  capacity: number
  selectedCount: number
}

export interface ShiftOpenSlotBulkCreateResult {
  message: string
  requestedCount: number
  createdCount: number
  skippedCount: number
  slots: ShiftOpenSlot[]
}

export interface SelfPortalSummary {
  month: number
  year: number
  scheduleCount: number
  presentCount: number
  lateCount: number
  earlyLeaveCount: number
  overtimeCount: number
  absentCount: number
  workingMinutes: number
}

export interface SelfLeaveBalance {
  year: number
  annualAllowance: number
  usedDays: number
  pendingDays: number
  remainingDays: number
}

export interface SelfPortalOverview {
  profile: SelfPortalProfile
  schedules: SelfPortalSchedule[]
  summary: SelfPortalSummary
  leaveBalance: SelfLeaveBalance
}

export interface SelfPayrollSummary {
  id: number
  payrollMonth: number
  payrollYear: number
  totalSalary: number
  status: PayrollStatus
  isClosed: boolean
  paidDate?: string | null
  approvedAt?: string | null
  note?: string | null
}

export interface SelfAttendanceResult {
  message: string
  attendanceId: number
  attendanceDate: string
  status: AttendanceStatus
  lateMinutes: number
  workingMinutes: number
  overtimeMinutes: number
  earlyLeaveMinutes: number
}
