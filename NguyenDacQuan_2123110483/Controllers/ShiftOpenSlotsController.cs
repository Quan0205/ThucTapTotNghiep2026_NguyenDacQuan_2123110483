using CoffeeHRM.Dtos;
using CoffeeHRM.Models;
using CoffeeHRM.Services;
using Microsoft.AspNetCore.Mvc;

namespace CoffeeHRM.Controllers;

[Route("api/shift-open-slots")]
[ApiController]
[PermissionAuthorize(PermissionCodes.OpsSchedulesManage)]
public class ShiftOpenSlotsController : ControllerBase
{
    private readonly IShiftOpenSlotService _shiftOpenSlotService;

    public ShiftOpenSlotsController(IShiftOpenSlotService shiftOpenSlotService)
    {
        _shiftOpenSlotService = shiftOpenSlotService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ShiftOpenSlotResponseDto>>> GetAll(
        [FromQuery] DateTime? weekStart,
        [FromQuery] int? branchId,
        [FromQuery] int? shiftId,
        CancellationToken cancellationToken)
        => Ok(await _shiftOpenSlotService.GetAllAsync(weekStart, branchId, shiftId, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ShiftOpenSlotResponseDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var slot = await _shiftOpenSlotService.GetByIdAsync(id, cancellationToken);
        return slot == null ? NotFound() : Ok(slot);
    }

    [HttpPost]
    public async Task<ActionResult<ShiftOpenSlotResponseDto>> Create([FromBody] ShiftOpenSlotUpsertDto request, CancellationToken cancellationToken)
    {
        var result = await _shiftOpenSlotService.CreateAsync(request, cancellationToken);
        return result.Error == null
            ? CreatedAtAction(nameof(GetById), new { id = result.Slot!.Id }, result.Slot)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<ShiftOpenSlotBulkCreateResultDto>> BulkCreate([FromBody] ShiftOpenSlotBulkCreateDto request, CancellationToken cancellationToken)
    {
        var result = await _shiftOpenSlotService.BulkCreateAsync(request, cancellationToken);
        return result.Error == null
            ? Ok(result.Result)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ShiftOpenSlotUpsertDto request, CancellationToken cancellationToken)
    {
        var result = await _shiftOpenSlotService.UpdateAsync(id, request, cancellationToken);
        return result.Success ? NoContent() : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }

    [HttpPost("{id:int}/deactivate")]
    public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken)
    {
        var result = await _shiftOpenSlotService.DeactivateAsync(id, cancellationToken);
        return result.Success ? NoContent() : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remove(int id, CancellationToken cancellationToken)
    {
        var result = await _shiftOpenSlotService.RemoveAsync(id, cancellationToken);
        return result.Success ? NoContent() : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }
}
