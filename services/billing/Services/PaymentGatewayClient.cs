using System.Net.Http.Json;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.DTOs.Common;

namespace JamesThew.BillingService.Services;

public sealed class PaymentGatewayClient
{
    private readonly HttpClient _httpClient;
    private readonly string _serviceKey;

    public PaymentGatewayClient(HttpClient httpClient, IConfiguration configuration)
    {
        var baseUrl = configuration["Payment:BaseUrl"];
        IsEnabled = !string.IsNullOrWhiteSpace(baseUrl);
        if (IsEnabled)
        {
            httpClient.BaseAddress = new Uri(baseUrl!, UriKind.Absolute);
            httpClient.Timeout = TimeSpan.FromSeconds(15);
        }
        _httpClient = httpClient;
        _serviceKey = configuration["Payment:ServiceKey"] ?? configuration["Billing:ServiceKey"] ?? string.Empty;
    }

    public bool IsEnabled { get; }

    public async Task<PaymentChargeResultDto?> ChargeAsync(
        PaymentChargeRequest request,
        string idempotencyKey,
        CancellationToken cancellationToken)
    {
        if (!IsEnabled || string.IsNullOrWhiteSpace(_serviceKey))
        {
            return null;
        }

        using var message = new HttpRequestMessage(HttpMethod.Post, "/internal/payments/charge");
        message.Headers.TryAddWithoutValidation("Idempotency-Key", idempotencyKey);
        message.Headers.TryAddWithoutValidation("X-Service-Key", _serviceKey);
        message.Content = JsonContent.Create(request);

        using var response = await _httpClient.SendAsync(message, cancellationToken);
        var envelope = await response.Content.ReadFromJsonAsync<ApiResponse<PaymentChargeResultDto>>(
            cancellationToken: cancellationToken);
        if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
        {
            throw new BillingValidationException(envelope?.Message ?? "Payment authorization failed.");
        }

        return envelope.Data;
    }
}
