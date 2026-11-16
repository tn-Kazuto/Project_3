using JamesThew.ContestService.DTOs;
using JamesThew.ContestService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.ContestService.Controllers;

[ApiController]
[Route("api/announcements")]
public sealed class AnnouncementsController(AnnouncementApplicationService announcementService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public Task<ApiResponse<IEnumerable<AnnouncementDto>>> GetAll(CancellationToken cancellationToken) =>
        announcementService.GetAllAsync(cancellationToken);

    [HttpGet("paged")]
    [AllowAnonymous]
    public Task<ApiResponse<PagedResult<AnnouncementDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default) =>
        announcementService.GetPagedAsync(page, pageSize, cancellationToken);

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var response = await announcementService.GetByIdAsync(id, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateAnnouncementRequest request, CancellationToken cancellationToken)
    {
        var response = await announcementService.CreateAsync(request, cancellationToken);
        return response.Success ? StatusCode(StatusCodes.Status201Created, response) : BadRequest(response);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var response = await announcementService.DeleteAsync(id, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }
}
