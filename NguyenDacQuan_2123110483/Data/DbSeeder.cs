using CoffeeHRM.Models;
using CoffeeHRM.Services;
using Microsoft.EntityFrameworkCore;

namespace CoffeeHRM.Data;

public static class DbSeeder
{
    private sealed record PermissionSeed(string Code, string Name, string Description);
    private sealed record SystemRoleSeed(string Code, string Name, string Description, string[] PermissionCodes);

    private static readonly PermissionSeed[] PermissionSeeds =
    [
        new(PermissionCodes.DashboardView, "Xem dashboard", "Truy cập trang tổng quan."),
        new(PermissionCodes.MasterBranchesManage, "Quản lý chi nhánh", "CRUD chi nhánh."),
        new(PermissionCodes.MasterPositionsManage, "Quản lý chức vụ", "CRUD chức vụ nghiệp vụ."),
        new(PermissionCodes.MasterShiftsManage, "Quản lý ca làm", "CRUD ca làm."),
        new(PermissionCodes.HrEmployeesManage, "Quản lý nhân viên", "CRUD hồ sơ nhân viên."),
        new(PermissionCodes.HrContractsManage, "Quản lý hợp đồng", "CRUD hợp đồng lao động."),
        new(PermissionCodes.SecurityAccountsManage, "Quản lý tài khoản", "CRUD tài khoản người dùng."),
        new(PermissionCodes.OpsSchedulesManage, "Quản lý lịch làm", "CRUD và kiểm tra lịch làm."),
        new(PermissionCodes.OpsAttendanceManage, "Quản lý chấm công", "Check-in, check-out và xem công."),
        new(PermissionCodes.PayrollManage, "Quản lý payroll", "CRUD và generate payroll."),
        new(PermissionCodes.RecruitmentManage, "Quản lý tuyển dụng", "CRUD đợt tuyển dụng và ứng viên."),
        new(PermissionCodes.TrainingManage, "Quản lý đào tạo", "CRUD đào tạo và đào tạo nhân viên."),
        new(PermissionCodes.KpiManage, "Quản lý KPI", "CRUD KPI theo kỳ."),
        new(PermissionCodes.AuditView, "Xem audit log", "Tra cứu log hệ thống."),
        new(PermissionCodes.SelfAttendance, "Tự chấm công", "Dùng cho nhân viên tự check-in/check-out."),
        new(PermissionCodes.SelfPayrollView, "Xem payroll cá nhân", "Dùng cho nhân viên xem lương của mình."),
        new(PermissionCodes.SelfShiftView, "Xem ca mở", "Dùng cho nhân viên xem ca mở theo tuần."),
        new(PermissionCodes.SelfShiftSelect, "Chọn ca mở", "Dùng cho nhân viên đăng ký ca còn trống."),
        new(PermissionCodes.ProfileView, "Xem hồ sơ tài khoản", "Xem thông tin tài khoản hiện tại."),
        new(PermissionCodes.LeaveManage, "Quản lý nghỉ phép", "Tạo, duyệt và theo dõi đơn nghỉ phép."),
        new(PermissionCodes.ShiftSwapManage, "Quản lý đổi ca", "Tạo và duyệt yêu cầu đổi ca."),
        new(PermissionCodes.AttendanceAdjustmentManage, "Điều chỉnh chấm công", "Tạo và duyệt yêu cầu điều chỉnh công."),
        new(PermissionCodes.ReportsView, "Xem báo cáo", "Xem dashboard và báo cáo tổng hợp."),
        new(PermissionCodes.ReportsExport, "Xuất báo cáo", "Xuất dữ liệu CSV/PDF từ báo cáo."),
        new(PermissionCodes.OperationsManage, "Quản trị vận hành", "Đóng kỳ lương, đánh dấu absent và thao tác vận hành.")
    ];

    private static readonly SystemRoleSeed[] SystemRoleSeeds =
    [
        new("ADMIN", "Administrator", "Toàn quyền hệ thống.", PermissionSeeds.Select(x => x.Code).ToArray()),
        new("HR", "HR Manager", "Quản lý nhân sự và dữ liệu hỗ trợ.", new[]
        {
            PermissionCodes.DashboardView,
            PermissionCodes.MasterBranchesManage,
            PermissionCodes.MasterPositionsManage,
            PermissionCodes.MasterShiftsManage,
            PermissionCodes.HrEmployeesManage,
            PermissionCodes.HrContractsManage,
            PermissionCodes.SecurityAccountsManage,
            PermissionCodes.OpsSchedulesManage,
            PermissionCodes.OpsAttendanceManage,
            PermissionCodes.PayrollManage,
            PermissionCodes.RecruitmentManage,
            PermissionCodes.TrainingManage,
            PermissionCodes.KpiManage,
            PermissionCodes.AuditView,
            PermissionCodes.ProfileView,
            PermissionCodes.LeaveManage,
            PermissionCodes.ShiftSwapManage,
            PermissionCodes.AttendanceAdjustmentManage,
            PermissionCodes.ReportsView,
            PermissionCodes.ReportsExport,
            PermissionCodes.OperationsManage
        }),
        new("MANAGER", "Store Manager", "Quản lý vận hành chi nhánh.", new[]
        {
            PermissionCodes.DashboardView,
            PermissionCodes.OpsSchedulesManage,
            PermissionCodes.OpsAttendanceManage,
            PermissionCodes.PayrollManage,
            PermissionCodes.SelfPayrollView,
            PermissionCodes.SelfAttendance,
            PermissionCodes.ProfileView,
            PermissionCodes.LeaveManage,
            PermissionCodes.ShiftSwapManage,
            PermissionCodes.AttendanceAdjustmentManage,
            PermissionCodes.ReportsView
        }),
        new("EMPLOYEE", "Employee", "Nhân viên sử dụng chức năng tự phục vụ.", new[]
        {
            PermissionCodes.DashboardView,
            PermissionCodes.SelfAttendance,
            PermissionCodes.SelfPayrollView,
            PermissionCodes.SelfShiftView,
            PermissionCodes.SelfShiftSelect,
            PermissionCodes.ProfileView,
            PermissionCodes.OpsSchedulesManage,
            PermissionCodes.HrEmployeesManage,
            PermissionCodes.LeaveManage,
            PermissionCodes.ShiftSwapManage,
            PermissionCodes.AttendanceAdjustmentManage
        })
    ];

    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        await EnsurePermissionsAsync(db, cancellationToken);
        await EnsureSystemRolesAsync(db, cancellationToken);
        await EnsureDefaultAdminAsync(db, cancellationToken);
        await EnsureDemoDataAsync(db, cancellationToken);
        await AssignFallbackSystemRolesAsync(db, cancellationToken);
    }

    private static async Task EnsurePermissionsAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        foreach (var seed in PermissionSeeds)
        {
            var permission = await db.Permissions
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Code == seed.Code, cancellationToken);

            if (permission == null)
            {
                db.Permissions.Add(new Permission
                {
                    Code = seed.Code,
                    Name = seed.Name,
                    Description = seed.Description
                });
            }
            else
            {
                permission.Name = seed.Name;
                permission.Description = seed.Description;
                permission.IsDeleted = false;
                permission.DeletedAt = null;
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureSystemRolesAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var permissions = await db.Permissions
            .IgnoreQueryFilters()
            .ToDictionaryAsync(x => x.Code, x => x, cancellationToken);

        foreach (var seed in SystemRoleSeeds)
        {
            var role = await db.SystemRoles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Code == seed.Code, cancellationToken);

            if (role == null)
            {
                role = new SystemRole
                {
                    Code = seed.Code,
                    Name = seed.Name,
                    Description = seed.Description
                };
                db.SystemRoles.Add(role);
                await db.SaveChangesAsync(cancellationToken);
            }
            else
            {
                role.Name = seed.Name;
                role.Description = seed.Description;
                role.IsActive = true;
                role.IsDeleted = false;
                role.DeletedAt = null;
                await db.SaveChangesAsync(cancellationToken);
            }

            var existingPermissionIds = await db.SystemRolePermissions
                .Where(x => x.SystemRoleId == role.Id)
                .Select(x => x.PermissionId)
                .ToListAsync(cancellationToken);

            foreach (var permissionCode in seed.PermissionCodes)
            {
                if (!permissions.TryGetValue(permissionCode, out var permission) || existingPermissionIds.Contains(permission.Id))
                {
                    continue;
                }

                db.SystemRolePermissions.Add(new SystemRolePermission
                {
                    SystemRoleId = role.Id,
                    PermissionId = permission.Id
                });
            }

            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task EnsureDefaultAdminAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var branch = await db.Branches
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.BranchCode == "BR-HEAD", cancellationToken);

        if (branch == null)
        {
            branch = new Branch
            {
                BranchCode = "BR-HEAD",
                BranchName = "Head Office",
                Address = "Head Office",
                IsActive = true
            };
            db.Branches.Add(branch);
        }
        else
        {
            branch.BranchName = "Head Office";
            branch.Address = "Head Office";
            branch.IsActive = true;
            branch.IsDeleted = false;
            branch.DeletedAt = null;
        }

        await db.SaveChangesAsync(cancellationToken);

        var jobRole = await db.Roles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.RoleName == "System Admin", cancellationToken);

        if (jobRole == null)
        {
            jobRole = new Role
            {
                RoleName = "System Admin",
                Description = "Default job role for the seeded admin account.",
                IsActive = true
            };
            db.Roles.Add(jobRole);
        }
        else
        {
            jobRole.Description = "Default job role for the seeded admin account.";
            jobRole.IsActive = true;
            jobRole.IsDeleted = false;
            jobRole.DeletedAt = null;
        }

        await db.SaveChangesAsync(cancellationToken);

        var employee = await db.Employees
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.EmployeeCode == "EMP-ADMIN", cancellationToken);

        if (employee == null)
        {
            employee = new Employee
            {
                EmployeeCode = "EMP-ADMIN",
                FullName = "System Administrator",
                Gender = GenderType.Other,
                BranchId = branch.Id,
                RoleId = jobRole.Id,
                HireDate = DateTime.UtcNow,
                IsActive = true
            };
            db.Employees.Add(employee);
        }
        else
        {
            employee.FullName = "System Administrator";
            employee.Gender = GenderType.Other;
            employee.BranchId = branch.Id;
            employee.RoleId = jobRole.Id;
            employee.HireDate = employee.HireDate == default ? DateTime.UtcNow : employee.HireDate;
            employee.IsActive = true;
            employee.IsDeleted = false;
            employee.DeletedAt = null;
        }

        await db.SaveChangesAsync(cancellationToken);

        var systemRole = await db.SystemRoles.FirstAsync(x => x.Code == "ADMIN", cancellationToken);
        var adminAccount = await db.UserAccounts
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Username == "admin", cancellationToken);

        if (adminAccount == null)
        {
            db.UserAccounts.Add(new UserAccount
            {
                EmployeeId = employee.Id,
                RoleId = jobRole.Id,
                SystemRoleId = systemRole.Id,
                Username = "admin",
                PasswordHash = PasswordHashHelper.Hash("admin123"),
                IsActive = true
            });
        }
        else
        {
            adminAccount.EmployeeId = employee.Id;
            adminAccount.RoleId = jobRole.Id;
            adminAccount.SystemRoleId = systemRole.Id;
            adminAccount.PasswordHash = PasswordHashHelper.Hash("admin123");
            adminAccount.IsActive = true;
            adminAccount.IsDeleted = false;
            adminAccount.DeletedAt = null;
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureDemoDataAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var today = DateTime.Today;
        var monthStart = new DateTime(today.Year, today.Month, 1);
        var day1 = monthStart;
        var day2 = monthStart.AddDays(1);
        var day3 = monthStart.AddDays(2);
        var selfServiceDate = today <= day3 ? day3.AddDays(1) : today;
        var leaveStart = today.AddDays(7);
        var leaveEnd = leaveStart.AddDays(1);

        var headOffice = await EnsureBranchAsync("BR-HRM", "HRM Demo Head Office", "12 Nguyen Van Bao, Go Vap, HCMC", "0280000001");
        var branchStore = await EnsureBranchAsync("BR-STORE", "HRM Demo Store", "45 Le Loi, District 1, HCMC", "0280000002");

        var hrRole = await EnsureRoleAsync("HR Specialist", "Manages employee records, leave requests and payroll input.");
        var managerRole = await EnsureRoleAsync("Department Manager", "Reviews schedules, attendance and employee requests.");
        var accountantRole = await EnsureRoleAsync("Accountant", "Reviews payroll periods and salary reports.");
        var staffRole = await EnsureRoleAsync("Sales Staff", "Uses employee self-service portal.");

        var systemRoles = await db.SystemRoles.ToDictionaryAsync(x => x.Code, x => x, cancellationToken);
        var hrSystemRole = systemRoles["HR"];
        var managerSystemRole = systemRoles["MANAGER"];
        var employeeSystemRole = systemRoles["EMPLOYEE"];

        var hrEmployee = await EnsureEmployeeAsync("EMP-HR001", "Nguyen Thi HR", GenderType.Female, headOffice.Id, hrRole.Id, "hr.demo@company.local", "0901000001");
        var managerEmployee = await EnsureEmployeeAsync("EMP-MGR001", "Tran Van Manager", GenderType.Male, branchStore.Id, managerRole.Id, "manager.demo@company.local", "0901000002");
        var accountantEmployee = await EnsureEmployeeAsync("EMP-ACC001", "Le Thi Accountant", GenderType.Female, headOffice.Id, accountantRole.Id, "accountant.demo@company.local", "0901000003");
        var employee = await EnsureEmployeeAsync("EMP-NV001", "Pham Van Employee", GenderType.Male, branchStore.Id, staffRole.Id, "employee.demo@company.local", "0901000004");
        var employee2 = await EnsureEmployeeAsync("EMP-NV002", "Do Thi Employee", GenderType.Female, branchStore.Id, staffRole.Id, "employee2.demo@company.local", "0901000005");

        await EnsureAccountAsync(hrEmployee, "hr", "hr123", hrRole.Id, hrSystemRole.Id);
        await EnsureAccountAsync(managerEmployee, "manager", "manager123", managerRole.Id, managerSystemRole.Id);
        await EnsureAccountAsync(accountantEmployee, "accountant", "accountant123", accountantRole.Id, hrSystemRole.Id);
        await EnsureAccountAsync(employee, "employee", "employee123", staffRole.Id, employeeSystemRole.Id);
        await EnsureAccountAsync(employee2, "employee2", "employee123", staffRole.Id, employeeSystemRole.Id);

        var morning = await EnsureShiftAsync("MORNING", "Morning Shift", new TimeSpan(8, 0, 0), new TimeSpan(16, 0, 0), 10);
        var afternoon = await EnsureShiftAsync("AFTERNOON", "Afternoon Shift", new TimeSpan(13, 0, 0), new TimeSpan(21, 0, 0), 10);

        var employeeContract = await EnsureContractAsync("HD-NV001-2026", employee.Id, ContractType.FullTime, 12000000m, 60000m);
        var employee2Contract = await EnsureContractAsync("HD-NV002-2026", employee2.Id, ContractType.FullTime, 11000000m, 55000m);
        await EnsureContractAsync("HD-HR001-2026", hrEmployee.Id, ContractType.FullTime, 16000000m, 80000m);
        await EnsureContractAsync("HD-MGR001-2026", managerEmployee.Id, ContractType.FullTime, 18000000m, 90000m);
        await EnsureContractAsync("HD-ACC001-2026", accountantEmployee.Id, ContractType.FullTime, 15000000m, 75000m);

        var schedule1 = await EnsureScheduleAsync(employee.Id, morning.Id, day1, "Demo attendance: present");
        var schedule2 = await EnsureScheduleAsync(employee.Id, morning.Id, day2, "Demo attendance: late");
        var schedule3 = await EnsureScheduleAsync(employee.Id, afternoon.Id, day3, "Demo attendance: overtime");
        await EnsureScheduleAsync(employee.Id, morning.Id, selfServiceDate, "Demo self-service check-in date");
        await EnsureScheduleAsync(employee2.Id, afternoon.Id, selfServiceDate, "Demo coworker schedule");

        await EnsureAttendanceAsync(employee.Id, morning.Id, schedule1.Id, day1, day1.AddHours(8), day1.AddHours(16), AttendanceStatus.Present, 0, 480, 0, 0);
        await EnsureAttendanceAsync(employee.Id, morning.Id, schedule2.Id, day2, day2.AddHours(8).AddMinutes(25), day2.AddHours(16), AttendanceStatus.Late, 15, 455, 0, 0);
        await EnsureAttendanceAsync(employee.Id, afternoon.Id, schedule3.Id, day3, day3.AddHours(13), day3.AddHours(21).AddMinutes(45), AttendanceStatus.Overtime, 0, 525, 45, 0);

        await EnsureLeaveRequestAsync(employee.Id, monthStart.AddDays(5), monthStart.AddDays(5), "Annual Leave", LeaveRequestStatus.Approved, hrEmployee.Id, "Approved demo leave.");
        await EnsureLeaveRequestAsync(employee.Id, leaveStart, leaveEnd, "Annual Leave", LeaveRequestStatus.Pending, null, "Pending demo leave.");
        await EnsureLeaveRequestAsync(employee2.Id, leaveStart.AddDays(1), leaveStart.AddDays(1), "Personal Leave", LeaveRequestStatus.Rejected, hrEmployee.Id, "Rejected demo leave.");

        await EnsurePayrollAsync(employee.Id, employeeContract.Id, today.Month, today.Year, PayrollStatus.Approved, 1410000m, 24.25m, 60000m, 45000m, 500000m, 300000m, 15000m, 300000m, 120000m, "Demo approved payroll.");
        await EnsurePayrollAsync(employee2.Id, employee2Contract.Id, today.Month, today.Year, PayrollStatus.Generated, 1320000m, 24m, 55000m, 0m, 450000m, 200000m, 0m, 280000m, 100000m, "Demo generated payroll.");

        async Task<Branch> EnsureBranchAsync(string code, string name, string address, string phone)
        {
            var branch = await db.Branches.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.BranchCode == code, cancellationToken);
            if (branch == null)
            {
                branch = new Branch { BranchCode = code, BranchName = name, Address = address, Phone = phone, IsActive = true };
                db.Branches.Add(branch);
            }
            else
            {
                branch.BranchName = name;
                branch.Address = address;
                branch.Phone = phone;
                branch.IsActive = true;
                branch.IsDeleted = false;
                branch.DeletedAt = null;
            }

            await db.SaveChangesAsync(cancellationToken);
            return branch;
        }

        async Task<Role> EnsureRoleAsync(string name, string description)
        {
            var role = await db.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.RoleName == name, cancellationToken);
            if (role == null)
            {
                role = new Role { RoleName = name, Description = description, IsActive = true };
                db.Roles.Add(role);
            }
            else
            {
                role.Description = description;
                role.IsActive = true;
                role.IsDeleted = false;
                role.DeletedAt = null;
            }

            await db.SaveChangesAsync(cancellationToken);
            return role;
        }

        async Task<Employee> EnsureEmployeeAsync(string code, string name, GenderType gender, int branchId, int roleId, string email, string phone)
        {
            var row = await db.Employees.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.EmployeeCode == code, cancellationToken);
            if (row == null)
            {
                row = new Employee
                {
                    EmployeeCode = code,
                    FullName = name,
                    Gender = gender,
                    BranchId = branchId,
                    RoleId = roleId,
                    Email = email,
                    Phone = phone,
                    Address = "Demo address",
                    HireDate = new DateTime(today.Year, 1, 2),
                    IsActive = true
                };
                db.Employees.Add(row);
            }
            else
            {
                row.FullName = name;
                row.Gender = gender;
                row.BranchId = branchId;
                row.RoleId = roleId;
                row.Email = email;
                row.Phone = phone;
                row.IsActive = true;
                row.IsDeleted = false;
                row.DeletedAt = null;
            }

            await db.SaveChangesAsync(cancellationToken);
            return row;
        }

        async Task EnsureAccountAsync(Employee owner, string username, string password, int roleId, int systemRoleId)
        {
            var account = await db.UserAccounts.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Username == username, cancellationToken);
            if (account == null)
            {
                db.UserAccounts.Add(new UserAccount
                {
                    EmployeeId = owner.Id,
                    RoleId = roleId,
                    SystemRoleId = systemRoleId,
                    Username = username,
                    PasswordHash = PasswordHashHelper.Hash(password),
                    IsActive = true
                });
            }
            else
            {
                account.EmployeeId = owner.Id;
                account.RoleId = roleId;
                account.SystemRoleId = systemRoleId;
                account.PasswordHash = PasswordHashHelper.Hash(password);
                account.IsActive = true;
                account.IsDeleted = false;
                account.DeletedAt = null;
            }

            await db.SaveChangesAsync(cancellationToken);
        }

        async Task<Shift> EnsureShiftAsync(string code, string name, TimeSpan start, TimeSpan end, int graceMinutes)
        {
            var shift = await db.Shifts.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.ShiftCode == code, cancellationToken);
            if (shift == null)
            {
                shift = new Shift { ShiftCode = code, ShiftName = name, StartTime = start, EndTime = end, GraceMinutes = graceMinutes, IsActive = true };
                db.Shifts.Add(shift);
            }
            else
            {
                shift.ShiftName = name;
                shift.StartTime = start;
                shift.EndTime = end;
                shift.GraceMinutes = graceMinutes;
                shift.IsActive = true;
                shift.IsDeleted = false;
                shift.DeletedAt = null;
            }

            await db.SaveChangesAsync(cancellationToken);
            return shift;
        }

        async Task<EmployeeContract> EnsureContractAsync(string contractNo, int employeeId, ContractType type, decimal baseSalary, decimal hourlyRate)
        {
            var contract = await db.EmployeeContracts.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.ContractNo == contractNo, cancellationToken);
            if (contract == null)
            {
                contract = new EmployeeContract
                {
                    ContractNo = contractNo,
                    EmployeeId = employeeId,
                    ContractType = type,
                    StartDate = new DateTime(today.Year, 1, 2),
                    BaseSalary = baseSalary,
                    HourlyRate = hourlyRate,
                    OvertimeRateMultiplier = 1.5m,
                    LatePenaltyPerMinute = 1000m,
                    EarlyLeavePenaltyPerMinute = 1000m,
                    StandardDailyHours = 8m,
                    IsActive = true
                };
                db.EmployeeContracts.Add(contract);
            }
            else
            {
                contract.EmployeeId = employeeId;
                contract.ContractType = type;
                contract.BaseSalary = baseSalary;
                contract.HourlyRate = hourlyRate;
                contract.IsActive = true;
                contract.IsDeleted = false;
                contract.DeletedAt = null;
            }

            await db.SaveChangesAsync(cancellationToken);
            return contract;
        }

        async Task<Schedule> EnsureScheduleAsync(int employeeId, int shiftId, DateTime date, string note)
        {
            var schedule = await db.Schedules.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.ScheduleDate == date.Date, cancellationToken);
            if (schedule == null)
            {
                schedule = new Schedule { EmployeeId = employeeId, ShiftId = shiftId, ScheduleDate = date.Date, Note = note };
                db.Schedules.Add(schedule);
            }
            else
            {
                schedule.ShiftId = shiftId;
                schedule.Note = note;
                schedule.IsDeleted = false;
                schedule.DeletedAt = null;
            }

            await db.SaveChangesAsync(cancellationToken);
            return schedule;
        }

        async Task EnsureAttendanceAsync(int employeeId, int shiftId, int scheduleId, DateTime date, DateTime checkIn, DateTime checkOut, AttendanceStatus status, int late, int working, int overtime, int earlyLeave)
        {
            var attendance = await db.Attendances.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.AttendanceDate == date.Date, cancellationToken);
            if (attendance == null)
            {
                attendance = new Attendance { EmployeeId = employeeId, ShiftId = shiftId, ScheduleId = scheduleId, AttendanceDate = date.Date };
                db.Attendances.Add(attendance);
            }

            attendance.ShiftId = shiftId;
            attendance.ScheduleId = scheduleId;
            attendance.CheckInAt = checkIn;
            attendance.CheckOutAt = checkOut;
            attendance.Status = status;
            attendance.LateMinutes = late;
            attendance.WorkingMinutes = working;
            attendance.OvertimeMinutes = overtime;
            attendance.EarlyLeaveMinutes = earlyLeave;
            attendance.Note = "Seeded demo attendance";
            attendance.IsDeleted = false;
            attendance.DeletedAt = null;
            await db.SaveChangesAsync(cancellationToken);
        }

        async Task EnsureLeaveRequestAsync(int employeeId, DateTime start, DateTime end, string type, LeaveRequestStatus status, int? reviewerEmployeeId, string note)
        {
            var row = await db.LeaveRequests.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.StartDate == start.Date && x.EndDate == end.Date, cancellationToken);
            var reviewerAccountId = reviewerEmployeeId.HasValue
                ? await db.UserAccounts.Where(x => x.EmployeeId == reviewerEmployeeId.Value).Select(x => (int?)x.Id).FirstOrDefaultAsync(cancellationToken)
                : null;

            if (row == null)
            {
                row = new LeaveRequest { EmployeeId = employeeId, StartDate = start.Date, EndDate = end.Date };
                db.LeaveRequests.Add(row);
            }

            row.LeaveType = type;
            row.Reason = "Seeded demo leave request";
            row.TotalDays = (decimal)(end.Date - start.Date).TotalDays + 1;
            row.Status = status;
            row.ReviewedByUserAccountId = status is LeaveRequestStatus.Approved or LeaveRequestStatus.Rejected ? reviewerAccountId : null;
            row.ReviewedAt = status is LeaveRequestStatus.Approved or LeaveRequestStatus.Rejected ? DateTime.UtcNow : null;
            row.DecisionNote = status is LeaveRequestStatus.Approved or LeaveRequestStatus.Rejected ? note : null;
            row.IsDeleted = false;
            row.DeletedAt = null;
            await db.SaveChangesAsync(cancellationToken);
        }

        async Task EnsurePayrollAsync(int employeeId, int contractId, int month, int year, PayrollStatus status, decimal baseAmount, decimal workingHours, decimal hourlyRate, decimal overtimeAmount, decimal allowance, decimal bonus, decimal penalty, decimal insurance, decimal tax, string note)
        {
            var payroll = await db.Payrolls.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.PayrollMonth == month && x.PayrollYear == year, cancellationToken);
            if (payroll == null)
            {
                payroll = new Payroll { EmployeeId = employeeId, PayrollMonth = month, PayrollYear = year };
                db.Payrolls.Add(payroll);
            }

            payroll.EmployeeContractId = contractId;
            payroll.Status = status;
            payroll.BaseAmount = baseAmount;
            payroll.WorkingHours = workingHours;
            payroll.HourlyRate = hourlyRate;
            payroll.OvertimeAmount = overtimeAmount;
            payroll.AllowanceAmount = allowance;
            payroll.BonusAmount = bonus;
            payroll.PenaltyAmount = penalty;
            payroll.InsuranceAmount = insurance;
            payroll.TaxAmount = tax;
            payroll.TotalSalary = baseAmount + overtimeAmount + allowance + bonus - penalty - insurance - tax;
            payroll.ApprovedAt = status is PayrollStatus.Approved or PayrollStatus.Paid ? DateTime.UtcNow : null;
            payroll.PaidDate = status == PayrollStatus.Paid ? DateTime.UtcNow : null;
            payroll.Note = note;
            payroll.IsClosed = false;
            payroll.IsDeleted = false;
            payroll.DeletedAt = null;
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task AssignFallbackSystemRolesAsync(AppDbContext db, CancellationToken cancellationToken)
    {
        var systemRoles = await db.SystemRoles.ToDictionaryAsync(x => x.Code, x => x, cancellationToken);
        var accounts = await db.UserAccounts
            .Include(x => x.Role)
            .Where(x => x.SystemRoleId == null)
            .ToListAsync(cancellationToken);

        if (accounts.Count == 0)
        {
            return;
        }

        foreach (var account in accounts)
        {
            var systemRoleCode = InferSystemRoleCode(account.Role?.RoleName);
            if (!systemRoles.TryGetValue(systemRoleCode, out var systemRole))
            {
                continue;
            }

            account.SystemRoleId = systemRole.Id;
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static string InferSystemRoleCode(string? roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName))
        {
            return "EMPLOYEE";
        }

        var normalized = roleName.Trim().ToLowerInvariant();
        if (normalized.Contains("admin") || normalized.Contains("quản trị") || normalized.Contains("quan tri"))
        {
            return "ADMIN";
        }

        if (normalized.Contains("hr") || normalized.Contains("nhân sự") || normalized.Contains("nhan su") || normalized.Contains("tuyển"))
        {
            return "HR";
        }

        if (normalized.Contains("manager") || normalized.Contains("quản lý") || normalized.Contains("quan ly"))
        {
            return "MANAGER";
        }

        return "EMPLOYEE";
    }
}
