using System.Security.Claims;
using JamesThew.NotificationService.DTOs;
using JamesThew.NotificationService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.NotificationService.Controllers;

/// <summary>Notification center endpoints for the authenticated account.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class NotificationsController(NotificationApplicationService notifications) : ControllerBase
{
    /// <summary>Returns notifications belonging to the authenticated account.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<IEnumerable<NotificationDto>>.Fail("Unauthorized."));
        }

        return Ok(await notifications.GetAllAsync(userId, cancellationToken));
    }

    /// <summary>Returns the unread count and the ten newest notifications for the navigation bar.</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<NotificationSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<NotificationSummaryDto>.Fail("Unauthorized."));
        }

        return Ok(await notifications.GetSummaryAsync(userId, cancellationToken));
    }

    /// <summary>Returns the unread notification count for the authenticated account.</summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<int>.Fail("Unauthorized."));
        }

        return Ok(await notifications.GetUnreadCountAsync(userId, cancellationToken));
    }

    /// <summary>Marks one notification as read when it belongs to the authenticated account.</summary>
    [HttpPut("{id:int}/read")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<bool>.Fail("Unauthorized."));
        }

        var result = await notifications.MarkAsReadAsync(id, userId, cancellationToken);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>Marks all notifications belonging to the authenticated account as read.</summary>
    [HttpPut("read-all")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<int>.Fail("Unauthorized."));
        }

        return Ok(await notifications.MarkAllAsReadAsync(userId, cancellationToken));
    }

    private bool TryGetUserId(out int userId)
    {
        var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return int.TryParse(value, out userId);
    }
}
