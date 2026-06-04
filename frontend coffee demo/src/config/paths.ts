export const paths = {
  publicHome: '/',
  userLogin: '/nhan-vien/dang-nhap',
  employeePortal: '/nhan-vien',
  recruitment: '/tuyen-dung',
  adminRoot: '/admin',
  adminLogin: '/admin/dang-nhap',
  adminDashboard: '/admin/dashboard',
  legacyLogin: '/dang-nhap',
  legacyEmployeePortal: '/employee-portal',
  legacyRecruitment: '/careers',
  legacyLoginOld: '/login',
  legacyDashboard: '/dashboard',
  legacyReports: '/reports',
  legacyProfile: '/profile',
  legacyBranches: '/branches',
  legacyRoles: '/roles',
  legacySystemRoles: '/system-roles',
  legacyShifts: '/shifts',
  legacyEmployees: '/employees',
  legacyEmployeeContracts: '/employee-contracts',
  legacyUserAccounts: '/user-accounts',
  legacySchedules: '/schedules',
  legacyAttendance: '/attendance',
  legacyAttendanceAdjustments: '/attendance-adjustments',
  legacyPayroll: '/payroll',
  legacyPayrollDetails: '/payroll-details',
  legacyLeaveRequests: '/leave-requests',
  legacyShiftSwaps: '/shift-swaps',
  legacyRecruitments: '/recruitments',
  legacyCandidates: '/candidates',
  legacyTrainings: '/trainings',
  legacyEmployeeTrainings: '/employee-trainings',
  legacyKpis: '/kpis',
  legacyAuditLogs: '/audit-logs',
} as const

export function adminPath(path: string) {
  if (!path.startsWith('/')) {
    return `${paths.adminRoot}/${path}`
  }

  return `${paths.adminRoot}${path}`
}
