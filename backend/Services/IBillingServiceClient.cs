using backend.DTOs;
using backend.Entities;
using JamesThew.Shared.Contracts.DTOs.Billing;

namespace backend.Services;

public interface IBillingServiceClient
{
    bool IsEnabled { get; }
    Task<BillingSubscriptionDto> CreateRegistrationCheckoutAsync(
        User user,
        RegisterRequest request,
        CancellationToken cancellationToken = default);
    Task<BillingSubscriptionDto> RenewSubscriptionAsync(
        User user,
        RenewSubscriptionRequest request,
        string idempotencyKey,
        CancellationToken cancellationToken = default);
}
