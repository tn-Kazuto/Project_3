using System.Net;
using backend.DTOs;
using backend.Entities;
using JamesThew.Shared.Contracts.DTOs.Billing;

namespace backend.Services;

public sealed class BillingServiceClient : IBillingServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly string _serviceKey;

    public BillingServiceClient(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        var baseUrl = configuration["Billing:BaseUrl"] ?? "http://localhost:5002";
        httpClient.BaseAddress = new Uri(baseUrl, UriKind.Absolute);
        httpClient.Timeout = TimeSpan.FromSeconds(20);
        _httpClient = httpClient;
        _serviceKey = configuration["Billing:ServiceKey"] ?? string.Empty;
        IsEnabled = configuration.GetValue("Billing:Enabled", true);
    }

    public bool IsEnabled { get; }

    public Task<BillingSubscriptionDto> CreateRegistrationCheckoutAsync(
        User user,
        RegisterRequest request,
        CancellationToken cancellationToken = default) =>
        SendAsync(new BillingCheckoutRequest
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            PlanType = request.PlanType,
            CardHolderName = request.CardHolderName,
            CardNumber = request.CardNumber,
            ExpiryDate = request.ExpiryDate,
            Cvv = request.Cvv
        }, $"registration-{user.UserId}", cancellationToken);

    public Task<BillingSubscriptionDto> RenewSubscriptionAsync(
        User user,
        RenewSubscriptionRequest request,
        string idempotencyKey,
        CancellationToken cancellationToken = default) =>
        SendAsync(new BillingCheckoutRequest
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            PlanType = request.PlanType,
            CardHolderName = request.CardHolderName,
            CardNumber = request.CardNumber,
            ExpiryDate = request.ExpiryDate,
            Cvv = request.Cvv
        }, idempotencyKey, cancellationToken);

    private async Task<BillingSubscriptionDto> SendAsync(
        BillingCheckoutRequest request,
        string idempotencyKey,
        CancellationToken cancellationToken)
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, "/internal/subscriptions/checkout");
        message.Headers.TryAddWithoutValidation("Idempotency-Key", idempotencyKey);
        if (string.IsNullOrWhiteSpace(_serviceKey))
        {
            throw new BillingServiceException("Billing service authentication is not configured.", HttpStatusCode.ServiceUnavailable);
        }
        message.Headers.TryAddWithoutValidation("X-Service-Key", _serviceKey);

        message.Content = System.Net.Http.Json.JsonContent.Create(request);
        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(message, cancellationToken);
        }
        catch (HttpRequestException exception)
        {
            throw new BillingServiceException("Billing service is unavailable. The account can sign in and retry checkout.", null, exception);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new BillingServiceException("Billing service timed out. Sign in and retry checkout if needed.", null, exception);
        }

        using (response)
        {
            var envelope = await response.Content.ReadFromJsonAsync<JamesThew.Shared.Contracts.DTOs.Common.ApiResponse<BillingSubscriptionDto>>(
                cancellationToken: cancellationToken);
            if (!response.IsSuccessStatusCode || envelope?.Success != true || envelope.Data is null)
            {
                throw new BillingServiceException(
                    envelope?.Message ?? "Billing checkout could not be completed.",
                    response.StatusCode);
            }

            return envelope.Data;
        }
    }
}

public sealed class BillingServiceException(
    string message,
    HttpStatusCode? statusCode,
    Exception? innerException = null) : Exception(message, innerException)
{
    public HttpStatusCode? StatusCode { get; } = statusCode;
    public bool IsClientError => StatusCode is >= HttpStatusCode.BadRequest and < HttpStatusCode.InternalServerError;
}
