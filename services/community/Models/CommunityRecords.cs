namespace JamesThew.CommunityService.Models;

public sealed class FeedbackRecord
{
    public int FeedbackId { get; set; }
    public int? RecipeId { get; set; }
    public string? RecipeTitle { get; set; }
    public int? UserId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public string? MediaUrl { get; set; }
    public int? Rating { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class ShareLogRecord
{
    public long ShareLogId { get; set; }
    public int RecipeId { get; set; }
    public int? UserId { get; set; }
    public string Channel { get; set; } = "external";
    public DateTime SharedAtUtc { get; set; }
}

public sealed class RecipeShareBaseline
{
    public int RecipeId { get; set; }
    public int LegacyShareCount { get; set; }
}

public sealed class CommunityMigrationMarker
{
    public string MigrationKey { get; set; } = string.Empty;
    public DateTime AppliedAtUtc { get; set; }
}
