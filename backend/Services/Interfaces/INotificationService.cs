using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Service for handling in-app notifications, unread counts, and notification lifecycle.
    /// </summary>
    public interface INotificationService
    {
        /// <summary>Retrieves all notifications for a specific user, sorted newest first.</summary>
        Task<ApiResponse<IEnumerable<NotificationDto>>> GetUserNotificationsAsync(int userId);

        /// <summary>Retrieves summary (unread count + recent notifications) for a specific user.</summary>
        Task<ApiResponse<NotificationSummaryDto>> GetUserSummaryAsync(int userId);

        /// <summary>Retrieves unread notification count for a specific user.</summary>
        Task<ApiResponse<int>> GetUnreadCountAsync(int userId);

        /// <summary>Marks a single notification as read if it belongs to the user.</summary>
        Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId, int userId);

        /// <summary>Marks all notifications for a user as read.</summary>
        Task<ApiResponse<int>> MarkAllAsReadAsync(int userId);

        /// <summary>Creates a notification for a specific user.</summary>
        Task<ApiResponse<NotificationDto>> CreateNotificationAsync(CreateNotificationRequest request);

        /// <summary>Broadcasts a notification to all active users.</summary>
        Task BroadcastNotificationAsync(string title, string message, string? targetUrl = null);
    }
}

