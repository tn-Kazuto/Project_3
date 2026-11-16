using backend.DTOs;
using backend.Entities;
using backend.Hubs;
using backend.Repositories;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    /// <summary>
    /// Implements in-app notification services for Chef James Thew Culinary Hub.
    /// Supports user notifications, unread counts, and real-time push via SignalR NotificationHub.
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _uow;
        private readonly ILogger<NotificationService> _logger;
        private readonly IHubContext<NotificationHub>? _hubContext;

        public NotificationService(
            IUnitOfWork uow, 
            ILogger<NotificationService> logger, 
            IHubContext<NotificationHub>? hubContext = null)
        {
            _uow = uow;
            _logger = logger;
            _hubContext = hubContext;
        }

        public async Task<ApiResponse<IEnumerable<NotificationDto>>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _uow.Repository<Notification>().QueryReadOnly()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => MapToDto(n))
                .ToListAsync();

            return ApiResponse<IEnumerable<NotificationDto>>.Ok(notifications);
        }

        public async Task<ApiResponse<NotificationSummaryDto>> GetUserSummaryAsync(int userId)
        {
            var all = await _uow.Repository<Notification>().QueryReadOnly()
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

            var dto = MapToDto(notification);

            // Broadcast real-time SignalR push notification
            if (_hubContext != null)
            {
                try
                {
                    await _hubContext.Clients.Group($"User_{request.UserId}").SendAsync("ReceiveNotification", dto);
                    _logger.LogInformation("SignalR push dispatched to User_{UserId}: {Title}", request.UserId, dto.Title);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to dispatch SignalR notification to User_{UserId}", request.UserId);
                }
            }

            return ApiResponse<NotificationDto>.Ok(dto, "Notification created successfully.");
        }

        public async Task BroadcastNotificationAsync(string title, string message, string? targetUrl = null)
        {
            try
            {
                var userIds = await _uow.Repository<User>().QueryReadOnly()
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

                // SignalR broadcast to all connected clients
                if (_hubContext != null)
                {
                    try
                    {
                        await _hubContext.Clients.All.SendAsync("ReceiveBroadcast", new
                        {
                            title,
                            message,
                            targetUrl,
                            createdAt = now
                        });
                        _logger.LogInformation("SignalR broadcast sent to all clients: {Title}", title);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to broadcast SignalR message");
                    }
                }
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
