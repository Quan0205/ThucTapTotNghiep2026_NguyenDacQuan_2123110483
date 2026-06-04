namespace CoffeeHRM.Dtos;

public sealed record PublicRecruitmentApplyRequestDto(
    string FullName,
    string? Phone,
    string? Email,
    string? Note);

public sealed record PublicRecruitmentApplyResultDto(
    int CandidateId,
    string FullName,
    int RecruitmentId,
    string PositionTitle,
    string Message);

