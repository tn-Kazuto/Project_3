using System.Security.Claims;
using JamesThew.BillingService.Services;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.BillingService.Controllers;

[ApiController]
[Route("api/subscriptions")]
[Authorize(Roles = "MEMBER,ADMIN")]
public sealed class SubscriptionsController(BillingApplicationService billing) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrent(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(ApiResponse<BillingSubscriptionDto>.Fail("Unauthorized."));
        var subscription = await billing.GetCurrentSubscriptionAsync(userId, cancellationToken);
        return subscription is null
            ? NotFound(ApiResponse<BillingSubscriptionDto>.Fail("No active subscription was found."))
            : Ok(ApiResponse<BillingSubscriptionDto>.Ok(subscription));
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(
        CreateSubscriptionCheckoutRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(ApiResponse<BillingSubscriptionDto>.Fail("Unauthorized."));
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;
        var fullName = User.FindFirst("FullName")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
        return await CheckoutCoreAsync(new BillingCheckoutRequest
        {
            UserId = userId,
            Email = email,
            FullName = fullName,
            PlanType = request.PlanType,
            CardHolderName = request.CardHolderName,
            CardNumber = request.CardNumber,
            ExpiryDate = request.ExpiryDate,
            Cvv = request.Cvv
        }, idempotencyKey, cancellationToken);
    }

    private async Task<IActionResult> CheckoutCoreAsync(
        BillingCheckoutRequest request,
        string? idempotencyKey,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(idempotencyKey))
        {
            return BadRequest(ApiResponse<BillingSubscriptionDto>.Fail("Idempotency-Key header is required."));
        }

        try
        {
            var result = await billing.CheckoutAsync(request, idempotencyKey, cancellationToken);
            return Ok(ApiResponse<BillingSubscriptionDto>.Ok(result, "Subscription checkout completed."));
        }
        catch (BillingValidationException exception)
        {
            return BadRequest(ApiResponse<BillingSubscriptionDto>.Fail(exception.Message));
        }
    }

    private bool TryGetUserId(out int userId) =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out userId);
}
