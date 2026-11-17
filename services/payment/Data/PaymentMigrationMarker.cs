namespace JamesThew.PaymentService.Data;

public sealed class PaymentMigrationMarker
{
    public string MigrationKey { get; set; } = string.Empty;
    public DateTime CompletedAtUtc { get; set; }
}
