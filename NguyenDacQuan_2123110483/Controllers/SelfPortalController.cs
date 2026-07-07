using CoffeeHRM.Data;
using CoffeeHRM.Dtos;
using CoffeeHRM.Models;
using CoffeeHRM.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoffeeHRM.Controllers;

[Route("api/self")]
[ApiController]
[PermissionAuthorize(PermissionCodes.ProfileView)]
public class SelfPortalController : ControllerBase
{
    private const decimal AnnualLeaveAllowance = 12m;

    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAttendanceService _attendanceService;

    public SelfPortalController(
        AppDbContext context,
        ICurrentUserService currentUserService,
        IAttendanceService attendanceService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _attendanceService = attendanceService;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<SelfPortalResponseDto>> GetOverview(CancellationToken cancellationToken)
    {
        var account = await LoadCurrentAccountAsync(cancellationToken);
        if (account?.Employee == null)
        {
            return Unauthorized();
        }

        var employee = account.Employee;
        var startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1);

        var schedules = await _context.Schedules
            .Include(x => x.Shift)
            .Include(x => x.Attendance)
            .Where(x => x.EmployeeId == employee.Id)
            .OrderByDescending(x => x.ScheduleDate)
            .Take(14)
            .ToListAsync(cancellationToken);

        var attendances = await _context.Attendances
            .AsNoTracking()
            .Where(x => x.EmployeeId == employee.Id && x.AttendanceDate >= startOfMonth && x.AttendanceDate < endOfMonth)
            .ToListAsync(cancellationToken);

        var leaveStart = new DateTime(DateTime.Now.Year, 1, 1);
        var leaveEnd = leaveStart.AddYears(1);
        var leaveRequests = await _context.LeaveRequests
            .AsNoTracking()
            .Where(x => x.EmployeeId == employee.Id && x.StartDate >= leaveStart && x.StartDate < leaveEnd)
            .ToListAsync(cancellationToken);
        var approvedLeaveDays = leaveRequests.Where(x => x.Status == LeaveRequestStatus.Approved).Sum(x => x.TotalDays);
        var pendingLeaveDays = leaveRequests.Where(x => x.Status == LeaveRequestStatus.Pending).Sum(x => x.TotalDays);

        var summary = new SelfPortalSummaryDto(
            DateTime.Now.Month,
            DateTime.Now.Year,
            schedules.Count,
            attendances.Count(x => x.Status == AttendanceStatus.Present),
            attendances.Count(x => x.LateMinutes > 0),
            attendances.Count(x => x.EarlyLeaveMinutes > 0),
            attendances.Count(x => x.OvertimeMinutes > 0),
            attendances.Count(x => x.Status == AttendanceStatus.Absent),
            attendances.Sum(x => x.WorkingMinutes));

        return Ok(new SelfPortalResponseDto(
            new SelfPortalProfileDto(
                employee.Id,
                employee.EmployeeCode,
                employee.FullName,
                account.Username,
                employee.Branch?.BranchName,
                employee.Role?.RoleName,
                account.SystemRole?.Name ?? account.SystemRole?.Code,
                account.LastLoginAt),
            schedules.Select(MapSchedule).ToList(),
            summary,
            new SelfLeaveBalanceDto(
                DateTime.Now.Year,
                AnnualLeaveAllowance,
                approvedLeaveDays,
                pendingLeaveDays,
                Math.Max(0m, AnnualLeaveAllowance - approvedLeaveDays - pendingLeaveDays))));
    }

    [HttpGet("payrolls")]
    [PermissionAuthorize(PermissionCodes.SelfPayrollView)]
    public async Task<ActionResult<IReadOnlyList<SelfPayrollSummaryDto>>> GetPayrolls(CancellationToken cancellationToken)
    {
        var employeeId = await LoadCurrentEmployeeIdAsync(cancellationToken);
        if (!employeeId.HasValue)
        {
            return Unauthorized();
        }

        var payrolls = await _context.Payrolls
            .AsNoTracking()
            .Where(x => x.EmployeeId == employeeId.Value)
            .OrderByDescending(x => x.PayrollYear)
            .ThenByDescending(x => x.PayrollMonth)
            .Take(8)
            .Select(x => new SelfPayrollSummaryDto(
                x.Id,
                x.PayrollMonth,
                x.PayrollYear,
                x.TotalSalary,
                (int)x.Status,
                x.IsClosed,
                x.PaidDate,
                x.ApprovedAt,
                x.Note))
            .ToListAsync(cancellationToken);

        return Ok(payrolls);
    }

    [HttpPost("attendance/check-in")]
    [PermissionAuthorize(PermissionCodes.SelfAttendance)]
    public async Task<ActionResult<SelfAttendanceResultDto>> CheckIn([FromBody] SelfAttendanceRequestDto request, CancellationToken cancellationToken)
    {
        var employeeId = await LoadCurrentEmployeeIdAsync(cancellationToken);
        if (!employeeId.HasValue)
        {
            return Unauthorized();
        }

        var result = await _attendanceService.CheckInAsync(
            new CheckInRequestDto(employeeId.Value, request.AttendanceDate, request.Note),
            cancellationToken);

        return result.Error == null && result.Attendance != null
            ? Ok(new SelfAttendanceResultDto(
                "Check-in successful.",
                result.Attendance.Id,
                result.Attendance.AttendanceDate,
                result.Attendance.Status,
                result.Attendance.LateMinutes,
                result.Attendance.WorkingMinutes,
                result.Attendance.OvertimeMinutes,
                result.Attendance.EarlyLeaveMinutes))
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }

    [HttpPost("attendance/check-out")]
    [PermissionAuthorize(PermissionCodes.SelfAttendance)]
    public async Task<ActionResult<SelfAttendanceResultDto>> CheckOut([FromBody] SelfAttendanceRequestDto request, CancellationToken cancellationToken)
    {
        var employeeId = await LoadCurrentEmployeeIdAsync(cancellationToken);
        if (!employeeId.HasValue)
        {
            return Unauthorized();
        }

        var result = await _attendanceService.CheckOutAsync(
            new CheckOutRequestDto(employeeId.Value, request.AttendanceDate),
            cancellationToken);

        return result.Error == null && result.Attendance != null
            ? Ok(new SelfAttendanceResultDto(
                "Check-out successful.",
                result.Attendance.Id,
                result.Attendance.AttendanceDate,
                result.Attendance.Status,
                result.Attendance.LateMinutes,
                result.Attendance.WorkingMinutes,
                result.Attendance.OvertimeMinutes,
                result.Attendance.EarlyLeaveMinutes))
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }

    private async Task<int?> LoadCurrentEmployeeIdAsync(CancellationToken cancellationToken)
    {
        var account = await LoadCurrentAccountAsync(cancellationToken);
        return account?.EmployeeId;
    }

    private async Task<UserAccount?> LoadCurrentAccountAsync(CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return null;
        }

        return await _context.UserAccounts
            .Include(x => x.Employee).ThenInclude(x => x!.Branch)
            .Include(x => x.Employee).ThenInclude(x => x!.Role)
            .Include(x => x.SystemRole)
            .FirstOrDefaultAsync(x => x.Id == _currentUserService.UserId.Value, cancellationToken);
    }

    private static SelfPortalScheduleDto MapSchedule(Schedule schedule)
    {
        return new SelfPortalScheduleDto(
            schedule.Id,
            schedule.ScheduleDate,
            schedule.ShiftId,
            schedule.Shift?.ShiftCode ?? string.Empty,
            schedule.Shift?.ShiftName ?? string.Empty,
            schedule.Shift?.StartTime ?? TimeSpan.Zero,
            schedule.Shift?.EndTime ?? TimeSpan.Zero,
            schedule.Shift?.GraceMinutes ?? 0,
            schedule.Note,
            schedule.Attendance?.Id,
            schedule.Attendance == null ? null : (int)schedule.Attendance.Status,
            schedule.Attendance?.CheckInAt,
            schedule.Attendance?.CheckOutAt);
    }
}
