using System.Security.Cryptography;
using System.Text;
using JamesThew.BillingService.Services;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.BillingService.Controllers;

[ApiController]
[Route("internal/subscriptions")]
public sealed class InternalSubscriptionsController(
    BillingApplicationService billing,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(
        BillingCheckoutRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        [FromHeader(Name = "X-Service-Key")] string? serviceKey,
        CancellationToken cancellationToken)
    {
        var configuredServiceKey = configuration["Billing:ServiceKey"];
        if (string.IsNullOrWhiteSpace(configuredServiceKey) || !HasValidServiceKey(serviceKey, configuredServiceKey))
        {
            return Unauthorized(ApiResponse<BillingSubscriptionDto>.Fail("Service authentication failed."));
        }
        if (string.IsNullOrWhiteSpace(idempotencyKey) || idempotencyKey.Length > 100)
        {
            return BadRequest(ApiResponse<BillingSubscriptionDto>.Fail("A valid idempotency key is required."));
        }

        try
        {
            var result = await billing.CheckoutAsync(request, idempotencyKey, cancellationToken);
            return Ok(ApiResponse<BillingSubscriptionDto>.Ok(result, "Checkout completed."));
        }
        catch (BillingValidationException exception)
        {
            return BadRequest(ApiResponse<BillingSubscriptionDto>.Fail(exception.Message));
        }
    }

    private static bool HasValidServiceKey(string? suppliedKey, string configuredKey)
    {
        if (string.IsNullOrEmpty(suppliedKey)) return false;
        var suppliedBytes = Encoding.UTF8.GetBytes(suppliedKey);
        var configuredBytes = Encoding.UTF8.GetBytes(configuredKey);
        return suppliedBytes.Length == configuredBytes.Length &&
            CryptographicOperations.FixedTimeEquals(suppliedBytes, configuredBytes);
    }
}
