# BAO CAO PHAN TICH DU AN HRM COFFEEHRM

Tai lieu nay tong hop tu source code hien tai cua du an `NguyenDacQuan_2123110483`, gom backend ASP.NET Core, frontend React/Vite va SQL Server. Muc dich la phuc vu viet bao cao thuc tap tot nghiep nganh CNTT he Cao dang.

## 1. Tong Quan Du An

| Noi dung | Mo ta |
|---|---|
| Ten he thong | CoffeeHRM - He thong quan ly nhan su, ca lam, cham cong, nghi phep va tinh luong |
| Loai he thong | Website HRM cho doanh nghiep vua va nho, mo phong theo mo hinh chuoi cua hang/chi nhanh |
| Backend | ASP.NET Core Web API |
| Frontend | React + TypeScript + Vite |
| Database | SQL Server thong qua Entity Framework Core |
| Doi tuong ap dung | Doanh nghiep vua va nho, bo phan HR, quan ly chi nhanh, nhan vien, ke toan |

### Muc Tieu He Thong

He thong duoc xay dung nham so hoa cac nghiep vu quan ly nhan su co ban:

- Quan ly ho so nhan vien, chi nhanh/phong ban, chuc vu.
- Quan ly tai khoan dang nhap va phan quyen theo vai tro.
- Quan ly hop dong lao dong, ca lam, lich lam viec.
- Ghi nhan cham cong, tinh di tre, ve som, tang ca, vang mat.
- Quan ly don nghi phep, yeu cau doi ca, yeu cau dieu chinh cong.
- Tinh luong theo thang dua tren hop dong, gio cong, tang ca, thuong, phat, bao hiem/thue mo phong.
- Cung cap dashboard, bao cao tong hop va xuat CSV.
- Cung cap portal rieng cho nhan vien tu xem lich, cham cong, xem luong, gui yeu cau.

### Bai Toan He Thong Giai Quyet

Trong quan ly thu cong, thong tin nhan su thuong bi phan tan o file Excel, giay to, tin nhan. Viec tong hop cong, phep va luong mat nhieu thoi gian, de sai sot va kho kiem soat quyen truy cap. CoffeeHRM giai quyet bang cach tap trung du lieu vao mot he thong web, co phan quyen, luu lich su thao tac va ket noi du lieu giua ho so nhan vien, lich lam, cham cong, nghi phep, luong va bao cao.

### Doi Tuong Nguoi Dung

| Nguoi dung | Nhu cau su dung |
|---|---|
| Admin | Quan tri toan bo he thong, tai khoan, vai tro, phan quyen, danh muc |
| HR | Quan ly ho so nhan vien, hop dong, lich lam, cong, phep, luong, bao cao |
| Quan ly chi nhanh/bo phan | Theo doi lich, cham cong, duyet/nghiep vu lien quan nhan vien |
| Nhan vien | Dang nhap portal, xem ho so, lich lam, cham cong, gui nghi phep/doi ca/dieu chinh cong, xem luong |
| Ke toan | Xem/tong hop bang luong va chi phi luong; trong seed hien tai tai khoan `accountant` dang duoc gan system role HR |

## 2. Cong Nghe Su Dung

### Backend

| Thanh phan | Cong nghe |
|---|---|
| Framework | ASP.NET Core 8 Web API |
| ORM | Entity Framework Core 8 |
| Database provider | Microsoft.EntityFrameworkCore.SqlServer |
| Authentication | JWT Bearer token |
| Authorization | Custom permission policy qua `PermissionAuthorizeAttribute` |
| API docs | Swagger/Swashbuckle trong moi truong Development |
| Migration | EF Core Migrations |
| Seed data | `Data/DbSeeder.cs` |
| Middleware | `ExceptionLoggingMiddleware`, static files, CORS, health check |
| Deploy/demo | Dockerfile, docker-compose voi SQL Server container |

Package backend chinh trong `NguyenDacQuan_2123110483.csproj`:

| Package | Vai tro |
|---|---|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | Xac thuc request bang Bearer token |
| `Microsoft.EntityFrameworkCore.SqlServer` | Ket noi SQL Server |
| `Microsoft.EntityFrameworkCore.Design`, `Tools` | Tao/chay migration |
| `System.IdentityModel.Tokens.Jwt` | Tao va xu ly JWT |
| `Swashbuckle.AspNetCore` | Swagger UI/API documentation |

### Frontend

| Thanh phan | Cong nghe |
|---|---|
| Framework UI | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Routing | React Router DOM |
| HTTP client | Axios |
| Icon | lucide-react |
| CSS | Tailwind CSS/Vite CSS, custom CSS |
| Auth state | localStorage + React Context |

Package frontend chinh trong `frontend coffee demo/package.json`:

| Package | Vai tro |
|---|---|
| `react`, `react-dom` | Xay dung giao dien |
| `react-router-dom` | Dinh tuyen trang admin, nhan vien, public |
| `axios` | Goi API backend |
| `lucide-react` | Icon giao dien |
| `vite`, `typescript` | Build/dev frontend |
| `tailwindcss`, `@tailwindcss/vite` | Ho tro CSS utility |

### Authentication/Authorization

| Lop/file | Vai tro |
|---|---|
| `Services/AuthService.cs` | Dang nhap, refresh token, logout, doi mat khau, lay profile |
| `Services/JwtTokenService.cs` | Tao JWT access token |
| `Models/RefreshToken.cs` | Luu refresh token da hash |
| `Services/PasswordHashHelper.cs` | Hash va verify password |
| `Services/PermissionAuthorizeAttribute.cs` | Attribute gan permission vao controller/action |
| `Services/PermissionPolicyProvider.cs` | Sinh policy dong theo permission |
| `Services/PermissionAuthorizationHandler.cs` | Kiem tra user co permission hay khong |
| `frontend/src/auth/AuthProvider.tsx` | Luu session, guard route, check permission |
| `frontend/src/auth/session.ts` | Luu session admin/user vao localStorage |
| `frontend/src/api/coffeeApi.ts` | Gan Bearer token vao request, refresh token khi 401/403 |

Co che chinh:

1. Nguoi dung dang nhap qua `/api/auth/login`.
2. Backend tra ve `accessToken`, `refreshToken`, thong tin user va danh sach permission.
3. Frontend luu token theo realm `admin` hoac `user`.
4. Moi request API duoc gan header `Authorization: Bearer <token>`.
5. Backend dung JWT de xac thuc va permission policy de uy quyen.
6. Frontend dung `RequireAuth` va `RequirePermission` de chan route khong du quyen.

## 3. Cau Truc Source Code

### Cau Truc Backend

| Thu muc/file | Vai tro |
|---|---|
| `Program.cs` | Cau hinh DI, DbContext, JWT, CORS, Swagger, middleware, migration/seed database, static files, routing |
| `Controllers/` | Cac API controller tiep nhan request tu frontend |
| `Services/` | Xu ly nghiep vu: auth, nhan vien, hop dong, lich, cham cong, luong, nghi phep, bao cao, phan quyen |
| `Models/` | Entity database va cac model xac thuc |
| `Dtos/` | Request/response DTO, tach API contract khoi entity |
| `Data/AppDbContext.cs` | DbSet, cau hinh quan he, unique index, soft delete, audit log |
| `Data/DbSeeder.cs` | Tao permission, role, account mac dinh, du lieu demo |
| `Migrations/` | Lich su thay doi database EF Core |
| `Middleware/ExceptionLoggingMiddleware.cs` | Bat va log loi runtime |
| `Properties/launchSettings.json` | Cau hinh chay local |
| `appsettings*.json` | Cau hinh JWT, connection string, CORS |

### Cau Truc Frontend

| Thu muc/file | Vai tro |
|---|---|
| `src/App.tsx` | Khai bao route chinh: public, login, employee portal, admin shell |
| `src/api/coffeeApi.ts` | Lop API client dung Axios, gom toan bo ham goi backend |
| `src/auth/AuthProvider.tsx` | Quan ly session, dang nhap/dang xuat, guard route |
| `src/auth/session.ts` | Luu/lay session trong localStorage |
| `src/config/routes.ts` | Danh sach route admin va permission can co |
| `src/config/paths.ts` | Tap trung hang so duong dan |
| `src/config/resourceConfigs.tsx` | Cau hinh CRUD dung chung cho Branch, Role, Employee, Contract, KPI... |
| `src/pages/` | Cac man hinh chinh cua he thong |
| `src/components/layout/` | AppShell, Sidebar, Topbar |
| `src/components/ui/` | Button, Card, Table, Modal, FormFields, Badge, StateViews |
| `src/types/models.ts` | TypeScript type khop voi DTO backend |
| `src/utils/format.ts` | Format ngay, tien, trang thai |
| `src/utils/form.ts` | Xu ly form dynamic |

## 4. Danh Sach Chuc Nang Da Hoan Thanh

### 4.1 Dang Nhap, Dang Xuat, Quan Ly Session

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | Admin, HR, Manager, Employee, Accountant |
| Luong xu ly | Nhap username/password -> `/api/auth/login` -> backend verify hash -> tra JWT va refresh token -> frontend luu session -> dieu huong vao admin/portal |
| Backend | `AuthController`, `AuthService`, `JwtTokenService`, `PasswordHashHelper`, `RefreshToken` |
| Frontend | `LoginPage.tsx`, `AuthProvider.tsx`, `session.ts`, `coffeeApi.ts` |
| API | `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `GET /api/auth/me`, `GET /api/auth/profile` |
| Bang DB | `UserAccounts`, `RefreshTokens`, `Employees`, `Roles`, `SystemRoles`, `Permissions` |
| Trang thai | Da hoan thanh |

Tai khoan seed demo:

| Username | Password | Vai tro he thong |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `hr` | `hr123` | HR |
| `manager` | `manager123` | MANAGER |
| `accountant` | `accountant123` | HR system role |
| `employee` | `employee123` | EMPLOYEE |
| `employee2` | `employee123` | EMPLOYEE |

### 4.2 Phan Quyen

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | Admin quan ly; tat ca user bi kiem tra quyen khi truy cap |
| Luong xu ly | User co `SystemRole` -> role lien ket `Permission` -> token/profile tra ve danh sach permission -> frontend/backend cung kiem tra |
| Backend | `SystemRolesController`, `PermissionsController`, `UserAccountsController`, `PermissionAuthorizeAttribute`, `PermissionAuthorizationHandler` |
| Frontend | `routes.ts`, `RequirePermission`, `Sidebar`, `AuthProvider` |
| API | `/api/systemRoles`, `/api/permissions`, `/api/userAccounts` |
| Bang DB | `SystemRoles`, `Permissions`, `SystemRolePermissions`, `UserAccounts` |
| Trang thai | Da hoan thanh |

### 4.3 Quan Ly Nhan Vien

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | Admin, HR |
| Luong xu ly | Tao/sua/xem/xoa mem nhan vien, gan chi nhanh va chuc vu, xem thong tin lien quan hop dong/tai khoan |
| Backend | `EmployeesController`, `EmployeeService`, `Employee.cs`, `EmployeeDtos.cs` |
| Frontend | `resourcePages.tsx`, `resourceConfigs.tsx`, route `/admin/employees` |
| API | `GET/POST/PUT/DELETE /api/employees`, `GET /api/employees/{id}` |
| Bang DB | `Employees`, `Branches`, `Roles`, `EmployeeContracts`, `UserAccounts` |
| Trang thai | Da hoan thanh |

### 4.4 Quan Ly Phong Ban/Chi Nhanh Va Chuc Vu

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | Admin, HR |
| Luong xu ly | Quan ly danh muc chi nhanh/phong ban, chuc vu; cac danh muc nay duoc dung khi tao nhan vien, lich, tuyen dung |
| Backend | `BranchesController`, `RolesController`, `BranchService`, `RoleService` |
| Frontend | `BranchesPage`, `RolesPage`, `resourceConfigs.tsx` |
| API | `/api/branches`, `/api/roles` |
| Bang DB | `Branches`, `Roles`, lien ket voi `Employees`, `Recruitments`, `UserAccounts` |
| Trang thai | Da hoan thanh |

Ghi chu: De cuong goi la "phong ban/chuc vu"; source hien tai dat ten `Branch` cho don vi/chi nhanh va `Role` cho chuc vu nghiep vu.

### 4.5 Quan Ly Hop Dong

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | Admin, HR |
| Luong xu ly | Tao hop dong cho nhan vien, khai bao loai hop dong, luong co ban, don gia gio, he so OT, phat di tre/ve som, gio chuan/ngay |
| Backend | `EmployeeContractsController`, `EmployeeContractService`, `EmployeeContract.cs`, `EmployeeContractDtos.cs` |
| Frontend | route `/admin/employee-contracts`, `resourceConfigs.tsx` |
| API | `/api/employeeContracts` |
| Bang DB | `EmployeeContracts`, `Employees`, `Payrolls` |
| Trang thai | Da hoan thanh |

### 4.6 Lich Lam, Ca Lam, Cham Cong

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | HR, Manager, Employee |
| Luong xu ly | Quan ly ca -> sap lich cho nhan vien -> nhan vien/quan ly check-in -> check-out -> he thong tinh di tre, gio lam, tang ca, ve som -> co the danh dau vang |
| Backend | `ShiftsController`, `SchedulesController`, `AttendanceController`, `ShiftOpenSlotsController`, `SelfPortalController`, `SelfShiftBoardController`, `AttendanceService`, `ScheduleService`, `ShiftOpenSlotService` |
| Frontend | `ShiftsPage`, `SchedulesPage`, `AttendancePage`, `ShiftOpenSlotsPage`, `EmployeePortalPage`, `EmployeeShiftWeekPage` |
| API | `/api/shifts`, `/api/schedules`, `/api/attendance`, `/api/shift-open-slots`, `/api/self/attendance/*`, `/api/self/shift-board` |
| Bang DB | `Shifts`, `Schedules`, `Attendances`, `ShiftOpenSlots`, `Employees`, `Branches` |
| Trang thai | Da hoan thanh, co them chon ca mo va huy ca |

### 4.7 Nghi Phep

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | Employee gui don; HR/Manager duyet, tu choi, huy |
| Luong xu ly | Tao don nghi -> trang thai Pending -> nguoi co quyen approve/reject -> luu nguoi duyet, thoi diem duyet, ghi chu |
| Backend | `LeaveRequestsController`, `LeaveRequestService` trong `WorkflowSupportServices.cs`, `LeaveRequest.cs` |
| Frontend | `LeaveRequestsPage.tsx`, `EmployeePortalPage.tsx` |
| API | `GET/POST/PUT /api/leaveRequests`, `POST /api/leaveRequests/{id}/approve|reject|cancel` |
| Bang DB | `LeaveRequests`, `Employees`, `UserAccounts` |
| Trang thai | Da hoan thanh |

### 4.8 Doi Ca Va Dieu Chinh Cong

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | Employee/Manager/HR |
| Luong xu ly | Nhan vien tao yeu cau doi ca hoac dieu chinh cong -> nguoi co quyen duyet/tu choi/huy -> cap nhat trang thai va audit |
| Backend | `ShiftSwapRequestsController`, `AttendanceAdjustmentsController`, `WorkflowSupportServices.cs` |
| Frontend | `ShiftSwapRequestsPage.tsx`, `AttendanceAdjustmentsPage.tsx`, `EmployeePortalPage.tsx` |
| API | `/api/shiftSwapRequests`, `/api/attendanceAdjustments` |
| Bang DB | `ShiftSwapRequests`, `AttendanceAdjustments`, `Schedules`, `Attendances`, `Employees`, `UserAccounts` |
| Trang thai | Da hoan thanh, la phan mo rong so voi de cuong ban dau |

### 4.9 Tinh Luong

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | HR, Admin, Ke toan/nguoi co quyen payroll |
| Luong xu ly | Chon nhan vien va ky luong -> generate payroll tu du lieu cham cong va hop dong -> tinh base, OT, phu cap, thuong, phat, bao hiem/thue -> duyet -> danh dau da tra -> khoa/mo ky |
| Backend | `PayrollController`, `PayrollService`, `Payroll.cs`, `PayrollDetail.cs`, `PayrollClosePeriod.cs` |
| Frontend | `PayrollPage.tsx`, `PayrollDetailsPage.tsx`, `EmployeePortalPage.tsx` |
| API | `/api/payroll`, `/api/payroll/generate`, `/api/payroll/{id}/approve`, `/pay`, `/cancel`, `/close-period`, `/reopen-period`, `/export/csv` |
| Bang DB | `Payrolls`, `PayrollDetails`, `PayrollClosePeriods`, `Attendances`, `Schedules`, `EmployeeContracts`, `Employees`, `UserAccounts` |
| Trang thai | Da hoan thanh o muc mo phong nghiep vu tot nghiep |

Cong thuc tong quat trong source:

`TotalSalary = BaseAmount + OvertimeAmount + AllowanceAmount + BonusAmount - PenaltyAmount - InsuranceAmount - TaxAmount`

### 4.10 KPI

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | HR, Manager, Admin |
| Luong xu ly | Tao/sua/xoa KPI theo nhan vien, thang, nam; nhap diem, muc tieu, ket qua, ghi chu |
| Backend | `KPIsController`, `KpiService`, `KPI.cs` |
| Frontend | route `/admin/kpis`, `resourceConfigs.tsx` |
| API | `/api/KPIs` |
| Bang DB | `KPIs`, `Employees` |
| Trang thai | Da hoan thanh muc co ban |

### 4.11 Bao Cao/Dashboard

| Tieu chi | Mo ta |
|---|---|
| Nguoi dung | Admin, HR, Manager |
| Luong xu ly | Lay tong quan so nhan vien, cong, vang, tre, OT, tong luong, payroll da duyet/da tra, tin tuyen dung, workflow cho duyet |
| Backend | `ReportsController`, `ReportService` trong `WorkflowSupportServices.cs` |
| Frontend | `DashboardPage.tsx`, `ReportsPage.tsx` |
| API | `/api/reports/summary`, `/api/reports/employees/csv`, `/api/reports/attendance/csv` |
| Bang DB | `Employees`, `Attendances`, `Payrolls`, `Recruitments`, `LeaveRequests`, `ShiftSwapRequests`, `AttendanceAdjustments` |
| Trang thai | Da hoan thanh bao cao co ban, co xuat CSV |

### 4.12 Tuyen Dung, Dao Tao, Audit Log

| Chuc nang | Trang thai | File lien quan |
|---|---|---|
| Tuyen dung noi bo | Co CRUD dot tuyen dung va ung vien | `RecruitmentsController`, `CandidatesController`, `RecruitmentService`, `CandidateService` |
| Tuyen dung public | Co trang public xem tin mo va ung tuyen | `PublicRecruitmentsController`, `CareersPage.tsx` |
| Dao tao | Co khoa dao tao va phan cong nhan vien | `TrainingsController`, `EmployeeTrainingsController` |
| Audit log | Co ghi log Create/Update/SoftDelete tu DbContext | `AuditLogsController`, `AppDbContext.cs`, `AuditLog.cs` |

### 4.13 Xuat File/Import File

| Loai | Tinh trang |
|---|---|
| Xuat danh sach nhan vien CSV | Co: `GET /api/reports/employees/csv` |
| Xuat cham cong CSV | Co: `GET /api/reports/attendance/csv` |
| Xuat payroll CSV | Co: `GET /api/payroll/export/csv` |
| Xuat PDF/Excel | Chua thay trong source hien tai |
| Import file cham cong/nhan vien | Chua thay trong source hien tai |

## 5. Danh Sach API

Quy uoc: endpoint co `[controller]` duoc ASP.NET map theo ten controller bo chu `Controller`, vi du `BranchesController` thanh `/api/branches`.

| Nhom API | Method | Endpoint | Request body chinh | Response chinh | Quyen truy cap | Muc dich |
|---|---|---|---|---|---|---|
| Auth | POST | `/api/auth/login` | `{ username, password }` | `AuthResponse { accessToken, refreshToken, user }` | AllowAnonymous | Dang nhap |
| Auth | POST | `/api/auth/refresh` | `{ refreshToken }` | `AuthResponse` | AllowAnonymous | Lam moi token |
| Auth | POST | `/api/auth/logout` | `{ refreshToken }` | 204 | AllowAnonymous | Dang xuat 1 phien |
| Auth | POST | `/api/auth/logout-all` | none | 204 | Authenticated | Dang xuat tat ca refresh token |
| Auth | POST | `/api/auth/change-password` | `{ currentPassword, newPassword }` | 204 | Authenticated | Doi mat khau |
| Auth | POST | `/api/auth/reset-password/{userAccountId}` | `{ newPassword, requireLogoutAll }` | 204 | `security.accounts.manage` | Admin reset mat khau |
| Auth | GET | `/api/auth/me`, `/api/auth/profile` | none | `AuthUserDto`, `AuthProfileDto` | Authenticated | Lay user/profile hien tai |
| Branches | GET/POST | `/api/branches` | `BranchUpsertDto` khi POST | List/Branch | `master.branches.manage` | Quan ly chi nhanh/phong ban |
| Branches | GET/PUT/DELETE | `/api/branches/{id}` | `BranchUpsertDto` khi PUT | Branch/204 | `master.branches.manage` | Xem/sua/ngung hoat dong chi nhanh |
| Roles | GET/POST | `/api/roles` | `RoleUpsertDto` | List/Role | `master.positions.manage` | Quan ly chuc vu |
| Roles | GET/PUT/DELETE | `/api/roles/{id}` | `RoleUpsertDto` | Role/204 | `master.positions.manage` | Xem/sua/ngung hoat dong chuc vu |
| Employees | GET/POST | `/api/employees` | `EmployeeUpsertDto` | List/Employee | `hr.employees.manage` | Quan ly ho so nhan vien |
| Employees | GET/PUT/DELETE | `/api/employees/{id}` | `EmployeeUpsertDto` | Employee/204 | `hr.employees.manage` | Xem/sua/xoa mem nhan vien |
| Contracts | GET/POST | `/api/employeeContracts` | `EmployeeContractUpsertDto` | List/Contract | `hr.contracts.manage` | Quan ly hop dong |
| Contracts | GET/PUT/DELETE | `/api/employeeContracts/{id}` | `EmployeeContractUpsertDto` | Contract/204 | `hr.contracts.manage` | Xem/sua/ngung hop dong |
| User accounts | GET/POST | `/api/userAccounts` | `UserAccountUpsertDto` | List/UserAccount | `security.accounts.manage` | Quan ly tai khoan |
| User accounts | GET/PUT/DELETE | `/api/userAccounts/{id}` | `UserAccountUpsertDto` | UserAccount/204 | `security.accounts.manage` | Xem/sua/khoa tai khoan |
| System roles | GET/POST | `/api/systemRoles` | `SystemRoleUpsertDto` | List/SystemRole | `security.accounts.manage` | Quan ly vai tro he thong |
| System roles | GET/PUT/DELETE | `/api/systemRoles/{id}` | `SystemRoleUpsertDto` | SystemRole/204 | `security.accounts.manage` | Xem/sua/khoa vai tro |
| Permissions | GET | `/api/permissions` | none | List Permission | `security.accounts.manage` | Lay danh sach permission |
| Shifts | GET/POST | `/api/shifts` | `ShiftUpsertDto` | List/Shift | `master.shifts.manage` | Quan ly ca lam |
| Shifts | GET/PUT/DELETE | `/api/shifts/{id}` | `ShiftUpsertDto` | Shift/204 | `master.shifts.manage` | Xem/sua/ngung ca |
| Schedules | GET/POST | `/api/schedules` | `ScheduleRequestDto` | List/Schedule | `ops.schedules.manage` | Quan ly lich lam |
| Schedules | GET/PUT/DELETE | `/api/schedules/{id}` | `ScheduleRequestDto` | Schedule/204 | `ops.schedules.manage` | Xem/sua/xoa lich |
| Schedules | POST | `/api/schedules/validate` | `{ employeeId, shiftId, scheduleDate, note }` | `{ isValid, message }` | `ops.schedules.manage` | Kiem tra trung lich |
| Shift open slots | GET/POST | `/api/shift-open-slots` | `ShiftOpenSlotUpsertDto` | List/Slot | `ops.schedules.manage` | Quan ly ca mo |
| Shift open slots | POST | `/api/shift-open-slots/bulk` | `{ branchIds, shiftIds, slotDates, capacity, note }` | Bulk result | `ops.schedules.manage` | Tao nhieu ca mo |
| Shift open slots | GET/PUT/DELETE | `/api/shift-open-slots/{id}` | `ShiftOpenSlotUpsertDto` | Slot/204 | `ops.schedules.manage` | Xem/sua/xoa ca mo |
| Shift open slots | POST | `/api/shift-open-slots/{id}/deactivate` | none | 204 | `ops.schedules.manage` | Ngung ca mo |
| Attendance | GET | `/api/attendance?month=&year=` | query | List Attendance | `ops.attendance.manage` | Xem cham cong |
| Attendance | GET | `/api/attendance/employee/{employeeId}` | none | List Attendance | `ops.attendance.manage` | Xem cong theo nhan vien |
| Attendance | GET | `/api/attendance/summary?month=&year=&employeeId=` | query | AttendanceSummary | `ops.attendance.manage` | Tong hop cong |
| Attendance | POST | `/api/attendance/check-in` | `{ employeeId, attendanceDate, note }` | Attendance | `ops.attendance.manage` | Check-in |
| Attendance | POST | `/api/attendance/check-out` | `{ employeeId, attendanceDate }` | Attendance | `ops.attendance.manage` | Check-out |
| Attendance | POST | `/api/attendance/mark-absent` | `{ attendanceDate, note }` | `{ created, date }` | `operations.manage` | Danh dau vang theo lich |
| Leave | GET/POST | `/api/leaveRequests` | `LeaveRequestUpsertDto` | List/LeaveRequest | `leave.manage` | Tao/xem don nghi |
| Leave | PUT | `/api/leaveRequests/{id}` | `LeaveRequestUpsertDto` | 204 | `leave.manage` | Sua don nghi |
| Leave | POST | `/api/leaveRequests/{id}/approve` | `{ note }` | 204 | `leave.manage` | Duyet don nghi |
| Leave | POST | `/api/leaveRequests/{id}/reject` | `{ note }` | 204 | `leave.manage` | Tu choi don nghi |
| Leave | POST | `/api/leaveRequests/{id}/cancel` | none | 204 | `leave.manage` | Huy don nghi |
| Shift swap | GET/POST | `/api/shiftSwapRequests` | `ShiftSwapUpsertDto` | List/ShiftSwap | `shift.swap.manage` | Tao/xem yeu cau doi ca |
| Shift swap | POST | `/api/shiftSwapRequests/{id}/approve|reject|cancel` | `{ note }` hoac none | 204 | `shift.swap.manage` | Xu ly yeu cau doi ca |
| Attendance adjustment | GET/POST | `/api/attendanceAdjustments` | `AttendanceAdjustmentUpsertDto` | List/Adjustment | `attendance.adjust.manage` | Tao/xem dieu chinh cong |
| Attendance adjustment | POST | `/api/attendanceAdjustments/{id}/approve|reject|cancel` | `{ note }` hoac none | 204 | `attendance.adjust.manage` | Xu ly dieu chinh cong |
| Payroll | GET/POST | `/api/payroll` | `PayrollRequestDto` | List/Payroll | `payroll.manage` | Tao/xem bang luong |
| Payroll | GET/PUT/DELETE | `/api/payroll/{id}` | `PayrollRequestDto` | Payroll/204 | `payroll.manage` | Xem/sua/xoa bang luong |
| Payroll | POST | `/api/payroll/generate` | `PayrollGenerateRequestDto` | Payroll | `payroll.manage` | Tao bang luong tu cong/hop dong |
| Payroll | POST | `/api/payroll/{id}/approve` | `{ note }` | 204 | `payroll.manage` | Duyet bang luong |
| Payroll | POST | `/api/payroll/{id}/pay` | `{ note }` | 204 | `payroll.manage` | Danh dau da chi tra |
| Payroll | POST | `/api/payroll/{id}/cancel` | `{ note }` | 204 | `payroll.manage` | Huy bang luong |
| Payroll detail | GET/POST | `/api/payroll/{payrollId}/details` | `PayrollDetailRequestDto` | List/Detail | `payroll.manage` | Xem/them khoan chi tiet |
| Payroll period | GET | `/api/payroll/close-periods` | none | List ClosePeriod | `operations.manage` | Xem ky luong da khoa |
| Payroll period | POST | `/api/payroll/close-period` | `{ payrollMonth, payrollYear, note }` | 204 | `operations.manage` | Khoa ky luong |
| Payroll period | POST | `/api/payroll/reopen-period` | `{ payrollMonth, payrollYear, note }` | 204 | `operations.manage` | Mo lai ky luong |
| Payroll export | GET | `/api/payroll/export/csv` | none | CSV file | `reports.export` | Xuat payroll CSV |
| KPI | GET/POST | `/api/KPIs` | `KpiUpsertDto` | List/KPI | `kpi.manage` | Quan ly KPI |
| KPI | GET/PUT/DELETE | `/api/KPIs/{id}` | `KpiUpsertDto` | KPI/204 | `kpi.manage` | Xem/sua/xoa KPI |
| Reports | GET | `/api/reports/summary` | query month/year/branchId | ReportSummary | `reports.view` | Bao cao tong hop |
| Reports | GET | `/api/reports/employees/csv` | none | CSV file | `reports.export` | Xuat nhan vien |
| Reports | GET | `/api/reports/attendance/csv` | query month/year | CSV file | `reports.export` | Xuat cham cong |
| Recruitments | GET/POST | `/api/recruitments` | `RecruitmentUpsertDto` | List/Recruitment | `recruitment.manage` | Quan ly dot tuyen dung |
| Recruitments | GET/PUT/DELETE | `/api/recruitments/{id}` | `RecruitmentUpsertDto` | Recruitment/204 | `recruitment.manage` | Xem/sua/xoa dot tuyen |
| Candidates | GET/POST | `/api/candidates` | `CandidateUpsertDto` | List/Candidate | `recruitment.manage` | Quan ly ung vien |
| Candidates | GET/PUT/DELETE | `/api/candidates/{id}` | `CandidateUpsertDto` | Candidate/204 | `recruitment.manage` | Xem/sua/xoa ung vien |
| Public recruitment | GET | `/api/public/recruitments/open` | none | List Recruitment | Public | Xem tin tuyen dung mo |
| Public recruitment | GET | `/api/public/recruitments/{id}` | none | Recruitment | Public | Xem chi tiet tin |
| Public recruitment | POST | `/api/public/recruitments/{id}/apply` | `{ fullName, phone, email, note }` | Apply result | Public | Ung tuyen |
| Trainings | GET/POST | `/api/trainings` | `TrainingUpsertDto` | List/Training | `training.manage` | Quan ly khoa dao tao |
| Trainings | GET/PUT/DELETE | `/api/trainings/{id}` | `TrainingUpsertDto` | Training/204 | `training.manage` | Xem/sua/xoa khoa |
| Employee trainings | GET/POST | `/api/employeeTrainings` | `EmployeeTrainingUpsertDto` | List/EmployeeTraining | `training.manage` | Gan khoa dao tao cho nhan vien |
| Employee trainings | GET/PUT/DELETE | `/api/employeeTrainings/{id}` | `EmployeeTrainingUpsertDto` | EmployeeTraining/204 | `training.manage` | Xem/sua/xoa phan cong dao tao |
| Audit logs | GET | `/api/auditLogs` | query filter | List AuditLog | `audit.view` | Xem nhat ky |
| Audit logs | GET | `/api/auditLogs/{id}`, `/user/{userAccountId}`, `/table/{tableName}` | none | AuditLog/List | `audit.view` | Tra cuu log |
| Self portal | GET | `/api/self/overview` | none | SelfPortalResponse | `profile.view` | Tong quan portal ca nhan |
| Self portal | GET | `/api/self/payrolls` | none | List SelfPayroll | `self.payroll.view` | Xem luong ca nhan |
| Self attendance | POST | `/api/self/attendance/check-in` | `{ attendanceDate, note }` | SelfAttendanceResult | `self.attendance` | Nhan vien tu check-in |
| Self attendance | POST | `/api/self/attendance/check-out` | `{ attendanceDate }` | SelfAttendanceResult | `self.attendance` | Nhan vien tu check-out |
| Self shift board | GET | `/api/self/shift-board?weekStart=` | query | SelfShiftBoard | `self.shift.view` | Xem ca mo theo tuan |
| Self shift board | POST | `/api/self/shift-board/select` | `{ openShiftSlotId }` | Select result | `self.shift.select` | Dang ky ca mo |
| Self shift board | POST | `/api/self/shift-board/cancel/{scheduleId}` | none | 204 | `self.shift.select` | Huy ca da dang ky |

## 6. Co So Du Lieu

Tat ca entity chinh ke thua `AuditableEntity`, co cac truong audit chung: `CreatedAt`, `UpdatedAt`, `IsDeleted`, `DeletedAt`. `AppDbContext` ap dung soft delete filter cho entity audit va tu dong ghi `AuditLogs` khi Create/Update/SoftDelete.

| Bang | Muc dich | Truong chinh | PK | FK/Quan he |
|---|---|---|---|---|
| `Branches` | Luu chi nhanh/phong ban | `BranchCode`, `BranchName`, `Address`, `Phone`, `IsActive` | `Id` | 1-n `Employees`, 1-n `Recruitments`, 1-n `ShiftOpenSlots` |
| `Roles` | Chuc vu/nghiep vu nhan su | `RoleName`, `Description`, `IsActive` | `Id` | 1-n `Employees`, 1-n `UserAccounts` |
| `Employees` | Ho so nhan vien | `EmployeeCode`, `FullName`, `Gender`, `DateOfBirth`, `Phone`, `Email`, `Address`, `HireDate`, `IsActive` | `Id` | FK `BranchId`, `RoleId`; 1-n contracts/schedules/attendance/payroll/KPI/leave |
| `EmployeeContracts` | Hop dong va thong tin luong | `ContractNo`, `ContractType`, `BaseSalary`, `HourlyRate`, `OvertimeRateMultiplier`, `LatePenaltyPerMinute`, `StandardDailyHours`, `IsActive` | `Id` | FK `EmployeeId`; 1-n `Payrolls` |
| `Shifts` | Danh muc ca lam | `ShiftCode`, `ShiftName`, `StartTime`, `EndTime`, `GraceMinutes`, `IsActive` | `Id` | 1-n `Schedules`, `Attendances`, `ShiftOpenSlots` |
| `ShiftOpenSlots` | Ca mo cho nhan vien dang ky | `BranchId`, `ShiftId`, `SlotDate`, `Capacity`, `IsActive`, `Note` | `Id` | FK `BranchId`, `ShiftId`; 1-n `Schedules` |
| `Schedules` | Lich lam cua nhan vien | `EmployeeId`, `ShiftId`, `OpenShiftSlotId`, `ScheduleDate`, `Note` | `Id` | FK `EmployeeId`, `ShiftId`, `OpenShiftSlotId`; 1-1 `Attendance`; lien quan doi ca |
| `Attendances` | Bang cham cong | `EmployeeId`, `ShiftId`, `ScheduleId`, `AttendanceDate`, `CheckInAt`, `CheckOutAt`, `LateMinutes`, `WorkingMinutes`, `OvertimeMinutes`, `EarlyLeaveMinutes`, `Status` | `Id` | FK `EmployeeId`, `ShiftId`, `ScheduleId`; lien quan `PayrollDetails`, `AttendanceAdjustments` |
| `LeaveRequests` | Don nghi phep | `EmployeeId`, `StartDate`, `EndDate`, `LeaveType`, `Reason`, `TotalDays`, `Status`, `ReviewedByUserAccountId`, `ReviewedAt` | `Id` | FK `EmployeeId`, `ReviewedByUserAccountId` |
| `ShiftSwapRequests` | Yeu cau doi ca | `RequestEmployeeId`, `TargetEmployeeId`, `RequestScheduleId`, `TargetScheduleId`, `Status`, `Reason`, `ReviewedByUserAccountId` | `Id` | FK den `Employees`, `Schedules`, `UserAccounts` |
| `AttendanceAdjustments` | Yeu cau dieu chinh cong | `AttendanceId`, `EmployeeId`, `RequestedCheckInAt`, `RequestedCheckOutAt`, `RequestedStatus`, `Status`, `ReviewedByUserAccountId` | `Id` | FK `AttendanceId`, `EmployeeId`, `ReviewedByUserAccountId` |
| `Payrolls` | Bang luong theo nhan vien/thang | `EmployeeId`, `EmployeeContractId`, `PayrollMonth`, `PayrollYear`, `BaseAmount`, `WorkingHours`, `OvertimeAmount`, `AllowanceAmount`, `BonusAmount`, `PenaltyAmount`, `InsuranceAmount`, `TaxAmount`, `TotalSalary`, `Status`, `IsClosed` | `Id` | FK `EmployeeId`, `EmployeeContractId`, `ApprovedByUserAccountId`, `ClosedByUserAccountId`; 1-n `PayrollDetails` |
| `PayrollDetails` | Chi tiet cac khoan cong/tru | `PayrollId`, `DetailType`, `AttendanceId`, `ScheduleId`, `Description`, `Amount`, `Note` | `Id` | FK `PayrollId`, `AttendanceId`, `ScheduleId` |
| `PayrollClosePeriods` | Khoa/mo ky luong | `PayrollMonth`, `PayrollYear`, `IsClosed`, `ClosedAt`, `ClosedByUserAccountId`, `Note` | `Id` | FK `ClosedByUserAccountId` |
| `KPIs` | KPI nhan vien theo ky | `EmployeeId`, `KpiMonth`, `KpiYear`, `Score`, `Target`, `Result`, `Note` | `Id` | FK `EmployeeId` |
| `Recruitments` | Dot/tin tuyen dung | `BranchId`, `PositionTitle`, `OpenDate`, `CloseDate`, `Status`, `Description` | `Id` | FK `BranchId`; 1-n `Candidates` |
| `Candidates` | Ung vien | `RecruitmentId`, `FullName`, `Phone`, `Email`, `AppliedDate`, `Status`, `InterviewScore`, `Note` | `Id` | FK `RecruitmentId` |
| `Trainings` | Khoa dao tao | `TrainingCode`, `TrainingName`, `Description`, `StartDate`, `EndDate`, `Instructor`, `IsRequired`, `IsActive` | `Id` | 1-n `EmployeeTrainings` |
| `EmployeeTrainings` | Phan cong dao tao nhan vien | `EmployeeId`, `TrainingId`, `AssignedDate`, `CompletedDate`, `Status`, `Score` | `Id` | FK `EmployeeId`, `TrainingId` |
| `UserAccounts` | Tai khoan dang nhap | `EmployeeId`, `RoleId`, `SystemRoleId`, `Username`, `PasswordHash`, `IsActive`, `LastLoginAt` | `Id` | FK `EmployeeId`, `RoleId`, `SystemRoleId`; 1-n token/audit/review |
| `RefreshTokens` | Refresh token da hash | `UserAccountId`, `TokenHash`, `ExpiresAt`, `RevokedAt`, `IsUsed`, IP fields | `Id` | FK `UserAccountId` |
| `SystemRoles` | Vai tro he thong | `Code`, `Name`, `Description`, `IsActive` | `Id` | 1-n `UserAccounts`, n-n `Permissions` qua `SystemRolePermissions` |
| `Permissions` | Ma quyen | `Code`, `Name`, `Description` | `Id` | n-n `SystemRoles` |
| `SystemRolePermissions` | Bang trung gian role-permission | `SystemRoleId`, `PermissionId` | Composite key | FK `SystemRoleId`, `PermissionId` |
| `AuditLogs` | Nhat ky thao tac | `UserAccountId`, `Action`, `TableName`, `RecordId`, `OldValues`, `NewValues`, `IpAddress` | `Id` | FK `UserAccountId` |

## 7. Phan Quyen He Thong

### Role Hien Co Theo Seed

| Role | Mo ta | Quyen chinh |
|---|---|---|
| `ADMIN` | Toan quyen he thong | Tat ca permission |
| `HR` | Quan ly nhan su va du lieu nghiep vu | Dashboard, branches, roles, shifts, employees, contracts, accounts, schedules, attendance, payroll, recruitment, training, KPI, audit, leave, shift swap, adjustment, reports, export, operations |
| `MANAGER` | Quan ly van hanh chi nhanh | Dashboard, schedules, attendance, payroll, self payroll, self attendance, profile, leave, shift swap, adjustment, reports |
| `EMPLOYEE` | Nhan vien tu phuc vu | Dashboard, self attendance, self payroll, self shift view/select, profile, schedules, employees, leave, shift swap, adjustment |

Ghi chu rui ro: role `EMPLOYEE` trong seed hien tai co mot so quyen rong nhu `ops.schedules.manage`, `hr.employees.manage`, `leave.manage`, `shift.swap.manage`, `attendance.adjust.manage`. Neu demo, can giai thich day la cau hinh seed de tien test portal; trong he thong thuc te nen thu hep quyen nhan vien chi con cac permission `self.*`, `profile.view` va tao request ca nhan.

### Permission Hien Co

| Permission | Chuc nang |
|---|---|
| `dashboard.view` | Xem dashboard |
| `master.branches.manage` | Quan ly chi nhanh |
| `master.positions.manage` | Quan ly chuc vu |
| `master.shifts.manage` | Quan ly ca lam |
| `hr.employees.manage` | Quan ly nhan vien |
| `hr.contracts.manage` | Quan ly hop dong |
| `security.accounts.manage` | Quan ly tai khoan, role, permission |
| `ops.schedules.manage` | Quan ly lich lam, ca mo |
| `ops.attendance.manage` | Quan ly cham cong |
| `payroll.manage` | Quan ly bang luong |
| `recruitment.manage` | Quan ly tuyen dung |
| `training.manage` | Quan ly dao tao |
| `kpi.manage` | Quan ly KPI |
| `audit.view` | Xem audit log |
| `self.attendance` | Nhan vien tu cham cong |
| `self.payroll.view` | Nhan vien xem luong ca nhan |
| `self.shift.view` | Nhan vien xem ca mo |
| `self.shift.select` | Nhan vien dang ky/huy ca mo |
| `profile.view` | Xem profile |
| `leave.manage` | Quan ly nghi phep |
| `shift.swap.manage` | Quan ly doi ca |
| `attendance.adjust.manage` | Quan ly dieu chinh cong |
| `reports.view` | Xem bao cao |
| `reports.export` | Xuat bao cao |
| `operations.manage` | Thao tac van hanh: khoa ky luong, mark absent |

### Cach Backend Kiem Soat Quyen

- Controller/action gan `[PermissionAuthorize(PermissionCodes.X)]`.
- `PermissionPolicyProvider` tao policy tu ten permission.
- `PermissionAuthorizationHandler` lay user hien tai, kiem tra permission trong database.
- JWT authentication xac thuc user truoc khi authorization.
- Cac API nhay cam nhu payroll close-period, reset-password, reports export co permission rieng.

### Cach Frontend Kiem Soat Quyen

- `routes.ts` khai bao moi route can permission nao.
- `RequireAuth` chan nguoi chua dang nhap.
- `RequirePermission` chan nguoi khong co permission va redirect `/forbidden`.
- `Sidebar` chi hien menu theo permission.
- `coffeeApi.ts` gan token va tu refresh khi token het han.

## 8. Quy Trinh Nghiep Vu

### 8.1 Quan Ly Ho So Nhan Vien

1. Admin/HR dang nhap vao `/admin`.
2. Tao chi nhanh/phong ban trong `/admin/branches`.
3. Tao chuc vu trong `/admin/roles`.
4. Vao `/admin/employees`, tao nhan vien va gan `BranchId`, `RoleId`.
5. Neu nhan vien can dang nhap, vao `/admin/user-accounts` tao tai khoan va gan `SystemRole`.
6. Neu nhan vien co luong/hop dong, vao `/admin/employee-contracts` tao hop dong.

Du lieu lien quan: `Branches`, `Roles`, `Employees`, `UserAccounts`, `SystemRoles`, `EmployeeContracts`.

### 8.2 Cham Cong

1. HR/Admin tao ca lam trong `/admin/shifts`.
2. HR/Manager tao lich lam trong `/admin/schedules` hoac tao ca mo trong `/admin/shift-open-slots`.
3. Nhan vien dang nhap portal `/nhan-vien`, xem lich/ca mo va co the chon ca.
4. Nhan vien hoac nguoi co quyen cham cong goi check-in.
5. He thong lay lich va ca trong ngay, tinh `LateMinutes` theo `StartTime + GraceMinutes`.
6. Khi check-out, he thong tinh `WorkingMinutes`, `OvertimeMinutes`, `EarlyLeaveMinutes`, cap nhat `Status`.
7. HR co the mark absent cho cac lich khong co cong.

Du lieu lien quan: `Shifts`, `Schedules`, `ShiftOpenSlots`, `Attendances`, `Employees`.

### 8.3 Xin Nghi Phep Va Duyet Nghi Phep

1. Nhan vien tao don nghi phep tu portal hoac HR tao trong admin.
2. He thong tinh `TotalDays`, tao record trang thai `Pending`.
3. HR/Manager xem danh sach don trong `/admin/leave-requests`.
4. Nguoi duyet chon approve hoac reject, nhap ghi chu.
5. He thong cap nhat `Status`, `ReviewedByUserAccountId`, `ReviewedAt`, `DecisionNote`.
6. Don co the bi huy neu con o trang thai phu hop.

Du lieu lien quan: `LeaveRequests`, `Employees`, `UserAccounts`.

### 8.4 Tinh Luong

1. HR dam bao nhan vien co hop dong active va co du lieu cham cong trong ky.
2. Vao `/admin/payroll`, chon generate payroll.
3. Backend doc `EmployeeContract`, `Attendances` trong thang/nam.
4. He thong tinh:
   - `WorkingHours` tu tong `WorkingMinutes`.
   - `BaseAmount` tu gio lam thuong.
   - `OvertimeAmount` tu OT va he so OT.
   - `PenaltyAmount` tu phut tre/ve som, vang mat va phat nhap them.
   - Cong phu cap, thuong; tru bao hiem/thue mo phong.
5. Bang luong o trang thai `Generated`.
6. HR/Admin co the approve, pay, cancel.
7. Nguoi co `operations.manage` co the khoa/mo ky luong.
8. Nhan vien co `self.payroll.view` xem luong ca nhan trong portal.

Du lieu lien quan: `Payrolls`, `PayrollDetails`, `PayrollClosePeriods`, `EmployeeContracts`, `Attendances`, `Employees`.

### 8.5 Xem Bao Cao

1. User co `reports.view` vao `/admin/reports`.
2. Chon thang, nam, chi nhanh.
3. Frontend goi `/api/reports/summary`.
4. Backend tong hop nhan vien active, so cong, vang, tre, OT, tong luong, payroll approved/paid, workflow pending.
5. User co `reports.export` co the xuat CSV nhan vien/cham cong/payroll.

Du lieu lien quan: `Employees`, `Attendances`, `Payrolls`, `Recruitments`, `LeaveRequests`, `ShiftSwapRequests`, `AttendanceAdjustments`.

## 9. Giao Dien He Thong

| Route | Page/Component | Chuc nang | Permission/Role |
|---|---|---|---|
| `/` | `HomePage` | Trang gioi thieu/public home | Public |
| `/nhan-vien/dang-nhap` | `LoginPage mode=user` | Dang nhap nhan vien | Public |
| `/admin/dang-nhap` | `LoginPage mode=admin` | Dang nhap admin | Public |
| `/tuyen-dung` | `CareersPage` | Xem tin tuyen dung va ung tuyen | Public |
| `/nhan-vien` | `EmployeePortalPage` | Portal nhan vien: profile, lich, cham cong, luong, nghi phep, doi ca, dieu chinh cong | `self.shift.view` va cac permission lien quan |
| `/admin/dashboard` | `DashboardPage` | Tong quan so lieu | `dashboard.view` |
| `/admin/profile` | `ProfilePage` | Xem profile tai khoan | `profile.view` |
| `/admin/reports` | `ReportsPage` | Bao cao va xuat CSV | `reports.view` |
| `/admin/branches` | `BranchesPage` | Quan ly chi nhanh/phong ban | `master.branches.manage` |
| `/admin/roles` | `RolesPage` | Quan ly chuc vu | `master.positions.manage` |
| `/admin/system-roles` | `SystemRolesPage` | Quan ly vai tro he thong va permission | `security.accounts.manage` |
| `/admin/employees` | `EmployeesPage` | Quan ly nhan vien | `hr.employees.manage` |
| `/admin/shifts` | `ShiftsPage` | Quan ly ca lam | `master.shifts.manage` |
| `/admin/employee-contracts` | `EmployeeContractsPage` | Quan ly hop dong | `hr.contracts.manage` |
| `/admin/user-accounts` | `UserAccountsPage` | Quan ly tai khoan | `security.accounts.manage` |
| `/admin/schedules` | `SchedulesPage` | Quan ly lich lam | `ops.schedules.manage` |
| `/admin/shift-open-slots` | `ShiftOpenSlotsPage` | Quan ly ca mo | `ops.schedules.manage` |
| `/admin/attendance` | `AttendancePage` | Cham cong va tong hop cong | `ops.attendance.manage` |
| `/admin/attendance-adjustments` | `AttendanceAdjustmentsPage` | Yeu cau dieu chinh cong | `attendance.adjust.manage` |
| `/admin/payroll` | `PayrollPage` | Bang luong, generate, approve, pay, close period | `payroll.manage` |
| `/admin/payroll-details` | `PayrollDetailsPage` | Chi tiet khoan luong | `payroll.manage` |
| `/admin/leave-requests` | `LeaveRequestsPage` | Don nghi phep va duyet | `leave.manage` |
| `/admin/shift-swaps` | `ShiftSwapRequestsPage` | Yeu cau doi ca | `shift.swap.manage` |
| `/admin/recruitments` | `RecruitmentsPage` | Quan ly dot tuyen dung | `recruitment.manage` |
| `/admin/candidates` | `CandidatesPage` | Quan ly ung vien | `recruitment.manage` |
| `/admin/trainings` | `TrainingsPage` | Quan ly khoa dao tao | `training.manage` |
| `/admin/employee-trainings` | `EmployeeTrainingsPage` | Gan dao tao cho nhan vien | `training.manage` |
| `/admin/kpis` | `KPIsPage` | Quan ly KPI | `kpi.manage` |
| `/admin/audit-logs` | `AuditLogsPage` | Xem nhat ky thao tac | `audit.view` |
| `/forbidden` | `ForbiddenPage` | Trang khong du quyen | Authenticated |
| `*` | `NotFoundPage` | Trang 404 | Public |

## 10. Kiem Thu

Source hien tai co project test `NguyenDacQuan_2123110483.Tests`, gom cac test da co:

| File test | Noi dung |
|---|---|
| `AuthTests.cs` | Kiem tra hash/verify password |
| `AttendanceTests.cs` | Check-in that bai khi nhan vien inactive |
| `ScheduleValidationTests.cs` | Khong cho trung lich nhan vien trong cung ngay |
| `PayrollTests.cs` | Khong cho xoa payroll da duyet |
| `WorkflowAndReportsTests.cs` | Duyet dieu chinh cong tinh lai metric; bao cao co filter chi nhanh |

Ket qua kiem tra da chay: `dotnet test NguyenDacQuan_2123110483.sln -c Release` pass `6/6`.

### Test Case De Xuat

| Ma TC | Chuc nang | Buoc kiem thu | Ket qua mong doi |
|---|---|---|---|
| TC01 | Dang nhap dung | Nhap `admin/admin123` | Dang nhap thanh cong, co accessToken |
| TC02 | Dang nhap sai | Nhap sai password | Tra loi loi, khong tao session |
| TC03 | Refresh token | Dang nhap, goi refresh | Tra token moi |
| TC04 | Phan quyen route | User khong co `security.accounts.manage` vao `/admin/system-roles` | Bi chuyen den `/forbidden` |
| TC05 | Tao nhan vien | HR tao nhan vien voi branch/role hop le | Luu thanh cong, hien trong danh sach |
| TC06 | Trung ma nhan vien | Tao 2 nhan vien cung `EmployeeCode` | He thong bao loi |
| TC07 | Tao hop dong | Tao hop dong cho nhan vien active | Hop dong duoc luu va dung khi tinh luong |
| TC08 | Tao ca lam | Tao ca co gio bat dau/ket thuc hop le | Ca hien trong danh sach |
| TC09 | Tao lich trung ngay | Tao 2 lich cho cung nhan vien cung ngay | Bi tu choi/validate false |
| TC10 | Check-in dung gio | Check-in trong gio cho phep | Status Present, LateMinutes = 0 |
| TC11 | Check-in tre | Check-in sau grace minutes | Status Late, LateMinutes > 0 |
| TC12 | Check-out som | Check-out truoc gio ket thuc ca | EarlyLeaveMinutes > 0 |
| TC13 | Check-out tang ca | Check-out sau gio ket thuc ca | OvertimeMinutes > 0 |
| TC14 | Mark absent | Lich co nhan vien nhung khong cham cong | Tao attendance status Absent |
| TC15 | Gui don nghi | Nhan vien tao don nghi hop le | Don Pending, co TotalDays |
| TC16 | Duyet don nghi | HR approve don Pending | Status Approved, co ReviewedAt |
| TC17 | Tu choi don nghi | HR reject don Pending | Status Rejected |
| TC18 | Tao doi ca | Nhan vien tao yeu cau voi 2 schedule hop le | Yeu cau Pending |
| TC19 | Duyet doi ca | Manager approve | Status Approved, lich duoc hoan doi neu service co cap nhat |
| TC20 | Dieu chinh cong | Tao request doi check-in/check-out | Pending |
| TC21 | Duyet dieu chinh cong | HR approve | Attendance duoc cap nhat va tinh lai late/OT |
| TC22 | Generate payroll | Co contract va attendance trong thang | Payroll Generated, co TotalSalary |
| TC23 | Approve payroll | Duyet payroll Generated | Status Approved, co ApprovedAt |
| TC24 | Pay payroll | Mark paid payroll Approved | Status Paid, co PaidDate |
| TC25 | Khoa ky luong | Close period thang/nam | Payroll trong ky IsClosed = true |
| TC26 | Sua payroll da khoa | Thu sua payroll da khoa | Bi tu choi |
| TC27 | Xem luong ca nhan | Employee vao portal payroll | Chi thay payroll cua minh |
| TC28 | Bao cao summary | Goi report theo branch | So lieu chi tinh trong branch |
| TC29 | Xuat CSV nhan vien | Goi export employees | Tai ve file CSV |
| TC30 | Audit log | Tao/sua/xoa mem entity | Co record AuditLog |

## 11. Danh Gia Muc Do Hoan Thien

### Chuc Nang Da Hoan Thanh

- Dang nhap/dang xuat, refresh token, doi/reset mat khau.
- Phan quyen bang permission, role he thong va route guard frontend.
- CRUD nhan vien, chi nhanh/phong ban, chuc vu, hop dong.
- CRUD tai khoan, system role, permission.
- Quan ly ca lam, lich lam, ca mo.
- Cham cong check-in/check-out, tinh di tre, ve som, tang ca, vang mat.
- Quan ly nghi phep: tao, sua, duyet, tu choi, huy.
- Quan ly doi ca va dieu chinh cong.
- Tinh luong theo ky, chi tiet luong, approve/pay/cancel, khoa/mo ky.
- KPI co ban theo thang/nam.
- Dashboard, bao cao tong hop, xuat CSV.
- Tuyen dung, ung vien, public careers.
- Dao tao va phan cong dao tao.
- Audit log, soft delete, seed data.
- Dockerfile, docker-compose, README huong dan chay.

### Chuc Nang Dang Lam Do/Can Hoan Thien Them

| Noi dung | Nhan xet |
|---|---|
| Quyen nhan vien | Seed role EMPLOYEE dang co mot so quyen rong, nen thu hep khi trien khai that |
| Ke toan | Chua co system role `ACCOUNTANT` rieng, tai khoan accountant dang gan HR |
| Giao dien tieng Viet | Mot so chu trong file frontend bi hien encoding loi trong source/output; can kiem tra UI thuc te |
| Test coverage | Moi co 6 test tu dong, chua bao phu toan bo module |
| Bao cao bieu do | Dashboard/report co so lieu, nhung bieu do nang cao chua ro |
| Import file | Chua co import Excel/CSV cham cong |
| Export PDF/Excel | Hien co CSV, chua thay PDF/Excel dung thu vien rieng |

### Chuc Nang Chua Lam Hoac Nam Ngoai Pham Vi

- Tich hop may cham cong van tay/khuon mat.
- Ung dung mobile native.
- GPS cham cong.
- Email/thong bao tu dong.
- Cong thuc luong thuc te day du theo luat: BHXH, BHYT, BHTN, thue TNCN theo bieu luy tien.
- Phe duyet nhieu cap.
- Import cham cong tu Excel.
- Xuat bao cao PDF co mau bieu.
- BI/AI phan tich nhan su.

### Loi/Rui Ro Con Ton Tai

| Rui ro | Muc do | Giai thich |
|---|---|---|
| Quyen seed EMPLOYEE qua rong | Trung binh | Co the lam giam tinh chat bao mat neu demo bang user employee |
| Du lieu demo it | Thap/Trung binh | De cuong huong den 30-300 nhan su, seed hien co chi gom vai nhan vien |
| Chua co role ke toan rieng | Thap | Co the giai thich ke toan la mo rong/gan HR trong ban demo |
| Chua co import file | Thap | De cuong xem import la mo rong, khong bat buoc |
| Test tu dong it | Trung binh | Nen bo sung test neu con thoi gian, con neu bao cao thi liet ke test case de xuat |
| Phu thuoc SQL Server local | Thap | Da co Docker compose de giam rui ro cai dat |
| Cong thuc luong mo phong | Chap nhan duoc | Phu hop pham vi thuc tap, can ghi ro han che |

### Danh Gia Ty Le Hoan Thanh

| Hang muc | Ty le uoc tinh |
|---|---|
| Backend API va nghiep vu | 85-90% |
| Frontend giao dien quan tri/portal | 80-85% |
| Database/migration/seed | 85% |
| Bao mat/phan quyen | 80-85% |
| Bao cao/export | 70-75% |
| Test tu dong | 40-50% |
| Tong the phu hop bao cao thuc tap | Khoang 85% |

Ket luan: Du an du dieu kien de viet bao cao va demo bao ve thuc tap tot nghiep. He thong da co cac phan he cot loi cua HRM: nhan vien, hop dong, lich/ca, cham cong, nghi phep, tinh luong, KPI, bao cao va phan quyen. Cac han che nen trinh bay ro trong chuong "Han che va huong phat trien" thay vi xem la loi nghiem trong.

### Huong Phat Trien De Xuat

- Them role `ACCOUNTANT` rieng va tinh chinh permission cho tung role.
- Thu hep quyen cua `EMPLOYEE` trong seed.
- Bo sung import Excel/CSV cho cham cong va nhan vien.
- Bo sung export Excel/PDF cho bang luong, phieu luong, bao cao.
- Tang so luong seed data len 30-50 nhan vien de demo bao cao dep hon.
- Bo sung bieu do dashboard bang chart library.
- Bo sung test integration cho auth, permission, payroll, leave, reports.
- Tich hop may cham cong hoac file export tu may cham cong.
- Hoan thien cong thuc luong theo chinh sach thue/bao hiem thuc te.
