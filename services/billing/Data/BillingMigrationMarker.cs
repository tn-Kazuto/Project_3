namespace JamesThew.BillingService.Data;

public sealed class BillingMigrationMarker
{
    public string MigrationKey { get; set; } = string.Empty;
    public DateTime CompletedAtUtc { get; set; }
}
