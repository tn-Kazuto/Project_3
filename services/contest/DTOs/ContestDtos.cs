using System.ComponentModel.DataAnnotations;

namespace JamesThew.ContestService.DTOs;

public sealed class ContestDto
{
    public int ContestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ContestType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public int CreatedBy { get; set; }
    public string CreatorName { get; set; } = string.Empty;
    public int EntryCount { get; set; }
}

public sealed class CreateContestRequest
{
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Required] public string ContestType { get; set; } = string.Empty;
    [Required] public DateTime StartDate { get; set; }
    [Required] public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class SubmitEntryRequest
{
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    public string? Ingredients { get; set; }
    public string? CookingProcedure { get; set; }
    public string? TipContent { get; set; }
    [StringLength(100)] public string? GuestName { get; set; }
    [EmailAddress, StringLength(150)] public string? GuestEmail { get; set; }
}

public sealed class ContestEntryDto
{
    public int EntryId { get; set; }
    public int ContestId { get; set; }
    public string ContestTitle { get; set; } = string.Empty;
    public string ContestType { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public string SubmitterName { get; set; } = string.Empty;
    public string SubmitterEmail { get; set; } = string.Empty;
    public bool IsGuest { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Ingredients { get; set; }
    public string? CookingProcedure { get; set; }
    public string? TipContent { get; set; }
    public DateTime SubmittedAt { get; set; }
    public bool IsWinner { get; set; }
    public int VoteCount { get; set; }
    public bool HasUserVoted { get; set; }
}

public sealed class VoteContestEntryRequest
{
    [EmailAddress, StringLength(150)] public string? GuestEmail { get; set; }
}

public sealed class ContestVoteResultDto
{
    public int EntryId { get; set; }
    public int NewVoteCount { get; set; }
    public bool HasVoted { get; set; }
    public string Message { get; set; } = string.Empty;
}

public sealed class AnnouncementDto
{
    public int AnnouncementId { get; set; }
    public int? ContestId { get; set; }
    public string? ContestTitle { get; set; }
    public int? WinnerEntryId { get; set; }
    public string? WinnerTitle { get; set; }
    public string? WinnerName { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
    public bool IsEmailSent { get; set; }
}

public sealed class CreateAnnouncementRequest
{
    public int? ContestId { get; set; }
    public int? WinnerEntryId { get; set; }
    [Required, StringLength(200)] public string Title { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
    public bool SendEmailNotification { get; set; } = true;
}
