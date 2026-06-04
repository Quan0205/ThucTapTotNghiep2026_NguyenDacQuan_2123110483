import { Badge } from '../components/ui/Badge'
import type { TableColumn } from '../components/ui/Table'
import type { FieldConfig, FormValue } from '../components/ui/FormFields'
import { api } from '../api/coffeeApi'
import type {
  Branch,
  Candidate,
  Employee,
  EmployeeContract,
  EmployeeTraining,
  KPI,
  OptionItem,
  Recruitment,
  Role,
  Shift,
  SystemRole,
  Training,
  UserAccount,
} from '../types/models'
import {
  formatCandidateStatus,
  formatContractType,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatEmployeeTrainingStatus,
  formatGender,
  formatRecruitmentStatus,
} from '../utils/format'
import { buildPayloadFromFields, getInitialFormValues } from '../utils/form'

function crudConfig<TItem>(args: {
  title: string
  description: string
  emptyText: string
  searchPlaceholder: string
  addButtonLabel: string
  deleteLabel?: string
  fields: FieldConfig[]
  columns: Array<TableColumn<TItem>>
  fetchItems: () => Promise<TItem[]>
  createItem: (payload: any) => Promise<unknown>
  updateItem: (id: number, payload: any) => Promise<unknown>
  deleteItem: (id: number) => Promise<unknown>
  rowKey: (row: TItem) => number
  searchableFields: Array<(row: TItem) => string>
  lookupLoaders?: Record<string, () => Promise<OptionItem[]>>
}) {
  return {
    ...args,
    allowCreate: true,
    allowEdit: true,
    buildPayload: (values: Record<string, FormValue>) => buildPayloadFromFields(args.fields, values),
    mapItemToForm: (item: TItem) => getInitialFormValues(args.fields, item as Record<string, unknown>),
  }
}

const yesNoBadge = (value: boolean) => <Badge tone={value ? 'success' : 'danger'}>{value ? 'Đang hoạt động' : 'Ngừng hoạt động'}</Badge>

export const branchesConfig = crudConfig<Branch>({
  title: 'Chi nhánh',
  description: 'Danh sách các cửa hàng/chi nhánh trong hệ thống CoffeeHRM.',
  emptyText: 'Chưa có chi nhánh nào.',
  searchPlaceholder: 'Tìm theo mã, tên, địa chỉ...',
  addButtonLabel: 'Thêm chi nhánh',
  deleteLabel: 'Ngừng hoạt động',
  rowKey: (row) => row.id,
  fields: [
    { name: 'branchCode', label: 'Mã chi nhánh', type: 'text', required: true },
    { name: 'branchName', label: 'Tên chi nhánh', type: 'text', required: true },
    { name: 'address', label: 'Địa chỉ', type: 'textarea', required: true, rows: 3 },
    { name: 'phone', label: 'Số điện thoại', type: 'text', nullable: true },
    { name: 'isActive', label: 'Đang hoạt động', type: 'checkbox' },
  ],
  columns: [
    { key: 'branchCode', label: 'Mã chi nhánh' },
    { key: 'branchName', label: 'Tên chi nhánh' },
    { key: 'address', label: 'Địa chỉ', className: 'max-w-[320px] truncate' },
    { key: 'phone', label: 'Điện thoại' },
    { key: 'status', label: 'Trạng thái', render: (row) => yesNoBadge(row.isActive) },
  ],
  fetchItems: () => api.branches.list(),
  createItem: (payload) => api.branches.create(payload),
  updateItem: (id, payload) => api.branches.update(id, payload),
  deleteItem: (id) => api.branches.remove(id),
  searchableFields: [
    (row) => row.branchCode,
    (row) => row.branchName,
    (row) => row.address,
    (row) => row.phone ?? '',
  ],
})

export const rolesConfig = crudConfig<Role>({
  title: 'Chức vụ',
  description: 'Quản lý nhóm quyền hoặc chức danh nhân sự.',
  emptyText: 'Chưa có chức vụ nào.',
  searchPlaceholder: 'Tìm theo tên chức vụ...',
  addButtonLabel: 'Thêm chức vụ',
  deleteLabel: 'Ngừng hoạt động',
  rowKey: (row) => row.id,
  fields: [
    { name: 'roleName', label: 'Tên chức vụ', type: 'text', required: true },
    { name: 'description', label: 'Mô tả', type: 'textarea', nullable: true, rows: 3 },
    { name: 'isActive', label: 'Đang hoạt động', type: 'checkbox' },
  ],
  columns: [
    { key: 'roleName', label: 'Tên chức vụ' },
    { key: 'description', label: 'Mô tả', className: 'max-w-[360px] truncate' },
    { key: 'status', label: 'Trạng thái', render: (row) => yesNoBadge(row.isActive) },
  ],
  fetchItems: () => api.roles.list(),
  createItem: (payload) => api.roles.create(payload),
  updateItem: (id, payload) => api.roles.update(id, payload),
  deleteItem: (id) => api.roles.remove(id),
  searchableFields: [(row) => row.roleName, (row) => row.description ?? ''],
})

export const systemRolesConfig = crudConfig<SystemRole>({
  title: 'Vai trò hệ thống',
  description: 'Phân quyền đăng nhập cho tài khoản.',
  emptyText: 'Chưa có vai trò hệ thống nào.',
  searchPlaceholder: 'Tìm theo mã, tên...',
  addButtonLabel: 'Thêm vai trò',
  deleteLabel: 'Vô hiệu hóa',
  rowKey: (row) => row.id,
  fields: [
    { name: 'code', label: 'Mã', type: 'text', required: true },
    { name: 'name', label: 'Tên', type: 'text', required: true },
    { name: 'description', label: 'Mô tả', type: 'textarea', nullable: true, rows: 3 },
    {
      name: 'permissionIds',
      label: 'Permissions',
      type: 'multiselect',
      required: true,
      options: (lookups) => lookups.permissions ?? [],
      helpText: 'Giữ Ctrl hoặc Shift để chọn nhiều quyền.',
    },
    { name: 'isActive', label: 'Đang hoạt động', type: 'checkbox' },
  ],
  columns: [
    { key: 'code', label: 'Mã' },
    { key: 'name', label: 'Tên vai trò' },
    { key: 'description', label: 'Mô tả', className: 'max-w-[360px] truncate' },
    {
      key: 'permissions',
      label: 'Số quyền',
      render: (row) => `${row.systemRolePermissions?.length ?? row.permissionIds?.length ?? 0} quyền`,
    },
    { key: 'status', label: 'Trạng thái', render: (row) => yesNoBadge(row.isActive) },
  ],
  fetchItems: () => api.systemRoles.list(),
  createItem: (payload) => api.systemRoles.create(payload),
  updateItem: (id, payload) => api.systemRoles.update(id, payload),
  deleteItem: (id) => api.systemRoles.remove(id),
  searchableFields: [(row) => row.code, (row) => row.name, (row) => row.description ?? ''],
  lookupLoaders: {
    permissions: api.options.permissionOptions,
  },
})

export const shiftsConfig = crudConfig<Shift>({
  title: 'Ca làm',
  description: 'Khai báo ca làm chuẩn cho lịch và chấm công.',
  emptyText: 'Chưa có ca làm nào.',
  searchPlaceholder: 'Tìm theo mã, tên ca...',
  addButtonLabel: 'Thêm ca',
  deleteLabel: 'Ngừng hoạt động',
  rowKey: (row) => row.id,
  fields: [
    { name: 'shiftCode', label: 'Mã ca', type: 'text', required: true },
    { name: 'shiftName', label: 'Tên ca', type: 'text', required: true },
    { name: 'startTime', label: 'Giờ bắt đầu', type: 'time', required: true },
    { name: 'endTime', label: 'Giờ kết thúc', type: 'time', required: true },
    { name: 'graceMinutes', label: 'Phút trễ cho phép', type: 'number', required: true, min: 0 },
    { name: 'isActive', label: 'Đang hoạt động', type: 'checkbox' },
  ],
  columns: [
    { key: 'shiftCode', label: 'Mã ca' },
    { key: 'shiftName', label: 'Tên ca' },
    {
      key: 'time',
      label: 'Khung giờ',
      render: (row) => `${row.startTime.slice(0, 5)} - ${row.endTime.slice(0, 5)}`,
    },
    { key: 'graceMinutes', label: 'Grace (phút)' },
    { key: 'status', label: 'Trạng thái', render: (row) => yesNoBadge(row.isActive) },
  ],
  fetchItems: () => api.shifts.list(),
  createItem: (payload) => api.shifts.create(payload),
  updateItem: (id, payload) => api.shifts.update(id, payload),
  deleteItem: (id) => api.shifts.remove(id),
  searchableFields: [(row) => row.shiftCode, (row) => row.shiftName],
})

export const employeesConfig = crudConfig<Employee>({
  title: 'Nhân viên',
  description: 'Danh sách nhân sự đang làm việc trong hệ thống.',
  emptyText: 'Chưa có nhân viên nào.',
  searchPlaceholder: 'Tìm theo mã, tên, email...',
  addButtonLabel: 'Thêm nhân viên',
  deleteLabel: 'Xóa nhân viên',
  rowKey: (row) => row.id,
  fields: [
    { name: 'employeeCode', label: 'Mã nhân viên', type: 'text', required: true },
    { name: 'fullName', label: 'Họ và tên', type: 'text', required: true },
    {
      name: 'gender',
      label: 'Giới tính',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Nam' },
        { value: '2', label: 'Nữ' },
        { value: '3', label: 'Khác' },
      ],
    },
    { name: 'dateOfBirth', label: 'Ngày sinh', type: 'date', nullable: true },
    { name: 'phone', label: 'Số điện thoại', type: 'text', nullable: true },
    { name: 'email', label: 'Email', type: 'text', nullable: true },
    { name: 'address', label: 'Địa chỉ', type: 'textarea', nullable: true, rows: 3 },
    {
      name: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      required: true,
      options: (lookups) => lookups.branches ?? [],
    },
    {
      name: 'roleId',
      label: 'Chức vụ',
      type: 'select',
      required: true,
      options: (lookups) => lookups.roles ?? [],
    },
    { name: 'hireDate', label: 'Ngày vào làm', type: 'date', required: true },
    { name: 'isActive', label: 'Đang làm việc', type: 'checkbox' },
  ],
  columns: [
    { key: 'employeeCode', label: 'Mã NV' },
    { key: 'fullName', label: 'Họ và tên' },
    { key: 'gender', label: 'Giới tính', render: (row) => formatGender(row.gender) },
    { key: 'branch', label: 'Chi nhánh', render: (row) => row.branch?.branchName ?? '—' },
    { key: 'role', label: 'Chức vụ', render: (row) => row.role?.roleName ?? '—' },
    { key: 'status', label: 'Trạng thái', render: (row) => yesNoBadge(row.isActive) },
  ],
  fetchItems: () => api.employees.list(),
  createItem: (payload) => api.employees.create(payload),
  updateItem: (id, payload) => api.employees.update(id, payload),
  deleteItem: (id) => api.employees.remove(id),
  searchableFields: [
    (row) => row.employeeCode,
    (row) => row.fullName,
    (row) => row.phone ?? '',
    (row) => row.email ?? '',
    (row) => row.branch?.branchName ?? '',
    (row) => row.role?.roleName ?? '',
  ],
  lookupLoaders: {
    branches: api.options.branchOptions,
    roles: api.options.roleOptions,
  },
})

export const employeeContractsConfig = crudConfig<EmployeeContract>({
  title: 'Hợp đồng nhân viên',
  description: 'Khai báo hợp đồng, mức lương và phụ cấp theo nhân sự.',
  emptyText: 'Chưa có hợp đồng nào.',
  searchPlaceholder: 'Tìm theo số hợp đồng, tên nhân viên...',
  addButtonLabel: 'Thêm hợp đồng',
  deleteLabel: 'Vô hiệu hóa',
  rowKey: (row) => row.id,
  fields: [
    { name: 'contractNo', label: 'Số hợp đồng', type: 'text', required: true },
    {
      name: 'contractType',
      label: 'Loại hợp đồng',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Toàn thời gian' },
        { value: '2', label: 'Bán thời gian' },
        { value: '3', label: 'Thử việc' },
        { value: '4', label: 'Thực tập' },
      ],
    },
    {
      name: 'employeeId',
      label: 'Nhân viên',
      type: 'select',
      required: true,
      options: (lookups) => lookups.employees ?? [],
    },
    { name: 'startDate', label: 'Ngày bắt đầu', type: 'date', required: true },
    { name: 'endDate', label: 'Ngày kết thúc', type: 'date', nullable: true },
    { name: 'baseSalary', label: 'Lương cơ bản', type: 'number', required: true, min: 0, step: 1000 },
    { name: 'hourlyRate', label: 'Đơn giá giờ', type: 'number', required: true, min: 0, step: 1000 },
    { name: 'overtimeRateMultiplier', label: 'Hệ số OT', type: 'number', required: true, min: 0, step: 0.01 },
    { name: 'latePenaltyPerMinute', label: 'Phạt đi muộn / phút', type: 'number', required: true, min: 0, step: 100 },
    { name: 'earlyLeavePenaltyPerMinute', label: 'Phạt về sớm / phút', type: 'number', required: true, min: 0, step: 100 },
    { name: 'standardDailyHours', label: 'Giờ chuẩn/ngày', type: 'number', required: true, min: 1, step: 0.5 },
    { name: 'isActive', label: 'Đang hiệu lực', type: 'checkbox' },
  ],
  columns: [
    { key: 'contractNo', label: 'Số hợp đồng' },
    { key: 'contractType', label: 'Loại', render: (row) => formatContractType(row.contractType) },
    { key: 'employee', label: 'Nhân viên', render: (row) => row.employee?.fullName ?? '—' },
    { key: 'startDate', label: 'Bắt đầu', render: (row) => formatDate(row.startDate) },
    { key: 'endDate', label: 'Kết thúc', render: (row) => formatDate(row.endDate) },
    { key: 'baseSalary', label: 'Lương cơ bản', render: (row) => formatCurrency(row.baseSalary) },
    { key: 'status', label: 'Trạng thái', render: (row) => yesNoBadge(row.isActive) },
  ],
  fetchItems: () => api.employeeContracts.list(),
  createItem: (payload) => api.employeeContracts.create(payload),
  updateItem: (id, payload) => api.employeeContracts.update(id, payload),
  deleteItem: (id) => api.employeeContracts.remove(id),
  searchableFields: [
    (row) => row.contractNo,
    (row) => row.employee?.fullName ?? '',
    (row) => row.employee?.employeeCode ?? '',
  ],
  lookupLoaders: {
    employees: api.options.employeeOptions,
  },
})

export const userAccountsConfig = crudConfig<UserAccount>({
  title: 'Tài khoản người dùng',
  description: 'Tài khoản đăng nhập demo cho nhân viên và phân quyền.',
  emptyText: 'Chưa có tài khoản nào.',
  searchPlaceholder: 'Tìm theo username, tên nhân viên...',
  addButtonLabel: 'Thêm tài khoản',
  deleteLabel: 'Vô hiệu hóa',
  rowKey: (row) => row.id,
  fields: [
    {
      name: 'employeeId',
      label: 'Nhân viên',
      type: 'select',
      required: true,
      options: (lookups) => lookups.employees ?? [],
    },
    {
      name: 'roleId',
      label: 'Vai trò',
      type: 'select',
      required: true,
      options: (lookups) => lookups.roles ?? [],
    },
    {
      name: 'systemRoleId',
      label: 'Vai trò hệ thống',
      type: 'select',
      nullable: true,
      options: (lookups) => [{ value: '', label: 'Tự suy luận theo chức vụ' }, ...(lookups.systemRoles ?? [])],
    },
    { name: 'username', label: 'Tên đăng nhập', type: 'text', required: true },
    {
      name: 'password',
      label: 'Mật khẩu mới',
      type: 'password',
      requiredOnCreateOnly: true,
      helpText: 'Khi sửa, để trống nếu không muốn đổi mật khẩu.',
    },
    { name: 'isActive', label: 'Đang hoạt động', type: 'checkbox' },
    { name: 'lastLoginAt', label: 'Đăng nhập gần nhất', type: 'datetime-local', nullable: true },
  ],
  columns: [
    { key: 'username', label: 'Username' },
    { key: 'employee', label: 'Nhân viên', render: (row) => row.employee?.fullName ?? '—' },
    { key: 'role', label: 'Chức vụ', render: (row) => row.role?.roleName ?? '—' },
    { key: 'systemRole', label: 'Vai trò hệ thống', render: (row) => row.systemRole?.name ?? '—' },
    { key: 'lastLoginAt', label: 'Lần đăng nhập', render: (row) => formatDateTime(row.lastLoginAt) },
    { key: 'status', label: 'Trạng thái', render: (row) => yesNoBadge(row.isActive) },
  ],
  fetchItems: () => api.userAccounts.list(),
  createItem: (payload) => api.userAccounts.create(payload),
  updateItem: (id, payload) => api.userAccounts.update(id, payload),
  deleteItem: (id) => api.userAccounts.remove(id),
  searchableFields: [
    (row) => row.username,
    (row) => row.employee?.fullName ?? '',
    (row) => row.role?.roleName ?? '',
  ],
  lookupLoaders: {
    employees: api.options.employeeOptions,
    roles: api.options.roleOptions,
    systemRoles: api.options.systemRoleOptions,
  },
})

export const recruitmentsConfig = crudConfig<Recruitment>({
  title: 'Đợt tuyển dụng',
  description: 'Quản lý tin tuyển dụng theo chi nhánh và vị trí.',
  emptyText: 'Chưa có đợt tuyển dụng nào.',
  searchPlaceholder: 'Tìm theo vị trí, chi nhánh...',
  addButtonLabel: 'Thêm đợt tuyển dụng',
  deleteLabel: 'Đóng đợt tuyển',
  rowKey: (row) => row.id,
  fields: [
    {
      name: 'branchId',
      label: 'Chi nhánh',
      type: 'select',
      nullable: true,
      options: (lookups) => [{ value: '', label: 'Không gắn chi nhánh' }, ...(lookups.branches ?? [])],
    },
    { name: 'positionTitle', label: 'Vị trí tuyển dụng', type: 'text', required: true },
    { name: 'openDate', label: 'Ngày mở', type: 'date', required: true },
    { name: 'closeDate', label: 'Ngày đóng', type: 'date', nullable: true },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Nháp' },
        { value: '2', label: 'Mở' },
        { value: '3', label: 'Đang tuyển' },
        { value: '4', label: 'Đã đóng' },
        { value: '5', label: 'Đã hủy' },
      ],
    },
    { name: 'description', label: 'Mô tả', type: 'textarea', nullable: true, rows: 4 },
  ],
  columns: [
    { key: 'positionTitle', label: 'Vị trí' },
    { key: 'branch', label: 'Chi nhánh', render: (row) => row.branch?.branchName ?? '—' },
    { key: 'openDate', label: 'Ngày mở', render: (row) => formatDate(row.openDate) },
    { key: 'closeDate', label: 'Ngày đóng', render: (row) => formatDate(row.closeDate) },
    { key: 'status', label: 'Trạng thái', render: (row) => <Badge>{formatRecruitmentStatus(row.status)}</Badge> },
  ],
  fetchItems: () => api.recruitments.list(),
  createItem: (payload) => api.recruitments.create(payload),
  updateItem: (id, payload) => api.recruitments.update(id, payload),
  deleteItem: (id) => api.recruitments.remove(id),
  searchableFields: [
    (row) => row.positionTitle,
    (row) => row.branch?.branchName ?? '',
    (row) => row.description ?? '',
  ],
  lookupLoaders: {
    branches: api.options.branchOptions,
  },
})

export const candidatesConfig = crudConfig<Candidate>({
  title: 'Ứng viên',
  description: 'Danh sách ứng viên theo từng đợt tuyển dụng.',
  emptyText: 'Chưa có ứng viên nào.',
  searchPlaceholder: 'Tìm theo tên, email, số điện thoại...',
  addButtonLabel: 'Thêm ứng viên',
  deleteLabel: 'Xóa ứng viên',
  rowKey: (row) => row.id,
  fields: [
    {
      name: 'recruitmentId',
      label: 'Đợt tuyển dụng',
      type: 'select',
      required: true,
      options: (lookups) => lookups.recruitments ?? [],
    },
    { name: 'fullName', label: 'Họ và tên', type: 'text', required: true },
    { name: 'phone', label: 'Số điện thoại', type: 'text', nullable: true },
    { name: 'email', label: 'Email', type: 'text', nullable: true },
    { name: 'appliedDate', label: 'Ngày ứng tuyển', type: 'date', required: true },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Đã ứng tuyển' },
        { value: '2', label: 'Sơ loại' },
        { value: '3', label: 'Phỏng vấn' },
        { value: '4', label: 'Đề nghị' },
        { value: '5', label: 'Đã nhận' },
        { value: '6', label: 'Từ chối' },
        { value: '7', label: 'Rút lui' },
      ],
    },
    { name: 'interviewScore', label: 'Điểm phỏng vấn', type: 'number', nullable: true, min: 0, max: 10, step: 0.1 },
    { name: 'note', label: 'Ghi chú', type: 'textarea', nullable: true, rows: 3 },
  ],
  columns: [
    { key: 'fullName', label: 'Họ và tên' },
    { key: 'recruitment', label: 'Đợt tuyển dụng', render: (row) => row.recruitment?.positionTitle ?? '—' },
    { key: 'appliedDate', label: 'Ngày ứng tuyển', render: (row) => formatDate(row.appliedDate) },
    { key: 'status', label: 'Trạng thái', render: (row) => <Badge>{formatCandidateStatus(row.status)}</Badge> },
    { key: 'interviewScore', label: 'Điểm', render: (row) => row.interviewScore?.toString() ?? '—' },
  ],
  fetchItems: () => api.candidates.list(),
  createItem: (payload) => api.candidates.create(payload),
  updateItem: (id, payload) => api.candidates.update(id, payload),
  deleteItem: (id) => api.candidates.remove(id),
  searchableFields: [
    (row) => row.fullName,
    (row) => row.phone ?? '',
    (row) => row.email ?? '',
    (row) => row.recruitment?.positionTitle ?? '',
  ],
  lookupLoaders: {
    recruitments: api.options.recruitmentOptions,
  },
})

export const trainingsConfig = crudConfig<Training>({
  title: 'Khóa đào tạo',
  description: 'Danh mục khóa học nội bộ cho nhân viên.',
  emptyText: 'Chưa có khóa đào tạo nào.',
  searchPlaceholder: 'Tìm theo mã, tên khóa...',
  addButtonLabel: 'Thêm khóa đào tạo',
  deleteLabel: 'Ngừng hoạt động',
  rowKey: (row) => row.id,
  fields: [
    { name: 'trainingCode', label: 'Mã khóa', type: 'text', required: true },
    { name: 'trainingName', label: 'Tên khóa', type: 'text', required: true },
    { name: 'description', label: 'Mô tả', type: 'textarea', nullable: true, rows: 3 },
    { name: 'startDate', label: 'Ngày bắt đầu', type: 'date', required: true },
    { name: 'endDate', label: 'Ngày kết thúc', type: 'date', nullable: true },
    { name: 'instructor', label: 'Giảng viên', type: 'text', nullable: true },
    { name: 'isRequired', label: 'Bắt buộc', type: 'checkbox' },
    { name: 'isActive', label: 'Đang hoạt động', type: 'checkbox' },
  ],
  columns: [
    { key: 'trainingCode', label: 'Mã khóa' },
    { key: 'trainingName', label: 'Tên khóa' },
    { key: 'startDate', label: 'Bắt đầu', render: (row) => formatDate(row.startDate) },
    { key: 'endDate', label: 'Kết thúc', render: (row) => formatDate(row.endDate) },
    { key: 'isRequired', label: 'Bắt buộc', render: (row) => yesNoBadge(row.isRequired) },
    { key: 'status', label: 'Trạng thái', render: (row) => yesNoBadge(row.isActive) },
  ],
  fetchItems: () => api.trainings.list(),
  createItem: (payload) => api.trainings.create(payload),
  updateItem: (id, payload) => api.trainings.update(id, payload),
  deleteItem: (id) => api.trainings.remove(id),
  searchableFields: [(row) => row.trainingCode, (row) => row.trainingName, (row) => row.instructor ?? ''],
})

export const employeeTrainingsConfig = crudConfig<EmployeeTraining>({
  title: 'Đào tạo nhân viên',
  description: 'Theo dõi phân công và kết quả đào tạo theo nhân viên.',
  emptyText: 'Chưa có phân công đào tạo nào.',
  searchPlaceholder: 'Tìm theo nhân viên, khóa học...',
  addButtonLabel: 'Thêm phân công',
  deleteLabel: 'Xóa phân công',
  rowKey: (row) => row.id,
  fields: [
    {
      name: 'employeeId',
      label: 'Nhân viên',
      type: 'select',
      required: true,
      options: (lookups) => lookups.employees ?? [],
    },
    {
      name: 'trainingId',
      label: 'Khóa đào tạo',
      type: 'select',
      required: true,
      options: (lookups) => lookups.trainings ?? [],
    },
    { name: 'assignedDate', label: 'Ngày phân công', type: 'date', required: true },
    { name: 'completedDate', label: 'Ngày hoàn thành', type: 'date', nullable: true },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      required: true,
      options: [
        { value: '1', label: 'Đã phân công' },
        { value: '2', label: 'Đang học' },
        { value: '3', label: 'Hoàn thành' },
        { value: '4', label: 'Không đạt' },
        { value: '5', label: 'Đã hủy' },
      ],
    },
    { name: 'score', label: 'Điểm số', type: 'number', nullable: true, min: 0, max: 100, step: 0.1 },
  ],
  columns: [
    { key: 'employee', label: 'Nhân viên', render: (row) => row.employee?.fullName ?? '—' },
    { key: 'training', label: 'Khóa học', render: (row) => row.training?.trainingName ?? '—' },
    { key: 'assignedDate', label: 'Ngày giao', render: (row) => formatDate(row.assignedDate) },
    { key: 'completedDate', label: 'Ngày xong', render: (row) => formatDate(row.completedDate) },
    { key: 'status', label: 'Trạng thái', render: (row) => <Badge>{formatEmployeeTrainingStatus(row.status)}</Badge> },
  ],
  fetchItems: () => api.employeeTrainings.list(),
  createItem: (payload) => api.employeeTrainings.create(payload),
  updateItem: (id, payload) => api.employeeTrainings.update(id, payload),
  deleteItem: (id) => api.employeeTrainings.remove(id),
  searchableFields: [
    (row) => row.employee?.fullName ?? '',
    (row) => row.training?.trainingName ?? '',
    (row) => row.training?.trainingCode ?? '',
  ],
  lookupLoaders: {
    employees: api.options.employeeOptions,
    trainings: api.options.trainingOptions,
  },
})

export const kpisConfig = crudConfig<KPI>({
  title: 'KPI',
  description: 'Chỉ số đánh giá nhân viên theo tháng/năm.',
  emptyText: 'Chưa có KPI nào.',
  searchPlaceholder: 'Tìm theo nhân viên, kết quả...',
  addButtonLabel: 'Thêm KPI',
  deleteLabel: 'Xóa KPI',
  rowKey: (row) => row.id,
  fields: [
    {
      name: 'employeeId',
      label: 'Nhân viên',
      type: 'select',
      required: true,
      options: (lookups) => lookups.employees ?? [],
    },
    { name: 'kpiYear', label: 'Năm', type: 'number', required: true, min: 2000, max: 2100 },
    { name: 'kpiMonth', label: 'Tháng', type: 'number', required: true, min: 1, max: 12 },
    { name: 'score', label: 'Điểm', type: 'number', required: true, min: 0, step: 0.1 },
    { name: 'target', label: 'Mục tiêu', type: 'number', required: true, min: 0, step: 0.1 },
    { name: 'result', label: 'Kết quả', type: 'text', required: true },
    { name: 'note', label: 'Ghi chú', type: 'textarea', nullable: true, rows: 3 },
  ],
  columns: [
    { key: 'employee', label: 'Nhân viên', render: (row) => row.employee?.fullName ?? '—' },
    { key: 'period', label: 'Kỳ', render: (row) => `${row.kpiMonth}/${row.kpiYear}` },
    { key: 'score', label: 'Điểm' },
    { key: 'target', label: 'Mục tiêu' },
    { key: 'result', label: 'Kết quả' },
  ],
  fetchItems: () => api.kpis.list(),
  createItem: (payload) => api.kpis.create(payload),
  updateItem: (id, payload) => api.kpis.update(id, payload),
  deleteItem: (id) => api.kpis.remove(id),
  searchableFields: [
    (row) => row.employee?.fullName ?? '',
    (row) => row.result,
    (row) => row.note ?? '',
  ],
  lookupLoaders: {
    employees: api.options.employeeOptions,
  },
})

export const genericResourceConfigs = {
  branches: branchesConfig,
  roles: rolesConfig,
  shifts: shiftsConfig,
  employees: employeesConfig,
  employeeContracts: employeeContractsConfig,
  userAccounts: userAccountsConfig,
  recruitments: recruitmentsConfig,
  candidates: candidatesConfig,
  trainings: trainingsConfig,
  employeeTrainings: employeeTrainingsConfig,
  kpis: kpisConfig,
}
