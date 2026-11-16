using Microsoft.EntityFrameworkCore;

namespace JamesThew.BillingService.Data;

public sealed class LegacyBillingDbContext(DbContextOptions<LegacyBillingDbContext> options) : DbContext(options)
{
    public DbSet<LegacyUserRecord> Users => Set<LegacyUserRecord>();
    public DbSet<LegacyPaymentRecord> Payments => Set<LegacyPaymentRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LegacyUserRecord>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(user => user.UserId);
        });
        modelBuilder.Entity<LegacyPaymentRecord>(entity =>
        {
            entity.ToTable("Payments");
            entity.HasKey(payment => payment.PaymentId);
        });
    }
}

public sealed class LegacyUserRecord
{
    public int UserId { get; set; }
    public string? SubscriptionPlan { get; set; }
    public decimal? SubscriptionAmount { get; set; }
    public DateTime? SubscriptionStart { get; set; }
    public DateTime? SubscriptionEnd { get; set; }
}

public sealed class LegacyPaymentRecord
{
    public int PaymentId { get; set; }
    public int UserId { get; set; }
    public string PlanType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
