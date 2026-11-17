using System.Security.Cryptography;
using System.Text;
using JamesThew.PaymentService.Services;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.PaymentService.Controllers;

[ApiController]
[Route("internal/payments")]
public sealed class InternalPaymentsController(
    PaymentApplicationService paymentService,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("charge")]
    public async Task<IActionResult> Charge(
        PaymentChargeRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
        [FromHeader(Name = "X-Service-Key")] string? serviceKey,
        CancellationToken cancellationToken)
    {
        var configuredServiceKey = configuration["Payment:ServiceKey"] ?? configuration["Billing:ServiceKey"];
        if (string.IsNullOrWhiteSpace(configuredServiceKey) || !HasValidServiceKey(serviceKey, configuredServiceKey))
        {
            return Unauthorized(ApiResponse<PaymentChargeResultDto>.Fail("Service authentication failed."));
        }
        if (string.IsNullOrWhiteSpace(idempotencyKey) || idempotencyKey.Length > 100)
        {
            return BadRequest(ApiResponse<PaymentChargeResultDto>.Fail("A valid idempotency key is required."));
        }

        try
        {
            var result = await paymentService.ChargeAsync(request, idempotencyKey, cancellationToken);
            return Ok(ApiResponse<PaymentChargeResultDto>.Ok(result, "Payment processed."));
        }
        catch (PaymentValidationException exception)
        {
            return BadRequest(ApiResponse<PaymentChargeResultDto>.Fail(exception.Message));
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
