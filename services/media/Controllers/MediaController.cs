using System.Security.Claims;
using JamesThew.MediaService.Data;
using JamesThew.MediaService.DTOs;
using JamesThew.MediaService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.MediaService.Controllers;

[ApiController]
[Route("api/media")]
[Authorize(Roles = "MEMBER,ADMIN")]
public sealed class MediaController(
    MediaDbContext dbContext,
    CloudinaryUploadProvider cloudinary) : ControllerBase
{
    [HttpPost("upload-ticket")]
    [ProducesResponseType(typeof(ApiResponse<UploadTicketResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateUploadTicket(
        CreateUploadTicketRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<UploadTicketResponse>.Fail("Unauthorized."));
        }

        if (!cloudinary.IsConfigured)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                ApiResponse<UploadTicketResponse>.Fail("Media uploads are not configured."));
        }

        if (!cloudinary.IsSupportedContentType(request.Kind, request.ContentType))
        {
            return BadRequest(ApiResponse<UploadTicketResponse>.Fail("This media type is not supported."));
        }

        var now = DateTime.UtcNow;
        var expiresAtUtc = now.AddMinutes(15);
        var ticketId = Guid.NewGuid();
        var response = cloudinary.CreateTicket(ticketId, userId, request.Kind, expiresAtUtc);
        var ticket = new MediaUploadTicket
        {
            TicketId = ticketId,
            UserId = userId,
            ResourceType = cloudinary.GetResourceType(request.Kind),
            ContentType = request.ContentType.Trim().ToLowerInvariant(),
            ExpectedBytes = request.Size,
            PublicId = response.Fields["public_id"],
            CreatedAtUtc = now,
            ExpiresAtUtc = expiresAtUtc
        };

        dbContext.UploadTickets.Add(ticket);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ApiResponse<UploadTicketResponse>.Ok(response, "Upload ticket created."));
    }

    [HttpPost("upload-ticket/{ticketId:guid}/complete")]
    [ProducesResponseType(typeof(ApiResponse<CompletedUploadResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CompleteUpload(
        Guid ticketId,
        CompleteUploadRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<CompletedUploadResponse>.Fail("Unauthorized."));
        }

        var ticket = await dbContext.UploadTickets.SingleOrDefaultAsync(
            item => item.TicketId == ticketId && item.UserId == userId,
            cancellationToken);
        if (ticket is null)
        {
            return NotFound(ApiResponse<CompletedUploadResponse>.Fail("Upload ticket was not found."));
        }

        if (ticket.CompletedAtUtc is not null)
        {
            if (cloudinary.VerifyUpload(ticket, request.PublicId, request.Signature, request.ResourceType,
                    request.Bytes, request.Format, request.Version))
            {
                return Ok(ApiResponse<CompletedUploadResponse>.Ok(ToResponse(ticket), "Upload already completed."));
            }

            return BadRequest(ApiResponse<CompletedUploadResponse>.Fail("Upload response could not be verified."));
        }

        if (ticket.ExpiresAtUtc < DateTime.UtcNow)
        {
            return StatusCode(StatusCodes.Status410Gone,
                ApiResponse<CompletedUploadResponse>.Fail("Upload ticket has expired."));
        }

        if (!cloudinary.VerifyUpload(ticket, request.PublicId, request.Signature, request.ResourceType,
                request.Bytes, request.Format, request.Version))
        {
            return BadRequest(ApiResponse<CompletedUploadResponse>.Fail("Upload response could not be verified."));
        }

        ticket.CompletedAtUtc = DateTime.UtcNow;
        ticket.UploadedBytes = request.Bytes;
        ticket.Format = request.Format.ToLowerInvariant();
        ticket.Version = request.Version;
        ticket.SecureUrl = cloudinary.BuildSecureUrl(ticket, ticket.Format, request.Version);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ApiResponse<CompletedUploadResponse>.Ok(ToResponse(ticket), "Upload completed."));
    }

    private bool TryGetUserId(out int userId) =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out userId);

    private static CompletedUploadResponse ToResponse(MediaUploadTicket ticket) => new(
        ticket.TicketId,
        ticket.SecureUrl!,
        ticket.ResourceType,
        ticket.Format!,
        ticket.UploadedBytes!.Value);
}
