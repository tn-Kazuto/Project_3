using System.Security.Claims;
using CoreBackend.DTOs;
using CoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _auditLogService.GetAuditLogsAsync(page, pageSize);
        return Ok(result);
    }
}

[ApiController]
[Route("api/error-logs")]
[Authorize(Roles = "Admin")]
public class ErrorLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public ErrorLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetErrorLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _auditLogService.GetErrorLogsAsync(page, pageSize);
        return Ok(result);
    }
}

[ApiController]
[Route("api/login-histories")]
[Authorize]
public class LoginHistoriesController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public LoginHistoriesController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllHistories([FromQuery] int? userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _auditLogService.GetLoginHistoriesAsync(userId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyLoginHistories([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var myId)) return Unauthorized();

        var result = await _auditLogService.GetLoginHistoriesAsync(myId, page, pageSize);
        return Ok(result);
    }
}

[ApiController]
[Route("api/sessions")]
[Authorize]
public class UserSessionsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public UserSessionsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMySessions()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var myId)) return Unauthorized();

        var result = await _auditLogService.GetUserSessionsAsync(myId);
        return Ok(result);
    }

    [HttpPost("{id}/revoke")]
    public async Task<IActionResult> RevokeSession(int id)
    {
        var result = await _auditLogService.RevokeSessionAsync(id);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}
