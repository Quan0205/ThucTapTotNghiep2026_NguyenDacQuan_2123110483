namespace CoffeeHRM.Dtos;

public sealed record SelfPortalProfileDto(
    int EmployeeId,
    string EmployeeCode,
    string FullName,
    string Username,
    string? BranchName,
    string? RoleName,
    string? SystemRoleName,
    DateTime? LastLoginAt);

public sealed record SelfPortalScheduleDto(
    int Id,
    DateTime ScheduleDate,
    int ShiftId,
    string ShiftCode,
    string ShiftName,
    TimeSpan StartTime,
    TimeSpan EndTime,
    int GraceMinutes,
    string? Note,
    int? AttendanceId,
    int? AttendanceStatus,
    DateTime? CheckInAt,
    DateTime? CheckOutAt);

public sealed record SelfPortalSummaryDto(
    int Month,
    int Year,
    int ScheduleCount,
    int PresentCount,
    int LateCount,
    int EarlyLeaveCount,
    int OvertimeCount,
    int AbsentCount,
    int WorkingMinutes);

public sealed record SelfLeaveBalanceDto(
    int Year,
    decimal AnnualAllowance,
    decimal UsedDays,
    decimal PendingDays,
    decimal RemainingDays);

public sealed record SelfPortalResponseDto(
    SelfPortalProfileDto Profile,
    IReadOnlyList<SelfPortalScheduleDto> Schedules,
    SelfPortalSummaryDto Summary,
    SelfLeaveBalanceDto LeaveBalance);

public sealed record SelfPayrollSummaryDto(
    int Id,
    int PayrollMonth,
    int PayrollYear,
    decimal TotalSalary,
    int Status,
    bool IsClosed,
    DateTime? PaidDate,
    DateTime? ApprovedAt,
    string? Note);

public sealed record SelfAttendanceRequestDto(
    DateTime? AttendanceDate,
    string? Note);

public sealed record SelfAttendanceResultDto(
    string Message,
    int AttendanceId,
    DateTime AttendanceDate,
    int Status,
    int LateMinutes,
    int WorkingMinutes,
    int OvertimeMinutes,
    int EarlyLeaveMinutes);
