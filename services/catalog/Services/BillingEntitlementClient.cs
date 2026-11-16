using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.DTOs.Common;

namespace JamesThew.CatalogService.Services;

public enum SubscriptionAccess
{
    Active,
    Inactive,
    Unavailable
}

public sealed class BillingEntitlementClient(
    HttpClient httpClient,
    ILogger<BillingEntitlementClient> logger)
{
    public async Task<SubscriptionAccess> GetAccessAsync(string? authorizationHeader, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(authorizationHeader))
        {
            return SubscriptionAccess.Inactive;
        }

        using var request = new HttpRequestMessage(HttpMethod.Get, "api/subscriptions/me");
        request.Headers.TryAddWithoutValidation("Authorization", authorizationHeader);

        try
        {
            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return SubscriptionAccess.Inactive;
            }

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Billing entitlement check returned HTTP {StatusCode}.", (int)response.StatusCode);
                return SubscriptionAccess.Unavailable;
            }

            var payload = await response.Content.ReadFromJsonAsync<ApiResponse<BillingSubscriptionDto>>(
                cancellationToken: cancellationToken);
            return payload is { Success: true, Data.IsActive: true }
                ? SubscriptionAccess.Active
                : payload is { Success: true, Data.IsActive: false }
                    ? SubscriptionAccess.Inactive
                    : SubscriptionAccess.Unavailable;
        }
        catch (Exception exception) when (exception is HttpRequestException or JsonException or OperationCanceledException)
        {
            if (exception is OperationCanceledException && cancellationToken.IsCancellationRequested)
            {
                throw;
            }

            logger.LogWarning(exception, "Billing entitlement check failed; paid catalog access is disabled for this request.");
            return SubscriptionAccess.Unavailable;
        }
    }
}
