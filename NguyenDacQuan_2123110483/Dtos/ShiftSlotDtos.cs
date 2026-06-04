namespace CoffeeHRM.Dtos;

public sealed record ShiftOpenSlotResponseDto(
    int Id,
    int BranchId,
    string BranchName,
    int ShiftId,
    string ShiftCode,
    string ShiftName,
    TimeSpan StartTime,
    TimeSpan EndTime,
    DateTime SlotDate,
    int Capacity,
    int SelectedCount,
    bool IsFull,
    bool IsActive,
    string? Note,
    int? MyScheduleId);

public sealed record ShiftOpenSlotUpsertDto(
    int BranchId,
    int ShiftId,
    DateTime SlotDate,
    int Capacity,
    string? Note);

public sealed record ShiftOpenSlotBulkCreateDto(
    IReadOnlyList<int> BranchIds,
    IReadOnlyList<int> ShiftIds,
    IReadOnlyList<DateTime> SlotDates,
    int Capacity,
    string? Note);

public sealed record ShiftOpenSlotBulkCreateResultDto(
    string Message,
    int RequestedCount,
    int CreatedCount,
    int SkippedCount,
    IReadOnlyList<ShiftOpenSlotResponseDto> Slots);

public sealed record SelfBookedShiftDto(
    int ScheduleId,
    int OpenShiftSlotId,
    DateTime ScheduleDate,
    int ShiftId,
    string ShiftCode,
    string ShiftName,
    TimeSpan StartTime,
    TimeSpan EndTime,
    string? Note,
    int? AttendanceId,
    int? AttendanceStatus,
    DateTime? CheckInAt,
    DateTime? CheckOutAt);

public sealed record SelfShiftBoardResponseDto(
    DateTime WeekStart,
    DateTime WeekEnd,
    IReadOnlyList<ShiftOpenSlotResponseDto> Slots,
    IReadOnlyList<SelfBookedShiftDto> MySchedules);

public sealed record SelfShiftSelectRequestDto(int OpenShiftSlotId);

public sealed record SelfShiftSelectResultDto(
    string Message,
    int ScheduleId,
    int OpenShiftSlotId,
    DateTime SlotDate,
    int Capacity,
    int SelectedCount);
