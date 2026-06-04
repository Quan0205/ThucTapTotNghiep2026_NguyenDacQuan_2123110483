import { CrudPage } from '../components/CrudPage'
import {
  branchesConfig,
  candidatesConfig,
  employeeContractsConfig,
  employeeTrainingsConfig,
  employeesConfig,
  kpisConfig,
  recruitmentsConfig,
  rolesConfig,
  systemRolesConfig,
  shiftsConfig,
  trainingsConfig,
  userAccountsConfig,
} from '../config/resourceConfigs'

export function BranchesPage() {
  return <CrudPage config={branchesConfig} />
}

export function RolesPage() {
  return <CrudPage config={rolesConfig} />
}

export function SystemRolesPage() {
  return <CrudPage config={systemRolesConfig} />
}

export function ShiftsPage() {
  return <CrudPage config={shiftsConfig} />
}

export function EmployeesPage() {
  return <CrudPage config={employeesConfig} />
}

export function EmployeeContractsPage() {
  return <CrudPage config={employeeContractsConfig} />
}

export function UserAccountsPage() {
  return <CrudPage config={userAccountsConfig} />
}

export function RecruitmentsPage() {
  return <CrudPage config={recruitmentsConfig} />
}

export function CandidatesPage() {
  return <CrudPage config={candidatesConfig} />
}

export function TrainingsPage() {
  return <CrudPage config={trainingsConfig} />
}

export function EmployeeTrainingsPage() {
  return <CrudPage config={employeeTrainingsConfig} />
}

export function KPIsPage() {
  return <CrudPage config={kpisConfig} />
}
