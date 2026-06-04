using CoffeeHRM.Dtos;
using CoffeeHRM.Models;
using CoffeeHRM.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoffeeHRM.Controllers;

[Route("api/public/recruitments")]
[ApiController]
[AllowAnonymous]
public class PublicRecruitmentsController : ControllerBase
{
    private readonly IRecruitmentService _recruitmentService;
    private readonly ICandidateService _candidateService;

    public PublicRecruitmentsController(IRecruitmentService recruitmentService, ICandidateService candidateService)
    {
        _recruitmentService = recruitmentService;
        _candidateService = candidateService;
    }

    [HttpGet("open")]
    public async Task<ActionResult<IReadOnlyList<RecruitmentResponseDto>>> GetOpenRecruitments(CancellationToken cancellationToken)
    {
        var recruitments = await _recruitmentService.GetAllAsync(cancellationToken);
        var openRecruitments = recruitments
            .Where(x => x.Status is (int)RecruitmentStatus.Open or (int)RecruitmentStatus.InProgress)
            .ToList();

        return Ok(openRecruitments);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RecruitmentResponseDto>> GetRecruitment(int id, CancellationToken cancellationToken)
    {
        var recruitment = await _recruitmentService.GetByIdAsync(id, cancellationToken);
        if (recruitment == null || recruitment.Status is (int)RecruitmentStatus.Closed or (int)RecruitmentStatus.Cancelled)
        {
            return NotFound();
        }

        return Ok(recruitment);
    }

    [HttpPost("{id:int}/apply")]
    public async Task<ActionResult<PublicRecruitmentApplyResultDto>> Apply(int id, [FromBody] PublicRecruitmentApplyRequestDto request, CancellationToken cancellationToken)
    {
        var recruitment = await _recruitmentService.GetByIdAsync(id, cancellationToken);
        if (recruitment == null || recruitment.Status is (int)RecruitmentStatus.Closed or (int)RecruitmentStatus.Cancelled)
        {
            return NotFound("Recruitment not found or closed.");
        }

        var candidateResult = await _candidateService.CreateAsync(
            new CandidateUpsertDto(
                id,
                request.FullName,
                request.Phone,
                request.Email,
                DateTime.UtcNow,
                (int)CandidateStatus.Applied,
                null,
                request.Note),
            cancellationToken);

        if (candidateResult.Error != null || candidateResult.Candidate == null)
        {
            return StatusCode(candidateResult.StatusCode ?? StatusCodes.Status400BadRequest, candidateResult.Error);
        }

        return Ok(new PublicRecruitmentApplyResultDto(
            candidateResult.Candidate.Id,
            candidateResult.Candidate.FullName,
            candidateResult.Candidate.RecruitmentId,
            candidateResult.Candidate.Recruitment?.PositionTitle ?? recruitment.PositionTitle,
            "Application received successfully."));
    }
}
