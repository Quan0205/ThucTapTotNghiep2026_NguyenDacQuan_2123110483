import {
  BranchesPage,
  CandidatesPage,
  EmployeeContractsPage,
  EmployeeTrainingsPage,
  EmployeesPage,
  KPIsPage,
  RecruitmentsPage,
  RolesPage,
  ShiftsPage,
  SystemRolesPage,
  TrainingsPage,
  UserAccountsPage,
} from '../pages/resourcePages'
import { AttendanceAdjustmentsPage } from '../pages/AttendanceAdjustmentsPage'
import { AttendancePage } from '../pages/AttendancePage'
import { AuditLogsPage } from '../pages/AuditLogsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LeaveRequestsPage } from '../pages/LeaveRequestsPage'
import { PayrollDetailsPage } from '../pages/PayrollDetailsPage'
import { PayrollPage } from '../pages/PayrollPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ReportsPage } from '../pages/ReportsPage'
import { ShiftOpenSlotsPage } from '../pages/ShiftOpenSlotsPage'
import { SchedulesPage } from '../pages/SchedulesPage'
import { ShiftSwapRequestsPage } from '../pages/ShiftSwapRequestsPage'

export const routes = [
  { path: 'dashboard', component: DashboardPage, permissions: ['dashboard.view'] },
  { path: 'profile', component: ProfilePage, permissions: ['profile.view'] },
  { path: 'reports', component: ReportsPage, permissions: ['reports.view'] },
  { path: 'branches', component: BranchesPage, permissions: ['master.branches.manage'] },
  { path: 'roles', component: RolesPage, permissions: ['master.positions.manage'] },
  { path: 'system-roles', component: SystemRolesPage, permissions: ['security.accounts.manage'] },
  { path: 'employees', component: EmployeesPage, permissions: ['hr.employees.manage'] },
  { path: 'shifts', component: ShiftsPage, permissions: ['master.shifts.manage'] },
  { path: 'employee-contracts', component: EmployeeContractsPage, permissions: ['hr.contracts.manage'] },
  { path: 'user-accounts', component: UserAccountsPage, permissions: ['security.accounts.manage'] },
  { path: 'schedules', component: SchedulesPage, permissions: ['ops.schedules.manage'] },
  { path: 'shift-open-slots', component: ShiftOpenSlotsPage, permissions: ['ops.schedules.manage'] },
  { path: 'attendance', component: AttendancePage, permissions: ['ops.attendance.manage'] },
  { path: 'attendance-adjustments', component: AttendanceAdjustmentsPage, permissions: ['attendance.adjust.manage'] },
  { path: 'payroll', component: PayrollPage, permissions: ['payroll.manage'] },
  { path: 'payroll-details', component: PayrollDetailsPage, permissions: ['payroll.manage'] },
  { path: 'leave-requests', component: LeaveRequestsPage, permissions: ['leave.manage'] },
  { path: 'shift-swaps', component: ShiftSwapRequestsPage, permissions: ['shift.swap.manage'] },
  { path: 'recruitments', component: RecruitmentsPage, permissions: ['recruitment.manage'] },
  { path: 'candidates', component: CandidatesPage, permissions: ['recruitment.manage'] },
  { path: 'trainings', component: TrainingsPage, permissions: ['training.manage'] },
  { path: 'employee-trainings', component: EmployeeTrainingsPage, permissions: ['training.manage'] },
  { path: 'kpis', component: KPIsPage, permissions: ['kpi.manage'] },
  { path: 'audit-logs', component: AuditLogsPage, permissions: ['audit.view'] },
] as const
