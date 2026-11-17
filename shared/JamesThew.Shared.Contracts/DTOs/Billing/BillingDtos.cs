using System.ComponentModel.DataAnnotations;

namespace JamesThew.Shared.Contracts.DTOs.Billing;

/// <summary>Payment fields used only for the existing simulated checkout flow.</summary>
public sealed class BillingCheckoutRequest
{
    [Range(1, int.MaxValue)]
    public int UserId { get; init; }

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string FullName { get; init; } = string.Empty;

    [Required, StringLength(10)]
    public string PlanType { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string CardHolderName { get; init; } = string.Empty;

    [Required, StringLength(32)]
    public string CardNumber { get; init; } = string.Empty;

    [Required, StringLength(10)]
    public string ExpiryDate { get; init; } = string.Empty;

    [Required, StringLength(4, MinimumLength = 3)]
    public string Cvv { get; init; } = string.Empty;
}

/// <summary>Checkout request made by an authenticated member.</summary>
public sealed class CreateSubscriptionCheckoutRequest
{
    [Required, StringLength(10)]
    public string PlanType { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string CardHolderName { get; init; } = string.Empty;

    [Required, StringLength(32)]
    public string CardNumber { get; init; } = string.Empty;

    [Required, StringLength(10)]
    public string ExpiryDate { get; init; } = string.Empty;

    [Required, StringLength(4, MinimumLength = 3)]
    public string Cvv { get; init; } = string.Empty;
}

public sealed record BillingSubscriptionDto(
    int UserId,
    string PlanType,
    decimal Amount,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive);

public sealed record BillingPaymentDto(
    Guid PaymentId,
    string PlanType,
    decimal Amount,
    DateTime PaymentDate,
    string Status);

public sealed class PaymentChargeRequest
{
    [Range(1, int.MaxValue)]
    public int UserId { get; init; }

    public Guid? SubscriptionId { get; init; }

    [Required, StringLength(10)]
    public string PlanType { get; init; } = string.Empty;

    [Range(0.01, 100000)]
    public decimal Amount { get; init; }

    [Required, StringLength(100)]
    public string CardHolderName { get; init; } = string.Empty;

    [Required, StringLength(32)]
    public string CardNumber { get; init; } = string.Empty;

    [Required, StringLength(10)]
    public string ExpiryDate { get; init; } = string.Empty;

    [Required, StringLength(4, MinimumLength = 3)]
    public string Cvv { get; init; } = string.Empty;
}

public sealed record PaymentChargeResultDto(
    Guid PaymentId,
    int UserId,
    Guid? SubscriptionId,
    string PlanType,
    decimal Amount,
    string CardLast4,
    DateTime PaymentDateUtc,
    string Status);

