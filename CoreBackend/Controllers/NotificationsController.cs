using System.Security.Claims;
using CoreBackend.DTOs;
using CoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.Controllers;

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

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool? unreadOnly)
    {
        var userId = GetCurrentUserId();
        var result = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SendNotification([FromBody] CreateNotificationRequest request)
    {
        var result = await _notificationService.CreateNotificationAsync(request);
        return Ok(result);
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();
        var result = await _notificationService.MarkAsReadAsync(id, userId);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        var result = await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(result);
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}

[ApiController]
[Route("api/[controller]")]
public class AttachmentsController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;
    private readonly IWebHostEnvironment _env;

    public AttachmentsController(IAttachmentService attachmentService, IWebHostEnvironment env)
    {
        _attachmentService = attachmentService;
        _env = env;
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> Upload([FromForm] UploadAttachmentRequest request)
    {
        var uploadFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        var result = await _attachmentService.UploadAsync(request.File, request.EntityName, request.EntityId, uploadFolder);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _attachmentService.GetByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpGet("entity/{entityName}/{entityId}")]
    public async Task<IActionResult> GetByEntity(string entityName, string entityId)
    {
        var result = await _attachmentService.GetByEntityAsync(entityName, entityId);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var result = await _attachmentService.DeleteAsync(id, webRoot);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
