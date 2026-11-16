using System.ComponentModel.DataAnnotations;

namespace JamesThew.CommunityService.DTOs;

public sealed class CreateFeedbackRequest
{
    [Range(1, int.MaxValue)] public int? RecipeId { get; set; }
    [StringLength(100)] public string? SenderName { get; set; }
    [EmailAddress, StringLength(150)] public string? SenderEmail { get; set; }
    [Required, StringLength(5000)] public string Comment { get; set; } = string.Empty;
    [StringLength(500), Url] public string? MediaUrl { get; set; }
    [Range(1, 5)] public int? Rating { get; set; }
}

public sealed class FeedbackDto
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
    public bool IsGuest { get; set; }
}

public sealed class RecipeRatingSummaryDto
{
    public int RecipeId { get; set; }
    public int RatingCount { get; set; }
    public double? AverageRating { get; set; }
    public int FeedbackCount { get; set; }
}

public sealed class ShareRequest
{
    [StringLength(30), RegularExpression("(?i)^(facebook|link|external)$")]
    public string? Channel { get; set; }
}
