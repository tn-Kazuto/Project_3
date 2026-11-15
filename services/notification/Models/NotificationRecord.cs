namespace JamesThew.NotificationService.Models;

/// <summary>A notification delivered to one registered user.</summary>
public sealed class NotificationRecord
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? TargetUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? EventKey { get; set; }
}

/// <summary>Notification-service projection of a subscribed account.</summary>
public sealed class NotificationRecipient
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime UpdatedAt { get; set; }
}

/// <summary>Tracks one-time data imports performed during service extraction.</summary>
public sealed class NotificationImportMarker
{
    public string ImportKey { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; }
}
