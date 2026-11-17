namespace JamesThew.PaymentService.Data;

public sealed class PaymentRecord
{
    public Guid PaymentId { get; set; }
    public int UserId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public string PlanType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CardLast4 { get; set; } = "4242";
    public string CardHolderName { get; set; } = string.Empty;
    public DateTime PaymentDateUtc { get; set; }
    public string Status { get; set; } = "COMPLETED";
    public string IdempotencyKey { get; set; } = string.Empty;
    public int? LegacySourcePaymentId { get; set; }
}
