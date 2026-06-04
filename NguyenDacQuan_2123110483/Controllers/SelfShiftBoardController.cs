using CoffeeHRM.Dtos;
using CoffeeHRM.Models;
using CoffeeHRM.Services;
using Microsoft.AspNetCore.Mvc;

namespace CoffeeHRM.Controllers;

[Route("api/self/shift-board")]
[ApiController]
[PermissionAuthorize(PermissionCodes.SelfShiftView)]
public class SelfShiftBoardController : ControllerBase
{
    private readonly IShiftOpenSlotService _shiftOpenSlotService;

    public SelfShiftBoardController(IShiftOpenSlotService shiftOpenSlotService)
    {
        _shiftOpenSlotService = shiftOpenSlotService;
    }

    [HttpGet]
    public async Task<ActionResult<SelfShiftBoardResponseDto>> GetBoard([FromQuery] DateTime? weekStart, CancellationToken cancellationToken)
    {
        var board = await _shiftOpenSlotService.GetSelfBoardAsync(weekStart, cancellationToken);
        return board == null ? Unauthorized() : Ok(board);
    }

    [HttpPost("select")]
    [PermissionAuthorize(PermissionCodes.SelfShiftSelect)]
    public async Task<ActionResult<SelfShiftSelectResultDto>> Select([FromBody] SelfShiftSelectRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _shiftOpenSlotService.SelectAsync(request, cancellationToken);
        return result.Error == null
            ? Ok(result.Result)
            : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }

    [HttpPost("cancel/{scheduleId:int}")]
    [PermissionAuthorize(PermissionCodes.SelfShiftSelect)]
    public async Task<IActionResult> Cancel(int scheduleId, CancellationToken cancellationToken)
    {
        var result = await _shiftOpenSlotService.CancelSelectionAsync(scheduleId, cancellationToken);
        return result.Success ? NoContent() : StatusCode(result.StatusCode ?? StatusCodes.Status400BadRequest, result.Error);
    }
}
