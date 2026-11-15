using JamesThew.NotificationService.Data;
using JamesThew.NotificationService.DTOs;
using JamesThew.NotificationService.Hubs;
using JamesThew.NotificationService.Models;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.NotificationService.Services;

/// <summary>Reads and updates the notification center for authenticated users.</summary>
public sealed class NotificationApplicationService(
    NotificationDbContext dbContext,
    IHubContext<NotificationsHub> hubContext)
{
    /// <summary>Returns the user's notifications, newest first.</summary>
    public async Task<ApiResponse<IEnumerable<NotificationDto>>> GetAllAsync(int userId, CancellationToken cancellationToken)
    {
        var notifications = await dbContext.Notifications.AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .Select(notification => ToDto(notification))
            .ToListAsync(cancellationToken);

        return ApiResponse<IEnumerable<NotificationDto>>.Ok(notifications);
    }

    /// <summary>Builds the notification bell summary for one user.</summary>
    public async Task<ApiResponse<NotificationSummaryDto>> GetSummaryAsync(int userId, CancellationToken cancellationToken)
    {
        var userNotifications = dbContext.Notifications.AsNoTracking()
            .Where(notification => notification.UserId == userId);

        var unreadCount = await userNotifications.CountAsync(notification => !notification.IsRead, cancellationToken);
        var recentNotifications = await userNotifications
            .OrderByDescending(notification => notification.CreatedAt)
            .Take(10)
            .Select(notification => ToDto(notification))
            .ToListAsync(cancellationToken);

        return ApiResponse<NotificationSummaryDto>.Ok(new NotificationSummaryDto
        {
            UnreadCount = unreadCount,
            RecentNotifications = recentNotifications
        });
    }

    /// <summary>Counts unread notifications for one user.</summary>
    public async Task<ApiResponse<int>> GetUnreadCountAsync(int userId, CancellationToken cancellationToken)
    {
        var count = await dbContext.Notifications.CountAsync(
            notification => notification.UserId == userId && !notification.IsRead,
            cancellationToken);

        return ApiResponse<int>.Ok(count);
    }

    /// <summary>Marks a notification as read if it belongs to the supplied user.</summary>
    public async Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId, int userId, CancellationToken cancellationToken)
    {
        var notification = await dbContext.Notifications.FirstOrDefaultAsync(
            item => item.NotificationId == notificationId && item.UserId == userId,
            cancellationToken);

        if (notification is null)
        {
            return ApiResponse<bool>.Fail("Notification not found.");
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<bool>.Ok(true, "Notification marked as read.");
    }

    /// <summary>Marks every unread notification for one user as read.</summary>
    public async Task<ApiResponse<int>> MarkAllAsReadAsync(int userId, CancellationToken cancellationToken)
    {
        var unread = await dbContext.Notifications
            .Where(notification => notification.UserId == userId && !notification.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in unread)
        {
            notification.IsRead = true;
        }

        if (unread.Count > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<int>.Ok(unread.Count, unread.Count == 0
            ? "All notifications are already read."
            : $"{unread.Count} notifications marked as read.");
    }

    /// <summary>Persists notifications before broadcasting them to connected SignalR clients.</summary>
    public async Task PersistAndPushAsync(IEnumerable<NotificationRecord> notifications, CancellationToken cancellationToken)
    {
        var additions = notifications.ToList();
        if (additions.Count == 0)
        {
            return;
        }

        dbContext.Notifications.AddRange(additions);
        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var notification in additions)
        {
            await hubContext.Clients.Group(notification.UserId.ToString())
                .SendAsync("notificationReceived", ToDto(notification), cancellationToken);
        }
    }

    public static NotificationDto ToDto(NotificationRecord notification) => new()
    {
        NotificationId = notification.NotificationId,
        UserId = notification.UserId,
        Title = notification.Title,
        Message = notification.Message,
        TargetUrl = notification.TargetUrl,
        IsRead = notification.IsRead,
        CreatedAt = notification.CreatedAt
    };
}
