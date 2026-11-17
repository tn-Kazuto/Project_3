using System.Security.Claims;
using JamesThew.PaymentService.Services;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.PaymentService.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize(Roles = "MEMBER,ADMIN")]
public sealed class PaymentsController(PaymentApplicationService paymentService) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BillingPaymentDto>>>> GetMine(CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
        {
            return Unauthorized(ApiResponse<IReadOnlyList<BillingPaymentDto>>.Fail("Unauthorized."));
        }

        var payments = await paymentService.GetPaymentsByUserAsync(userId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<BillingPaymentDto>>.Ok(payments));
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<BillingPaymentDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var payments = await paymentService.GetAllPaymentsAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<BillingPaymentDto>>.Ok(payments));
    }
}
