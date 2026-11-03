using Microsoft.EntityFrameworkCore;
using backend.DTOs;
using backend.Entities;
using backend.Repositories;

namespace backend.Services
{
    /// <summary>
    /// Implements in-app notification services for Chef James Thew Culinary Hub.
    /// Supports user notifications, unread counts, and community announcements.
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _uow;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IUnitOfWork uow, ILogger<NotificationService> logger)
        {
            _uow = uow;
            _logger = logger;
        }

        public async Task<ApiResponse<IEnumerable<NotificationDto>>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _uow.Repository<Notification>().Query()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => MapToDto(n))
                .ToListAsync();

            return ApiResponse<IEnumerable<NotificationDto>>.Ok(notifications);
        }

        public async Task<ApiResponse<NotificationSummaryDto>> GetUserSummaryAsync(int userId)
        {
            var all = await _uow.Repository<Notification>().Query()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => MapToDto(n))
                .ToListAsync();

            var summary = new NotificationSummaryDto
            {
                UnreadCount = all.Count(n => !n.IsRead),
                RecentNotifications = all.Take(10).ToList()
            };

            return ApiResponse<NotificationSummaryDto>.Ok(summary);
        }

        public async Task<ApiResponse<int>> GetUnreadCountAsync(int userId)
        {
            var count = await _uow.Repository<Notification>().CountAsync(n => n.UserId == userId && !n.IsRead);
            return ApiResponse<int>.Ok(count);
        }

        public async Task<ApiResponse<bool>> MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _uow.Repository<Notification>().Query()
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null)
            {
                return ApiResponse<bool>.Fail("Notification not found.");
            }

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                _uow.Repository<Notification>().Update(notification);
                await _uow.SaveChangesAsync();
            }

            return ApiResponse<bool>.Ok(true, "Notification marked as read.");
        }

        public async Task<ApiResponse<int>> MarkAllAsReadAsync(int userId)
        {
            var unread = await _uow.Repository<Notification>().Query()
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (!unread.Any())
            {
                return ApiResponse<int>.Ok(0, "All notifications are already read.");
            }

            foreach (var item in unread)
            {
                item.IsRead = true;
                _uow.Repository<Notification>().Update(item);
            }

            await _uow.SaveChangesAsync();
            return ApiResponse<int>.Ok(unread.Count, $"{unread.Count} notifications marked as read.");
        }

        public async Task<ApiResponse<NotificationDto>> CreateNotificationAsync(CreateNotificationRequest request)
        {
            var notification = new Notification
            {
                UserId = request.UserId,
                Title = request.Title.Trim(),
                Message = request.Message.Trim(),
                TargetUrl = request.TargetUrl?.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Repository<Notification>().AddAsync(notification);
            await _uow.SaveChangesAsync();

            return ApiResponse<NotificationDto>.Ok(MapToDto(notification), "Notification created successfully.");
        }

        public async Task BroadcastNotificationAsync(string title, string message, string? targetUrl = null)
        {
            try
            {
                var userIds = await _uow.Repository<User>().Query()
                    .Select(u => u.UserId)
                    .ToListAsync();

                if (!userIds.Any()) return;

                var now = DateTime.UtcNow;
                var notifications = userIds.Select(uid => new Notification
                {
                    UserId = uid,
                    Title = title,
                    Message = message,
                    TargetUrl = targetUrl,
                    IsRead = false,
                    CreatedAt = now
                }).ToList();

                await _uow.Repository<Notification>().AddRangeAsync(notifications);
                await _uow.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to broadcast notification: {Title}", title);
            }
        }

        private static NotificationDto MapToDto(Notification n)
        {
            return new NotificationDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                TargetUrl = n.TargetUrl,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            };
        }
    }
}

