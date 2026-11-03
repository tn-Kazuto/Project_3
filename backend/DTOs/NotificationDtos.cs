using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Notification view DTO for in-app notification bell.
    /// </summary>
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? TargetUrl { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Request DTO for creating an in-app notification.
    /// </summary>
    public class CreateNotificationRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        [StringLength(500)]
        public string? TargetUrl { get; set; }
    }

    /// <summary>
    /// Summary DTO for user's notification status.
    /// </summary>
    public class NotificationSummaryDto
    {
        public int UnreadCount { get; set; }
        public IEnumerable<NotificationDto> RecentNotifications { get; set; } = new List<NotificationDto>();
    }
}

