using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Notifications controller delivering in-app notification center data and unread counts.
    /// Accessible by authenticated members and administrators.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private int? GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }

        /// <summary>
        /// Retrieves all notifications for the authenticated user.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<NotificationDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(ApiResponse<IEnumerable<NotificationDto>>.Fail("Unauthorized."));

            var result = await _notificationService.GetUserNotificationsAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves notification summary (unread count + recent notifications) for navbar bell.
        /// </summary>
        [HttpGet("summary")]
        [ProducesResponseType(typeof(ApiResponse<NotificationSummaryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSummary()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(ApiResponse<NotificationSummaryDto>.Fail("Unauthorized."));

            var result = await _notificationService.GetUserSummaryAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves the count of unread notifications for navbar badge.
        /// </summary>
        [HttpGet("unread-count")]
        [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(ApiResponse<int>.Fail("Unauthorized."));

            var result = await _notificationService.GetUnreadCountAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Marks a single notification as read.
        /// </summary>
        [HttpPut("{id}/read")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(ApiResponse<bool>.Fail("Unauthorized."));

            var result = await _notificationService.MarkAsReadAsync(id, userId.Value);
            if (!result.Success) return NotFound(result);

            return Ok(result);
        }

        /// <summary>
        /// Marks all unread notifications of the user as read.
        /// </summary>
        [HttpPut("read-all")]
        [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized(ApiResponse<int>.Fail("Unauthorized."));

            var result = await _notificationService.MarkAllAsReadAsync(userId.Value);
            return Ok(result);
        }
    }
}

