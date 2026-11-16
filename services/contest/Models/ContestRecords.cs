namespace JamesThew.ContestService.Models;

public sealed class ContestRecord
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
    public ICollection<ContestEntryRecord> Entries { get; set; } = new List<ContestEntryRecord>();
}

public sealed class ContestEntryRecord
{
    public int EntryId { get; set; }
    public int ContestId { get; set; }
    public int? UserId { get; set; }
    public string? GuestName { get; set; }
    public string? GuestEmail { get; set; }
    public string SubmitterName { get; set; } = string.Empty;
    public string SubmitterEmail { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Ingredients { get; set; }
    public string? CookingProcedure { get; set; }
    public string? TipContent { get; set; }
    public DateTime SubmittedAt { get; set; }
    public bool IsWinner { get; set; }
    public int VoteCount { get; set; }
    public ContestRecord Contest { get; set; } = null!;
    public ICollection<ContestVoteRecord> Votes { get; set; } = new List<ContestVoteRecord>();
}

public sealed class ContestVoteRecord
{
    public int VoteId { get; set; }
    public int ContestEntryId { get; set; }
    public int? UserId { get; set; }
    public string VoterIpOrEmail { get; set; } = string.Empty;
    public string VoterKey { get; set; } = string.Empty;
    public bool IsLegacy { get; set; }
    public DateTime VotedAt { get; set; }
    public ContestEntryRecord Entry { get; set; } = null!;
}

public sealed class AnnouncementRecord
{
    public int AnnouncementId { get; set; }
    public int? ContestId { get; set; }
    public string? ContestTitle { get; set; }
    public int? WinnerEntryId { get; set; }
    public string? WinnerTitle { get; set; }
    public string? WinnerName { get; set; }
    public string? WinnerEmail { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
    public bool IsEmailSent { get; set; }
}

public sealed class ContestOutboxMessage
{
    public long OutboxMessageId { get; set; }
    public string RoutingKey { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
    public int AttemptCount { get; set; }
    public string? LastError { get; set; }
}

public sealed class ContestMigrationMarker
{
    public string MigrationKey { get; set; } = string.Empty;
    public DateTime AppliedAtUtc { get; set; }
}
