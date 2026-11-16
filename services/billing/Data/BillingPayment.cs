namespace JamesThew.BillingService.Data;

public sealed class BillingPayment
{
    public Guid PaymentId { get; set; }
    public int UserId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public string PlanType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime PaymentDateUtc { get; set; }
    public string Status { get; set; } = "COMPLETED";
    public string IdempotencyKey { get; set; } = string.Empty;
    public int? LegacySourcePaymentId { get; set; }
}
