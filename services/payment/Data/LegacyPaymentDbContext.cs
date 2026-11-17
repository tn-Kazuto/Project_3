using Microsoft.EntityFrameworkCore;

namespace JamesThew.PaymentService.Data;

public sealed class LegacyPaymentDbContext(DbContextOptions<LegacyPaymentDbContext> options) : DbContext(options)
{
    public DbSet<LegacyPaymentEntry> Payments => Set<LegacyPaymentEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LegacyPaymentEntry>(entity =>
        {
            entity.ToTable("Payments");
            entity.HasKey(payment => payment.PaymentId);
        });
    }
}

public sealed class LegacyPaymentEntry
{
    public int PaymentId { get; set; }
    public int UserId { get; set; }
    public string PlanType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
