using CoffeeHRM.Dtos;
using CoffeeHRM.Models;
using CoffeeHRM.Services;
using Microsoft.EntityFrameworkCore;

namespace CoffeeHRM.Tests;

public class WorkflowAndReportsTests
{
    [Fact]
    public async Task ApproveAttendanceAdjustment_ShouldRecalculateAttendanceMetrics()
    {
        await using var context = TestDbFactory.CreateContext(nameof(ApproveAttendanceAdjustment_ShouldRecalculateAttendanceMetrics));

        var branch = new Branch { BranchCode = "B1", BranchName = "Main", Address = "Main", IsActive = true };
        var role = new Role { RoleName = "Cashier", IsActive = true };
        var employee = new Employee { EmployeeCode = "E1", FullName = "Employee", Gender = GenderType.Other, Branch = branch, Role = role, IsActive = true };
        var shift = new Shift
        {
            ShiftCode = "S1",
            ShiftName = "Morning",
            StartTime = new TimeSpan(8, 0, 0),
            EndTime = new TimeSpan(16, 0, 0),
            GraceMinutes = 0,
            IsActive = true
        };
        var scheduleDate = new DateTime(2026, 4, 10);
        var schedule = new Schedule { Employee = employee, Shift = shift, ScheduleDate = scheduleDate };
        var attendance = new Attendance
        {
            Employee = employee,
            Shift = shift,
            Schedule = schedule,
            AttendanceDate = scheduleDate,
            CheckInAt = new DateTime(2026, 4, 10, 8, 30, 0),
            CheckOutAt = new DateTime(2026, 4, 10, 16, 30, 0),
            LateMinutes = 30,
            WorkingMinutes = 480,
            OvertimeMinutes = 30,
            EarlyLeaveMinutes = 0,
            Status = AttendanceStatus.Present
        };
        var adjustment = new AttendanceAdjustment
        {
            Attendance = attendance,
            Employee = employee,
            RequestedCheckInAt = new DateTime(2026, 4, 10, 8, 5, 0),
            RequestedCheckOutAt = new DateTime(2026, 4, 10, 17, 15, 0),
            Reason = "Fix scan times"
        };

        context.AddRange(branch, role, employee, shift, schedule, attendance, adjustment);
        await context.SaveChangesAsync();

        var service = new AttendanceAdjustmentService(context, new FakeCurrentUserService());
        var result = await service.ApproveAsync(adjustment.Id, new DecisionNoteDto("Approved"), default);

        Assert.True(result.Success, result.Error);

        var updatedAttendance = await context.Attendances.FirstAsync(x => x.Id == attendance.Id);
        Assert.Equal(5, updatedAttendance.LateMinutes);
        Assert.Equal(550, updatedAttendance.WorkingMinutes);
        Assert.Equal(75, updatedAttendance.OvertimeMinutes);
        Assert.Equal(0, updatedAttendance.EarlyLeaveMinutes);
        Assert.Equal(AttendanceStatus.Overtime, updatedAttendance.Status);
    }

    [Fact]
    public async Task ReportSummary_ShouldRespectBranchFilterForPendingWorkflows()
    {
        await using var context = TestDbFactory.CreateContext(nameof(ReportSummary_ShouldRespectBranchFilterForPendingWorkflows));

        var branchA = new Branch { BranchCode = "BA", BranchName = "Branch A", Address = "A", IsActive = true };
        var branchB = new Branch { BranchCode = "BB", BranchName = "Branch B", Address = "B", IsActive = true };
        var role = new Role { RoleName = "Cashier", IsActive = true };
        var employeeA = new Employee { EmployeeCode = "EA", FullName = "Employee A", Gender = GenderType.Other, Branch = branchA, Role = role, IsActive = true };
        var employeeB = new Employee { EmployeeCode = "EB", FullName = "Employee B", Gender = GenderType.Other, Branch = branchB, Role = role, IsActive = true };

        context.AddRange(branchA, branchB, role, employeeA, employeeB);
        await context.SaveChangesAsync();

        context.LeaveRequests.AddRange(
            new LeaveRequest
            {
                EmployeeId = employeeA.Id,
                StartDate = new DateTime(2026, 4, 10),
                EndDate = new DateTime(2026, 4, 11),
                LeaveType = "Annual",
                TotalDays = 2,
                Status = LeaveRequestStatus.Pending
            },
            new LeaveRequest
            {
                EmployeeId = employeeB.Id,
                StartDate = new DateTime(2026, 4, 12),
                EndDate = new DateTime(2026, 4, 13),
                LeaveType = "Annual",
                TotalDays = 2,
                Status = LeaveRequestStatus.Pending
            });

        context.ShiftSwapRequests.AddRange(
            new ShiftSwapRequest
            {
                RequestEmployeeId = employeeA.Id,
                TargetEmployeeId = employeeB.Id,
                RequestScheduleId = 101,
                TargetScheduleId = 102,
                Status = ShiftSwapStatus.Pending
            },
            new ShiftSwapRequest
            {
                RequestEmployeeId = employeeB.Id,
                TargetEmployeeId = employeeA.Id,
                RequestScheduleId = 201,
                TargetScheduleId = 202,
                Status = ShiftSwapStatus.Pending
            });

        context.AttendanceAdjustments.AddRange(
            new AttendanceAdjustment
            {
                AttendanceId = 301,
                EmployeeId = employeeA.Id,
                Status = AttendanceAdjustmentStatus.Pending
            },
            new AttendanceAdjustment
            {
                AttendanceId = 302,
                EmployeeId = employeeB.Id,
                Status = AttendanceAdjustmentStatus.Pending
            });

        await context.SaveChangesAsync();

        var reportService = new ReportService(context);
        var branchSummary = await reportService.GetSummaryAsync(4, 2026, branchA.Id, default);
        var overallSummary = await reportService.GetSummaryAsync(4, 2026, null, default);

        Assert.Equal(1, branchSummary.ActiveEmployees);
        Assert.Equal(1, branchSummary.PendingLeaveRequests);
        Assert.Equal(1, branchSummary.PendingShiftSwaps);
        Assert.Equal(1, branchSummary.PendingAdjustments);

        Assert.Equal(2, overallSummary.ActiveEmployees);
        Assert.Equal(2, overallSummary.PendingLeaveRequests);
        Assert.Equal(2, overallSummary.PendingShiftSwaps);
        Assert.Equal(2, overallSummary.PendingAdjustments);
    }
}
