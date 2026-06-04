using System.Data;
using CoffeeHRM.Data;
using CoffeeHRM.Dtos;
using CoffeeHRM.Models;
using Microsoft.EntityFrameworkCore;

namespace CoffeeHRM.Services;

public interface IShiftOpenSlotService
{
    Task<IReadOnlyList<ShiftOpenSlotResponseDto>> GetAllAsync(DateTime? weekStart = null, int? branchId = null, int? shiftId = null, CancellationToken cancellationToken = default);
    Task<ShiftOpenSlotResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<(ShiftOpenSlotResponseDto? Slot, string? Error, int? StatusCode)> CreateAsync(ShiftOpenSlotUpsertDto dto, CancellationToken cancellationToken = default);
    Task<(ShiftOpenSlotBulkCreateResultDto? Result, string? Error, int? StatusCode)> BulkCreateAsync(ShiftOpenSlotBulkCreateDto dto, CancellationToken cancellationToken = default);
    Task<(bool Success, string? Error, int? StatusCode)> UpdateAsync(int id, ShiftOpenSlotUpsertDto dto, CancellationToken cancellationToken = default);
    Task<(bool Success, string? Error, int? StatusCode)> DeactivateAsync(int id, CancellationToken cancellationToken = default);
    Task<(bool Success, string? Error, int? StatusCode)> RemoveAsync(int id, CancellationToken cancellationToken = default);
    Task<SelfShiftBoardResponseDto?> GetSelfBoardAsync(DateTime? weekStart = null, CancellationToken cancellationToken = default);
    Task<(SelfShiftSelectResultDto? Result, string? Error, int? StatusCode)> SelectAsync(SelfShiftSelectRequestDto request, CancellationToken cancellationToken = default);
    Task<(bool Success, string? Error, int? StatusCode)> CancelSelectionAsync(int scheduleId, CancellationToken cancellationToken = default);
}

public sealed class ShiftOpenSlotService : IShiftOpenSlotService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ShiftOpenSlotService(AppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<ShiftOpenSlotResponseDto>> GetAllAsync(DateTime? weekStart = null, int? branchId = null, int? shiftId = null, CancellationToken cancellationToken = default)
    {
        var (rangeStart, rangeEnd) = ResolveWeekRange(weekStart);
        var slotsQuery = QuerySlots()
            .Where(x => x.SlotDate >= rangeStart && x.SlotDate < rangeEnd);

        if (branchId.HasValue)
        {
            slotsQuery = slotsQuery.Where(x => x.BranchId == branchId.Value);
        }

        if (shiftId.HasValue)
        {
            slotsQuery = slotsQuery.Where(x => x.ShiftId == shiftId.Value);
        }

        var slots = await slotsQuery
            .OrderBy(x => x.SlotDate)
            .ThenBy(x => x.Branch!.BranchName)
            .ThenBy(x => x.Shift!.StartTime)
            .ToListAsync(cancellationToken);

        return await MapSlotsAsync(slots, cancellationToken);
    }

    public async Task<ShiftOpenSlotResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var slot = await QuerySlots().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (slot == null) return null;
        return (await MapSlotsAsync([slot], cancellationToken)).FirstOrDefault();
    }

    public async Task<(ShiftOpenSlotResponseDto? Slot, string? Error, int? StatusCode)> CreateAsync(ShiftOpenSlotUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var validation = await ValidateUpsertAsync(dto, null, cancellationToken);
        if (validation != null) return (null, validation.Value.Error, validation.Value.StatusCode);

        var entity = new ShiftOpenSlot
        {
            BranchId = dto.BranchId,
            ShiftId = dto.ShiftId,
            SlotDate = dto.SlotDate.Date,
            Capacity = dto.Capacity,
            Note = dto.Note?.Trim(),
            IsActive = true
        };

        _context.ShiftOpenSlots.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(entity.Id, cancellationToken), null, null);
    }

    public async Task<(ShiftOpenSlotBulkCreateResultDto? Result, string? Error, int? StatusCode)> BulkCreateAsync(ShiftOpenSlotBulkCreateDto dto, CancellationToken cancellationToken = default)
    {
        var branchIds = dto.BranchIds.Where(id => id > 0).Distinct().ToArray();
        var shiftIds = dto.ShiftIds.Where(id => id > 0).Distinct().ToArray();
        var slotDates = dto.SlotDates.Select(date => date.Date).Distinct().ToArray();

        if (branchIds.Length == 0 || shiftIds.Length == 0 || slotDates.Length == 0 || dto.Capacity <= 0)
        {
            return (null, "BranchIds, ShiftIds, SlotDates and Capacity are required.", StatusCodes.Status400BadRequest);
        }

        var branchCount = await _context.Branches.CountAsync(x => branchIds.Contains(x.Id), cancellationToken);
        if (branchCount != branchIds.Length)
        {
            return (null, "One or more branches were not found.", StatusCodes.Status400BadRequest);
        }

        var activeShiftCount = await _context.Shifts.CountAsync(x => shiftIds.Contains(x.Id) && x.IsActive, cancellationToken);
        if (activeShiftCount != shiftIds.Length)
        {
            return (null, "One or more shifts were not found or are inactive.", StatusCodes.Status400BadRequest);
        }

        var requestedKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var existingKeys = await _context.ShiftOpenSlots
            .AsNoTracking()
            .Where(x => branchIds.Contains(x.BranchId) && shiftIds.Contains(x.ShiftId) && slotDates.Contains(x.SlotDate))
            .Select(x => new { x.BranchId, x.ShiftId, x.SlotDate })
            .ToListAsync(cancellationToken);

        foreach (var existing in existingKeys)
        {
            requestedKeys.Add(BuildSlotKey(existing.BranchId, existing.ShiftId, existing.SlotDate));
        }

        var entities = new List<ShiftOpenSlot>();
        foreach (var branchId in branchIds)
        {
            foreach (var shiftId in shiftIds)
            {
                foreach (var slotDate in slotDates)
                {
                    var key = BuildSlotKey(branchId, shiftId, slotDate);
                    if (!requestedKeys.Add(key))
                    {
                        continue;
                    }

                    entities.Add(new ShiftOpenSlot
                    {
                        BranchId = branchId,
                        ShiftId = shiftId,
                        SlotDate = slotDate,
                        Capacity = dto.Capacity,
                        Note = dto.Note?.Trim(),
                        IsActive = true
                    });
                }
            }
        }

        if (entities.Count == 0)
        {
            return (new ShiftOpenSlotBulkCreateResultDto("All requested slots already exist.", 0, 0, branchIds.Length * shiftIds.Length * slotDates.Length, Array.Empty<ShiftOpenSlotResponseDto>()), null, null);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        _context.ShiftOpenSlots.AddRange(entities);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var createdIds = entities.Select(entity => entity.Id).ToArray();
        var createdSlots = await QuerySlots()
            .Where(x => createdIds.Contains(x.Id))
            .OrderBy(x => x.SlotDate)
            .ThenBy(x => x.Branch!.BranchName)
            .ThenBy(x => x.Shift!.StartTime)
            .ToListAsync(cancellationToken);

        var mappedSlots = await MapSlotsAsync(createdSlots, cancellationToken);
        var requestedCount = branchIds.Length * shiftIds.Length * slotDates.Length;
        var skippedCount = requestedCount - entities.Count;
        var message = skippedCount > 0
            ? $"Đã tạo {entities.Count} slot, bỏ qua {skippedCount} slot trùng."
            : $"Đã tạo {entities.Count} slot.";

        return (new ShiftOpenSlotBulkCreateResultDto(message, requestedCount, entities.Count, skippedCount, mappedSlots), null, null);
    }

    public async Task<(bool Success, string? Error, int? StatusCode)> UpdateAsync(int id, ShiftOpenSlotUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.ShiftOpenSlots.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity == null) return (false, "Open shift slot not found.", StatusCodes.Status404NotFound);

        var validation = await ValidateUpsertAsync(dto, id, cancellationToken);
        if (validation != null) return (false, validation.Value.Error, validation.Value.StatusCode);

        var selectedCount = await _context.Schedules.CountAsync(x => x.OpenShiftSlotId == id, cancellationToken);
        if (selectedCount > dto.Capacity)
        {
            return (false, "Capacity cannot be less than the number of selected employees.", StatusCodes.Status409Conflict);
        }

        entity.BranchId = dto.BranchId;
        entity.ShiftId = dto.ShiftId;
        entity.SlotDate = dto.SlotDate.Date;
        entity.Capacity = dto.Capacity;
        entity.Note = dto.Note?.Trim();
        entity.IsActive = true;
        await _context.SaveChangesAsync(cancellationToken);
        return (true, null, null);
    }

    public async Task<(bool Success, string? Error, int? StatusCode)> DeactivateAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.ShiftOpenSlots.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity == null) return (false, "Open shift slot not found.", StatusCodes.Status404NotFound);

        var selectedCount = await _context.Schedules.CountAsync(x => x.OpenShiftSlotId == id, cancellationToken);
        if (selectedCount > 0)
        {
            return (false, "Cannot deactivate a slot that already has selected schedules.", StatusCodes.Status409Conflict);
        }

        entity.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);
        return (true, null, null);
    }

    public async Task<SelfShiftBoardResponseDto?> GetSelfBoardAsync(DateTime? weekStart = null, CancellationToken cancellationToken = default)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return null;
        }

        var account = await _context.UserAccounts
            .Include(x => x.Employee).ThenInclude(x => x!.Branch)
            .Include(x => x.Employee).ThenInclude(x => x!.Role)
            .FirstOrDefaultAsync(x => x.Id == _currentUserService.UserId.Value, cancellationToken);
        if (account?.Employee == null || !account.Employee.IsActive)
        {
            return null;
        }

        var (rangeStart, rangeEnd) = ResolveWeekRange(weekStart);
        var slots = await QuerySlots()
            .Where(x => x.SlotDate >= rangeStart && x.SlotDate < rangeEnd && x.IsActive)
            .OrderBy(x => x.SlotDate)
            .ThenBy(x => x.Shift!.StartTime)
            .ToListAsync(cancellationToken);

        var mySchedules = await _context.Schedules
            .Include(x => x.Shift)
            .Include(x => x.Attendance)
            .Include(x => x.OpenShiftSlot)
            .AsNoTracking()
            .Where(x => x.EmployeeId == account.Employee.Id && x.ScheduleDate >= rangeStart && x.ScheduleDate < rangeEnd && x.OpenShiftSlotId != null)
            .OrderBy(x => x.ScheduleDate)
            .ThenBy(x => x.Shift!.StartTime)
            .ToListAsync(cancellationToken);

        return new SelfShiftBoardResponseDto(
            rangeStart,
            rangeEnd.AddDays(-1),
            await MapSlotsAsync(slots, cancellationToken, account.Employee.Id),
            mySchedules.Select(MapBookedSchedule).ToList());
    }

    public async Task<(SelfShiftSelectResultDto? Result, string? Error, int? StatusCode)> SelectAsync(SelfShiftSelectRequestDto request, CancellationToken cancellationToken = default)
    {
        var employeeId = await LoadCurrentEmployeeIdAsync(cancellationToken);
        if (!employeeId.HasValue)
        {
            return (null, "Unauthorized.", StatusCodes.Status401Unauthorized);
        }

        var slot = await _context.ShiftOpenSlots
            .Include(x => x.Branch)
            .Include(x => x.Shift)
            .FirstOrDefaultAsync(x => x.Id == request.OpenShiftSlotId, cancellationToken);
        if (slot == null || !slot.IsActive)
        {
            return (null, "Open shift slot not found.", StatusCodes.Status404NotFound);
        }

        var employee = await _context.Employees.AsNoTracking().FirstOrDefaultAsync(x => x.Id == employeeId.Value, cancellationToken);
        if (employee == null || !employee.IsActive)
        {
            return (null, "Active employee not found.", StatusCodes.Status400BadRequest);
        }

        if (employee.BranchId != slot.BranchId)
        {
            return (null, "This slot belongs to another branch.", StatusCodes.Status409Conflict);
        }

        if (await _context.Schedules.AnyAsync(x => x.EmployeeId == employeeId.Value && x.ScheduleDate == slot.SlotDate.Date, cancellationToken))
        {
            return (null, "You already have a schedule on this date.", StatusCodes.Status409Conflict);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        var selectedCount = await _context.Schedules.CountAsync(x => x.OpenShiftSlotId == slot.Id, cancellationToken);
        if (selectedCount >= slot.Capacity)
        {
            await transaction.RollbackAsync(cancellationToken);
            return (null, "This shift is full.", StatusCodes.Status409Conflict);
        }

        var schedule = new Schedule
        {
            EmployeeId = employeeId.Value,
            ShiftId = slot.ShiftId,
            OpenShiftSlotId = slot.Id,
            ScheduleDate = slot.SlotDate.Date,
            Note = slot.Note
        };

        _context.Schedules.Add(schedule);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return (
            new SelfShiftSelectResultDto(
                "Shift selected successfully.",
                schedule.Id,
                slot.Id,
                slot.SlotDate.Date,
                slot.Capacity,
                selectedCount + 1),
            null,
            null);
    }

    public async Task<(bool Success, string? Error, int? StatusCode)> CancelSelectionAsync(int scheduleId, CancellationToken cancellationToken = default)
    {
        var employeeId = await LoadCurrentEmployeeIdAsync(cancellationToken);
        if (!employeeId.HasValue)
        {
            return (false, "Unauthorized.", StatusCodes.Status401Unauthorized);
        }

        var schedule = await _context.Schedules.Include(x => x.Attendance).FirstOrDefaultAsync(x => x.Id == scheduleId && x.EmployeeId == employeeId.Value, cancellationToken);
        if (schedule == null)
        {
            return (false, "Schedule not found.", StatusCodes.Status404NotFound);
        }

        if (schedule.OpenShiftSlotId == null)
        {
            return (false, "This schedule was assigned by admin and cannot be cancelled here.", StatusCodes.Status409Conflict);
        }

        if (schedule.Attendance != null)
        {
            return (false, "Cannot cancel a schedule that already has attendance.", StatusCodes.Status409Conflict);
        }

        if (schedule.ScheduleDate.Date < DateTime.Today)
        {
            return (false, "Cannot cancel past schedules.", StatusCodes.Status409Conflict);
        }

        _context.Schedules.Remove(schedule);
        await _context.SaveChangesAsync(cancellationToken);
        return (true, null, null);
    }

    public async Task<(bool Success, string? Error, int? StatusCode)> RemoveAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DeactivateAsync(id, cancellationToken);
    }

    private IQueryable<ShiftOpenSlot> QuerySlots()
    {
        return _context.ShiftOpenSlots
            .Include(x => x.Branch)
            .Include(x => x.Shift)
            .AsNoTracking();
    }

    private async Task<IReadOnlyList<ShiftOpenSlotResponseDto>> MapSlotsAsync(IReadOnlyList<ShiftOpenSlot> slots, CancellationToken cancellationToken, int? currentEmployeeId = null)
    {
        var counts = await _context.Schedules
            .AsNoTracking()
            .Where(x => x.OpenShiftSlotId.HasValue && slots.Select(slot => slot.Id).Contains(x.OpenShiftSlotId.Value))
            .GroupBy(x => x.OpenShiftSlotId!.Value)
            .Select(x => new { SlotId = x.Key, Count = x.Count(), MyScheduleId = currentEmployeeId.HasValue ? x.Where(item => item.EmployeeId == currentEmployeeId.Value).Select(item => item.Id).FirstOrDefault() : 0 })
            .ToListAsync(cancellationToken);

        var countLookup = counts.ToDictionary(x => x.SlotId, x => x.Count);
        var myLookup = counts.ToDictionary(x => x.SlotId, x => x.MyScheduleId == 0 ? (int?)null : x.MyScheduleId);

        return slots.Select(slot =>
        {
            var selectedCount = countLookup.TryGetValue(slot.Id, out var count) ? count : 0;
            return new ShiftOpenSlotResponseDto(
                slot.Id,
                slot.BranchId,
                slot.Branch?.BranchName ?? string.Empty,
                slot.ShiftId,
                slot.Shift?.ShiftCode ?? string.Empty,
                slot.Shift?.ShiftName ?? string.Empty,
                slot.Shift?.StartTime ?? TimeSpan.Zero,
                slot.Shift?.EndTime ?? TimeSpan.Zero,
                slot.SlotDate,
                slot.Capacity,
                selectedCount,
                selectedCount >= slot.Capacity,
                slot.IsActive,
                slot.Note,
                myLookup.TryGetValue(slot.Id, out var myScheduleId) ? myScheduleId : null);
        }).ToList();
    }

    private static SelfBookedShiftDto MapBookedSchedule(Schedule schedule)
    {
        return new SelfBookedShiftDto(
            schedule.Id,
            schedule.OpenShiftSlotId ?? 0,
            schedule.ScheduleDate,
            schedule.ShiftId,
            schedule.Shift?.ShiftCode ?? string.Empty,
            schedule.Shift?.ShiftName ?? string.Empty,
            schedule.Shift?.StartTime ?? TimeSpan.Zero,
            schedule.Shift?.EndTime ?? TimeSpan.Zero,
            schedule.Note,
            schedule.Attendance?.Id,
            schedule.Attendance == null ? null : (int)schedule.Attendance.Status,
            schedule.Attendance?.CheckInAt,
            schedule.Attendance?.CheckOutAt);
    }

    private async Task<int?> LoadCurrentEmployeeIdAsync(CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return null;
        }

        return await _context.UserAccounts
            .AsNoTracking()
            .Where(x => x.Id == _currentUserService.UserId.Value)
            .Select(x => x.EmployeeId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<(string Error, int StatusCode)?> ValidateUpsertAsync(ShiftOpenSlotUpsertDto dto, int? slotId, CancellationToken cancellationToken)
    {
        if (dto.BranchId <= 0 || dto.ShiftId <= 0 || dto.Capacity <= 0)
        {
            return ("BranchId, ShiftId and Capacity are required.", StatusCodes.Status400BadRequest);
        }

        if (!await _context.Branches.AnyAsync(x => x.Id == dto.BranchId, cancellationToken))
        {
            return ("Branch not found.", StatusCodes.Status400BadRequest);
        }

        if (!await _context.Shifts.AnyAsync(x => x.Id == dto.ShiftId && x.IsActive, cancellationToken))
        {
            return ("Shift not found.", StatusCodes.Status400BadRequest);
        }

        var slotDate = dto.SlotDate.Date;
        var duplicate = await _context.ShiftOpenSlots.AnyAsync(x => x.Id != slotId && x.BranchId == dto.BranchId && x.ShiftId == dto.ShiftId && x.SlotDate == slotDate, cancellationToken);
        if (duplicate)
        {
            return ("Open slot already exists for this branch, shift and date.", StatusCodes.Status409Conflict);
        }

        return null;
    }

    private static (DateTime Start, DateTime End) ResolveWeekRange(DateTime? weekStart)
    {
        var start = weekStart?.Date ?? DateTime.Today;
        var diff = ((int)start.DayOfWeek + 6) % 7;
        start = start.AddDays(-diff);
        return (start, start.AddDays(7));
    }

    private static string BuildSlotKey(int branchId, int shiftId, DateTime slotDate)
    {
        return $"{branchId}|{shiftId}|{slotDate:yyyy-MM-dd}";
    }
}
