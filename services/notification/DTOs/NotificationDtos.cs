namespace JamesThew.NotificationService.DTOs;

/// <summary>Notification data exposed to the web client.</summary>
public sealed class NotificationDto
{
    public int NotificationId { get; init; }
    public int UserId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? TargetUrl { get; init; }
    public bool IsRead { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>Unread count and the newest notifications shown in the navigation bar.</summary>
public sealed class NotificationSummaryDto
{
    public int UnreadCount { get; init; }
    public IEnumerable<NotificationDto> RecentNotifications { get; init; } = [];
}
