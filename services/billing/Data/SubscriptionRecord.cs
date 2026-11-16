namespace JamesThew.BillingService.Data;

public sealed class SubscriptionRecord
{
    public Guid SubscriptionId { get; set; }
    public int UserId { get; set; }
    public string PlanType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime StartDateUtc { get; set; }
    public DateTime EndDateUtc { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public Guid? SourcePaymentId { get; set; }
    public int? LegacySourceUserId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
