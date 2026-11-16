using System.Security.Claims;
using JamesThew.BillingService.Services;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.BillingService.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize(Roles = "MEMBER,ADMIN")]
public sealed class PaymentsController(BillingApplicationService billing) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BillingPaymentDto>>>> GetMine(CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
        {
            return Unauthorized(ApiResponse<IReadOnlyList<BillingPaymentDto>>.Fail("Unauthorized."));
        }

        var payments = await billing.GetPaymentsAsync(userId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<BillingPaymentDto>>.Ok(payments));
    }
}
